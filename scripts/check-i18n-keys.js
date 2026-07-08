#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT_DIR = path.resolve(__dirname, '..');
const config = require(path.join(ROOT_DIR, 'next-i18next.config.js'));

const DEFAULT_NAMESPACE = 'common';
const SOURCE_LOCALE = config.i18n?.defaultLocale || 'en';
const LOCALES = config.i18n?.locales || [SOURCE_LOCALE];
const LOCALE_PATH = config.localePath || path.join(ROOT_DIR, 'locales');
const SOURCE_ONLY = process.argv.includes('--source-only');
const FAIL_ON_DYNAMIC = process.argv.includes('--fail-on-dynamic');
const SHOW_DYNAMIC = process.argv.includes('--show-dynamic');
const SHOW_DEFAULT_VALUE = process.argv.includes('--show-default-value');
const SHOW_USAGES = process.argv.includes('--show-usages');

const SCAN_ROOTS = ['components', 'pages', 'hooks', 'lib'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  'coverage',
  'generated',
  'node_modules',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getNamespaces() {
  const sourceLocaleDir = path.join(LOCALE_PATH, SOURCE_LOCALE);

  return fs
    .readdirSync(sourceLocaleDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => path.basename(fileName, '.json'))
    .sort();
}

function loadCatalogs(namespaces) {
  const catalogs = new Map();

  for (const locale of LOCALES) {
    const namespaceCatalogs = new Map();

    for (const namespace of namespaces) {
      const filePath = path.join(LOCALE_PATH, locale, `${namespace}.json`);

      if (fs.existsSync(filePath)) {
        namespaceCatalogs.set(namespace, readJson(filePath));
      }
    }

    catalogs.set(locale, namespaceCatalogs);
  }

  return catalogs;
}

function hasKey(catalog, key) {
  if (!catalog) {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(catalog, key)) {
    return true;
  }

  return key.split('.').every((part, index, parts) => {
    const current = parts
      .slice(0, index)
      .reduce((value, pathPart) => value?.[pathPart], catalog);

    return current && Object.prototype.hasOwnProperty.call(current, part);
  });
}

function listSourceFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        listSourceFiles(path.join(dirPath, entry.name), files);
      }

      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(path.join(dirPath, entry.name));
    }
  }

  return files;
}

function getSourceKind(filePath) {
  switch (path.extname(filePath)) {
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.js':
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TS;
  }
}

function getPropertyNameText(name) {
  if (!name) {
    return undefined;
  }

  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }

  return undefined;
}

function getStringLiteralValue(node) {
  if (!node) {
    return undefined;
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  return undefined;
}

function parseNamespaceArgument(node) {
  if (!node) {
    return undefined;
  }

  const namespace = getStringLiteralValue(node);

  if (namespace) {
    return [namespace];
  }

  if (ts.isArrayLiteralExpression(node)) {
    const namespaces = node.elements
      .map(getStringLiteralValue)
      .filter(Boolean);

    if (namespaces.length > 0) {
      return namespaces;
    }
  }

  return undefined;
}

function getObjectStringProperty(node, propertyName) {
  if (!node || !ts.isObjectLiteralExpression(node)) {
    return undefined;
  }

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    if (getPropertyNameText(property.name) !== propertyName) {
      continue;
    }

    return getStringLiteralValue(property.initializer);
  }

  return undefined;
}

function getObjectNamespaceProperty(node) {
  if (!node || !ts.isObjectLiteralExpression(node)) {
    return undefined;
  }

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    if (getPropertyNameText(property.name) !== 'ns') {
      continue;
    }

    return parseNamespaceArgument(property.initializer);
  }

  return undefined;
}

function hasDefaultValueOption(node) {
  if (!node || !ts.isObjectLiteralExpression(node)) {
    return false;
  }

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    if (getPropertyNameText(property.name) !== 'defaultValue') {
      continue;
    }

    return Boolean(getStringLiteralValue(property.initializer));
  }

  return false;
}

function isUseTranslationCall(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'useTranslation'
  );
}

function getUseTranslationInfo(callExpression) {
  const namespaces =
    parseNamespaceArgument(callExpression.arguments[0]) || [DEFAULT_NAMESPACE];
  const keyPrefix = getObjectStringProperty(callExpression.arguments[1], 'keyPrefix');

  return { namespaces, keyPrefix };
}

function getBoundTNames(bindingName) {
  if (ts.isObjectBindingPattern(bindingName)) {
    return bindingName.elements
      .filter((element) => {
        const propertyName = getPropertyNameText(element.propertyName);
        const bindingProperty = propertyName || getPropertyNameText(element.name);

        return bindingProperty === 't' && ts.isIdentifier(element.name);
      })
      .map((element) => element.name.text);
  }

  if (ts.isArrayBindingPattern(bindingName)) {
    const firstElement = bindingName.elements[0];

    if (firstElement && ts.isBindingElement(firstElement) && ts.isIdentifier(firstElement.name)) {
      return [firstElement.name.text];
    }
  }

  return [];
}

function collectTranslationBindings(sourceFile) {
  const tBindings = new Map();
  const namespaceGroups = [];

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      isUseTranslationCall(node.initializer)
    ) {
      const info = getUseTranslationInfo(node.initializer);
      namespaceGroups.push(info.namespaces);

      for (const name of getBoundTNames(node.name)) {
        tBindings.set(name, info);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    fallback: {
      namespaces: namespaceGroups[0] || [DEFAULT_NAMESPACE],
      keyPrefix: undefined,
    },
    tBindings,
  };
}

function getLocation(sourceFile, node) {
  const location = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile)
  );

  return {
    line: location.line + 1,
    column: location.character + 1,
  };
}

function getTCallInfo(node, bindings) {
  if (!ts.isCallExpression(node)) {
    return undefined;
  }

  if (ts.isIdentifier(node.expression)) {
    if (bindings.tBindings.has(node.expression.text)) {
      return bindings.tBindings.get(node.expression.text);
    }

    if (node.expression.text === 't') {
      return bindings.fallback;
    }
  }

  if (
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 't'
  ) {
    return bindings.fallback;
  }

  return undefined;
}

function resolveTranslationReference(key, callExpression, tInfo) {
  const namespaceSeparatorIndex = key.indexOf(':');

  if (namespaceSeparatorIndex > 0) {
    return {
      namespace: key.slice(0, namespaceSeparatorIndex),
      key: key.slice(namespaceSeparatorIndex + 1),
    };
  }

  const optionNamespaces = getObjectNamespaceProperty(callExpression.arguments[1]);
  const namespace = optionNamespaces?.[0] || tInfo.namespaces[0] || DEFAULT_NAMESPACE;
  const resolvedKey = tInfo.keyPrefix ? `${tInfo.keyPrefix}.${key}` : key;

  return { namespace, key: resolvedKey };
}

function collectReferences(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    getSourceKind(filePath)
  );
  const bindings = collectTranslationBindings(sourceFile);
  const references = [];
  const dynamicReferences = [];

  function addReference(node, key, callExpression, tInfo) {
    const location = getLocation(sourceFile, node);

    references.push({
      ...resolveTranslationReference(key, callExpression, tInfo),
      hasDefaultValue: hasDefaultValueOption(callExpression.arguments?.[1]),
      filePath,
      line: location.line,
      column: location.column,
    });
  }

  function visit(node) {
    const tInfo = getTCallInfo(node, bindings);

    if (tInfo) {
      const key = getStringLiteralValue(node.arguments[0]);

      if (key) {
        addReference(node, key, node, tInfo);
      } else {
        const location = getLocation(sourceFile, node);

        dynamicReferences.push({
          filePath,
          line: location.line,
          column: location.column,
          text: node.getText(sourceFile).slice(0, 120),
        });
      }
    }

    if (
      ts.isJsxAttribute(node) &&
      node.name.text === 'i18nKey' &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const fallbackCallExpression = {
        arguments: [],
      };

      addReference(node, node.initializer.text, fallbackCallExpression, bindings.fallback);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return { references, dynamicReferences };
}

function addGroupedIssue(group, issue) {
  const key = `${issue.locale}:${issue.namespace}:${issue.key}`;
  const existingIssue = group.get(key);
  const usage = `${path.relative(ROOT_DIR, issue.filePath)}:${issue.line}:${issue.column}`;

  if (existingIssue) {
    existingIssue.usages.add(usage);
    if (issue.suggestedKey) {
      existingIssue.suggestedKeys.add(issue.suggestedKey);
    }
    return;
  }

  group.set(key, {
    locale: issue.locale,
    namespace: issue.namespace,
    key: issue.key,
    usages: new Set([usage]),
    suggestedKeys: new Set(issue.suggestedKey ? [issue.suggestedKey] : []),
  });
}

function printIssues(title, issues) {
  if (issues.size === 0) {
    return;
  }

  console.log(`\n${title}`);

  for (const issue of issues.values()) {
    console.log(
      `- ${issue.locale}/${issue.namespace}: ${issue.key} (${issue.usages.size} usage${issue.usages.size === 1 ? '' : 's'})`
    );

    if (SHOW_USAGES) {
      for (const usage of issue.usages) {
        console.log(`  ${usage}`);
      }
    }

    if (issue.suggestedKeys.size > 0) {
      console.log(
        `  maybe meant: ${Array.from(issue.suggestedKeys).sort().join(', ')}`
      );
    }
  }
}

function printDynamicReferences(dynamicReferences) {
  if (dynamicReferences.length === 0) {
    return;
  }

  console.log(
    `\nDynamic translation keys were skipped (${dynamicReferences.length}):`
  );

  if (!SHOW_USAGES) {
    console.log('  re-run with --show-dynamic --show-usages to inspect them');
    return;
  }

  for (const reference of dynamicReferences) {
    const relativePath = path.relative(ROOT_DIR, reference.filePath);
    const location = `${relativePath}:${reference.line}:${reference.column}`;

    console.log(`- ${location} ${reference.text}`);
  }
}

function looksLikeRawTextKey(key) {
  return /[A-Z ]|\.{3}|[!?]/.test(key);
}

function normalizeKeyCandidate(key) {
  return key
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getSuggestedKey(reference, catalogs) {
  const normalizedKey = normalizeKeyCandidate(reference.key);

  if (!normalizedKey || normalizedKey === reference.key) {
    return undefined;
  }

  const sourceCatalog = catalogs.get(SOURCE_LOCALE)?.get(reference.namespace);

  if (hasKey(sourceCatalog, normalizedKey)) {
    return normalizedKey;
  }

  return undefined;
}

function getNamespaceSuggestion(reference, catalogs, namespaces) {
  for (const namespace of namespaces) {
    if (namespace === reference.namespace) {
      continue;
    }

    const sourceCatalog = catalogs.get(SOURCE_LOCALE)?.get(namespace);

    if (hasKey(sourceCatalog, reference.key)) {
      return namespace;
    }
  }

  return undefined;
}

function main() {
  const namespaces = getNamespaces();
  const catalogs = loadCatalogs(namespaces);
  const sourceFiles = SCAN_ROOTS.flatMap((root) =>
    listSourceFiles(path.join(ROOT_DIR, root))
  );
  const missingSourceKeys = new Map();
  const missingSourceKeysWithDefaultValue = new Map();
  const likelyWrongSourceKeys = new Map();
  const namespaceMismatchKeys = new Map();
  const missingLocaleKeys = new Map();
  const dynamicReferences = [];

  for (const filePath of sourceFiles) {
    const result = collectReferences(filePath);
    dynamicReferences.push(...result.dynamicReferences);

    for (const reference of result.references) {
      const sourceCatalog = catalogs
        .get(SOURCE_LOCALE)
        ?.get(reference.namespace);
      const sourceHasKey = hasKey(sourceCatalog, reference.key);

      if (!sourceHasKey) {
        const suggestedKey = getSuggestedKey(reference, catalogs);
        const suggestedNamespace = getNamespaceSuggestion(
          reference,
          catalogs,
          namespaces
        );
        const issue = {
          ...reference,
          locale: SOURCE_LOCALE,
          suggestedKey,
          suggestedNamespace,
        };

        if (suggestedNamespace) {
          addGroupedIssue(namespaceMismatchKeys, {
            ...issue,
            suggestedKey: `${suggestedNamespace}:${reference.key}`,
          });
        } else if (suggestedKey || looksLikeRawTextKey(reference.key)) {
          addGroupedIssue(likelyWrongSourceKeys, issue);
        } else if (reference.hasDefaultValue) {
          addGroupedIssue(missingSourceKeysWithDefaultValue, issue);
        } else {
          addGroupedIssue(missingSourceKeys, issue);
        }

        continue;
      }

      if (SOURCE_ONLY) {
        continue;
      }

      for (const locale of LOCALES.filter((item) => item !== SOURCE_LOCALE)) {
        const localeCatalog = catalogs.get(locale)?.get(reference.namespace);

        if (!hasKey(localeCatalog, reference.key)) {
          addGroupedIssue(missingLocaleKeys, {
            ...reference,
            locale,
          });
        }
      }
    }
  }

  printIssues(`Missing keys in source locale (${SOURCE_LOCALE}):`, missingSourceKeys);
  printIssues(
    `Likely namespace mismatch in source locale (${SOURCE_LOCALE}):`,
    namespaceMismatchKeys
  );
  if (SHOW_DEFAULT_VALUE) {
    printIssues(
      `Missing source entries with defaultValue fallback (${SOURCE_LOCALE}):`,
      missingSourceKeysWithDefaultValue
    );
  }
  printIssues(
    `Likely wrong or raw-text keys in source locale (${SOURCE_LOCALE}):`,
    likelyWrongSourceKeys
  );
  printIssues('Missing keys in translated locales:', missingLocaleKeys);
  if (SHOW_DYNAMIC) {
    printDynamicReferences(dynamicReferences);
  }

  if (
    missingSourceKeys.size > 0 ||
    namespaceMismatchKeys.size > 0 ||
    likelyWrongSourceKeys.size > 0 ||
    missingLocaleKeys.size > 0 ||
    (FAIL_ON_DYNAMIC && dynamicReferences.length > 0)
  ) {
    process.exitCode = 1;
    return;
  }

  console.log('All static i18n keys are present.');
}

main();
