#!/usr/bin/env node
/**
 * Imports the CISO Assistant library "CCB CyberFundamentals Framework -
 * 2023-03-01" as the `ccb_cff_2023` framework and merges its mappings.
 *
 * Generates:
 *   lib/csc/frameworks/ccb_cff_2023.ts
 *   locales/{en,fr}/csc/ccb_cff_2023.json
 *   public/csc-guidance/{en,fr}/ccb_cff_2023.json (CCB guidance)
 * Updates:
 *   lib/csc/framework-mappings.ts (see scripts/lib/merge-framework-mappings.js)
 *
 * The source also has Dutch, which the platform does not support; other
 * locales fall back to English.
 *
 * Usage:
 *   node scripts/import-ccb-cff.js \
 *     --framework <ccb-cff-2023-03-01.yaml> \
 *     --iso27001 <mapping-ccb-cff-2023-03-01-to-iso27001-2022.yaml> \
 *     --nis2 <mapping-annex-technical-and-methodological-requirements-nis2-and-ccb-cff-2023-03-01.yaml>
 *   npx prettier --write lib/csc/framework-mappings.ts lib/csc/frameworks/ccb_cff_2023.ts
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {
  ROOT,
  loadFrameworkIds,
  mergeFrameworkMappings,
} = require('./lib/merge-framework-mappings');

const ISO_KEY = 'ccb_cff_2023';
const ID_PREFIX = 'ccb-cff-';
const LOCALES = ['fr'];
const FRAMEWORK = 'ccb-cff-2023-03-01';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) {
    console.error(`Missing --${name}`);
    process.exit(1);
  }
  return process.argv[i + 1];
}

const load = (p) => yaml.load(fs.readFileSync(p, 'utf8'));

// ── Framework ─────────────────────────────────────────────────────────────────

const framework = load(arg('framework')).objects.framework;
const nodes = framework.requirement_nodes;
const byUrn = new Map(nodes.map((n) => [n.urn, n]));
const groupDefs = new Map(
  framework.implementation_groups_definition.map((g) => [g.ref_id, g])
);

// BASIC_ID.AM-1.1 → ID.AM-1.1 (the prefix is the lowest assurance level,
// which is also expressed by implementation_groups).
const controlCode = (n) => n.ref_id.replace(/^(BASIC|IMPORTANT)_/, '');
const controlId = (n) =>
  ID_PREFIX + controlCode(n).toLowerCase().replace(/[.]/g, '-');
const sectionId = (n) => n.ref_id.toLowerCase();
const tr = (n, field, locale) =>
  locale === 'en' ? n[field] : n.translations?.[locale]?.[field];

const sentenceCase = (text, locale) => {
  const lower = text.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
};
// The French function names are upper case without accents
// (e.g. "PROTEGER (PR)"); restore the accents lost by the upper casing.
const FR_ACCENTS = {
  Proteger: 'Protéger',
  Detecter: 'Détecter',
  Repondre: 'Répondre',
  Retablir: 'Rétablir',
};

const sections = nodes.filter((n) => n.depth === 1);
const controls = nodes.filter((n) => n.assessable);
const ancestors = (n) => {
  const list = [];
  for (let p = byUrn.get(n.parent_urn); p; p = byUrn.get(p.parent_urn)) {
    list.unshift(p);
  }
  return list;
};

// ["B","I","E","BK","IK","EK"] → "Basic - key measures · Important - key …"
function levels(n, locale) {
  const groups = n.implementation_groups || [];
  return ['B', 'I', 'E']
    .filter((g) => groups.includes(g))
    .map((g) => {
      const def = groupDefs.get(groups.includes(`${g}K`) ? `${g}K` : g);
      const name = tr(def, 'name', locale);
      return name && sentenceCase(name, locale);
    });
}

function buildLocale(locale) {
  const out = { sections: {}, controls: {} };
  const guidance = { groups: {}, controls: {} };
  for (const s of sections) {
    const name = tr(s, 'name', locale);
    if (!name) continue;
    const label = sentenceCase(name.replace(/\s*\([A-Z]{2}\)\s*$/, ''), locale);
    out.sections[sectionId(s)] = {
      label: locale === 'fr' ? FR_ACCENTS[label] || label : label,
    };
  }
  for (const n of controls) {
    const [section, category, subcategory] = ancestors(n);
    const categoryName = tr(category, 'name', locale);
    const lines = [
      tr(subcategory, 'description', locale),
      tr(n, 'description', locale),
    ];
    const levelNames = levels(n, locale);
    // Incomplete translation → leave the key out so i18next falls back to en.
    if (!categoryName || lines.some((l) => !l) || levelNames.some((l) => !l)) {
      continue;
    }

    out.controls[controlId(n)] = {
      code: controlCode(n),
      section: sectionId(section),
      control:
        locale === 'en'
          ? sentenceCase(categoryName.trim(), locale)
          : categoryName.trim(),
      requirements: [
        `${subcategory.ref_id}: ${lines[0].trim()}`,
        lines[1].trim(),
        levelNames.join(' · '),
      ].join('\n'),
      implementation_groups: n.implementation_groups,
    };

    const text = tr(n, 'annotation', locale);
    if (text) {
      guidance.groups[controlCode(n)] = {
        code: controlCode(n),
        guidance: text.trim(),
        evidence: '',
      };
      guidance.controls[controlId(n)] = controlCode(n);
    }
  }
  return { out, guidance };
}

const frameworkTs = `export default {
  sections: [
${sections.map((s) => `    { id: '${sectionId(s)}' },`).join('\n')}
  ],
  controls: [
${controls
  .map(
    (n) =>
      `    {\n      id: '${controlId(n)}',\n      sectionId: '${sectionId(ancestors(n)[0])}',\n    },`
  )
  .join('\n')}
  ],
};
`;
fs.writeFileSync(
  path.join(ROOT, `lib/csc/frameworks/${ISO_KEY}.ts`),
  frameworkTs
);

const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};
for (const locale of ['en', ...LOCALES]) {
  const { out, guidance } = buildLocale(locale);
  writeJson(path.join(ROOT, `locales/${locale}/csc/${ISO_KEY}.json`), out);
  writeJson(
    path.join(ROOT, `public/csc-guidance/${locale}/${ISO_KEY}.json`),
    guidance
  );
  console.error(
    `${locale}: ${Object.keys(out.sections).length} sections, ${Object.keys(out.controls).length} controls, ${Object.keys(guidance.groups).length} guidance entries`
  );
}

// ── Mappings ──────────────────────────────────────────────────────────────────

const known = loadFrameworkIds();
known[ISO_KEY] = new Set(controls.map(controlId));

// CISO Assistant node → Unicis control id, or null if not in Unicis.
const convert = {
  [FRAMEWORK]: (node) => {
    const n = byUrn.get(`urn:intuitem:risk:req_node:${FRAMEWORK}:${node}`);
    return n && n.assessable ? [ISO_KEY, controlId(n)] : null;
  },
  'iso27001-2022': (node) => [
    'iso-2022',
    `iso-2022-${node.replace(/\./g, '-')}`,
  ],
  // Same id rules as scripts/import-nis2-implementing-regulation.js; some
  // URNs are malformed (12.5:1 for ref_id 12.5.1), so try both spellings.
  'annex-technical-and-methodological-requirements-nis2': (node) => {
    const base = node.toLowerCase();
    const candidates = [
      base.replace(/:/g, '-p').replace(/\./g, '-'),
      base.replace(/[.:]/g, '-'),
    ].map((c) => `eu-nis2-ir-${c}`);
    const id = candidates.find((c) => known.eunis2_2024_2690.has(c));
    return ['eunis2_2024_2690', id || candidates[0]];
  },
};

const direct = new Map();
const skipped = {};
for (const file of [arg('iso27001'), arg('nis2')]) {
  const objects = load(file).objects;
  const sets = objects.requirement_mapping_sets || [
    objects.requirement_mapping_set,
  ];
  for (const set of sets) {
    for (const rm of set.requirement_mappings) {
      const [a, b] = [rm.source_requirement_urn, rm.target_requirement_urn].map(
        (urn) => {
          const parts = urn.split(':');
          return { fw: parts[4], node: parts.slice(5).join(':') };
        }
      );
      const [ccb, other] = a.fw === FRAMEWORK ? [a, b] : [b, a];
      const source = convert[ccb.fw](ccb.node);
      const target = convert[other.fw](other.node);
      if (!source || !known[target[0]]?.has(target[1])) {
        (skipped[other.fw] ||= new Set()).add(other.node);
        continue;
      }
      if (!direct.has(source[1])) direct.set(source[1], {});
      (direct.get(source[1])[target[0]] ||= new Set()).add(target[1]);
    }
  }
}

const { mapped } = mergeFrameworkMappings({
  isoKey: ISO_KEY,
  title: 'CCB CyberFundamentals 2023-03-01',
  controlIds: controls.map(controlId),
  direct,
});

for (const [fw, s] of Object.entries(skipped)) {
  console.error(`skipped ${fw} targets not in Unicis: ${[...s].join(', ')}`);
}
const unmapped = controls.filter((n) => !mapped.has(controlId(n)));
console.error(
  `controls without mapping: ${unmapped.map(controlCode).join(', ') || 'none'}`
);
