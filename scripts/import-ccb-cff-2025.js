#!/usr/bin/env node
/**
 * Imports the CISO Assistant library "CyberFundamentals 2025 (CyFun)" as the
 * `ccb_cff_2025` framework.
 *
 * Generates:
 *   lib/csc/frameworks/ccb_cff_2025.ts
 *   locales/{en,fr}/csc/ccb_cff_2025.json
 *   public/csc-guidance/{en,fr}/ccb_cff_2025.json (CCB guidance)
 * Updates:
 *   lib/csc/framework-mappings.ts (see scripts/lib/merge-framework-mappings.js)
 *
 * The source also has Dutch, which the platform does not support; locales
 * without a translation fall back to English.
 *
 * Mappings: CyFun 2025 is built on NIST CSF 2.0 and keeps its subcategory ids
 * (GV.OC-01, PR.AA-01, …), so every control maps directly to the NIST CSF 2.0
 * subcategory it belongs to. NIST CSF 2.0 is then the pivot for the transitive
 * mappings to all other frameworks.
 *
 * Usage:
 *   node scripts/import-ccb-cff-2025.js --framework <cyfun2025.yaml>
 *   npx prettier --write lib/csc/frameworks/ccb_cff_2025.ts locales/*\/csc/ccb_cff_2025.json public/csc-guidance/*\/ccb_cff_2025.json
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {
  loadFrameworkIds,
  mergeFrameworkMappings,
} = require('./lib/merge-framework-mappings');

const ROOT = path.resolve(__dirname, '..');
const ISO_KEY = 'ccb_cff_2025';
const ID_PREFIX = 'ccb-cff-2025-';
const LOCALES = ['fr'];

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) {
    console.error(`Missing --${name}`);
    process.exit(1);
  }
  return process.argv[i + 1];
}

const library = yaml.load(fs.readFileSync(arg('framework'), 'utf8'));
const framework = library.objects.framework;
const nodes = framework.requirement_nodes;
const byUrn = new Map(nodes.map((n) => [n.urn, n]));
const referenceControls = new Map(
  library.objects.reference_controls.map((r) => [r.urn, r])
);
const groupDefs = new Map(
  framework.implementation_groups_definition.map((g) => [g.ref_id, g])
);

const controlCode = (n) => n.ref_id;
const controlId = (n) =>
  ID_PREFIX + controlCode(n).toLowerCase().replace(/[.]/g, '-');
const sectionId = (n) => n.ref_id.toLowerCase();
const tr = (n, field, locale) =>
  locale === 'en' ? n[field] : n.translations?.[locale]?.[field];

const sentenceCase = (text, locale) => {
  const lower = text.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
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

// ["I","E","IK","EK"] → ["Important - key measures", "Essential - key measures"]
function levels(n, locale) {
  const groups = n.implementation_groups || [];
  return ['B', 'I', 'E']
    .filter((g) => groups.includes(g))
    .map((g) => {
      const variant = ['K', 'G']
        .map((s) => `${g}${s}`)
        .find((v) => groups.includes(v));
      const name = tr(groupDefs.get(variant || g), 'name', locale);
      return name && sentenceCase(name, locale);
    });
}

function buildLocale(locale) {
  const out = { sections: {}, controls: {} };
  const guidance = { groups: {}, controls: {} };
  for (const s of sections) {
    const name = tr(s, 'name', locale);
    if (name)
      out.sections[sectionId(s)] = { label: sentenceCase(name, locale) };
  }
  for (const n of controls) {
    const subcategory = ancestors(n)[2];
    const reference = referenceControls.get(n.reference_controls?.[0]);
    const title = reference && tr(reference, 'name', locale);
    const lines = [
      tr(subcategory, 'description', locale),
      tr(n, 'description', locale),
    ];
    const levelNames = levels(n, locale);
    // Incomplete translation → leave the key out so i18next falls back to en.
    if (!title || lines.some((l) => !l) || levelNames.some((l) => !l)) {
      continue;
    }

    out.controls[controlId(n)] = {
      code: controlCode(n),
      section: sectionId(ancestors(n)[0]),
      control: title.trim(),
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
    `${locale}: ${Object.keys(out.sections).length} sections, ${Object.keys(out.controls).length}/${controls.length} controls, ${Object.keys(guidance.groups).length} guidance entries`
  );
}

// ── Mappings ──────────────────────────────────────────────────────────────────

const nistIds = loadFrameworkIds().nistcsfv2;
const direct = new Map();
const unmatched = [];
for (const n of controls) {
  const nistId = `nist-csf-v2-${ancestors(n)[2].ref_id.toLowerCase().replace(/\./g, '-')}`;
  if (!nistIds.has(nistId)) {
    unmatched.push(controlCode(n));
    continue;
  }
  direct.set(controlId(n), { nistcsfv2: new Set([nistId]) });
}

const { mapped } = mergeFrameworkMappings({
  isoKey: ISO_KEY,
  title: 'CyFun 2025',
  controlIds: controls.map(controlId),
  direct,
  pivot: 'nistcsfv2',
});
console.error(
  `controls without NIST CSF 2.0 subcategory: ${unmatched.join(', ') || 'none'}`
);
console.error(
  `controls without mapping: ${
    controls
      .filter((n) => !mapped.has(controlId(n)))
      .map(controlCode)
      .join(', ') || 'none'
  }`
);
