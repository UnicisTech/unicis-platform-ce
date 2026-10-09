#!/usr/bin/env node
/**
 * Imports the CISO Assistant library
 *   "NIS2 - Annex to the Commission Implementing Regulation 2024/2690
 *    with Technical Implementation Guidance by ENISA"
 * as the `eunis2_2024_2690` framework and merges its mappings.
 *
 * Generates:
 *   lib/csc/frameworks/eu_nis2_2024_2690.ts
 *   locales/{en,de,fr,es,it}/csc/eunis2_2024_2690.json
 *   public/csc-guidance/{en,de,fr,es,it}/eunis2_2024_2690.json (ENISA guidance)
 * Updates:
 *   lib/csc/framework-mappings.ts
 *     - direct mappings to iso-2022 (Annex A only) and nistcsfv2 from the
 *       ENISA/CISO Assistant mapping libraries
 *     - transitive mappings through ISO 27001:2022 (pivot) to every framework
 *       the pivot control is already mapped to (GDPR, MVSP, C5, SOC2, …)
 *     - reverse mappings so every relation is bidirectional
 *
 * Locales without a translation in the source are not generated; i18next
 * falls back to English.
 *
 * Usage:
 *   node scripts/import-nis2-implementing-regulation.js \
 *     --framework <annex-nis2-regulation--2024-2690-...yaml> \
 *     --iso27001 <mapping-...-nis2-and-iso27001-2022.yaml> \
 *     --nist <mapping-...-nis2-and-nist-csf-2.0.yaml>
 *   npx prettier --write lib/csc/framework-mappings.ts lib/csc/frameworks/eu_nis2_2024_2690.ts
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {
  loadFrameworkIds,
  mergeFrameworkMappings,
} = require('./lib/merge-framework-mappings');

const ISO_KEY = 'eunis2_2024_2690';
const ID_PREFIX = 'eu-nis2-ir-';
const LOCALES = ['de', 'fr', 'es', 'it'];
const NODE_PREFIX =
  'urn:intuitem:risk:req_node:annex-technical-and-methodological-requirements-nis2:';
const ROOT = path.resolve(__dirname, '..');

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

const nodes = load(arg('framework')).objects.framework.requirement_nodes;
const byUrn = new Map(nodes.map((n) => [n.urn, n]));

const nodeKey = (n) => n.urn.slice(NODE_PREFIX.length); // e.g. 1.1.1.a, 4.3.2:1
// Prefer ref_id: some URNs are malformed (e.g. `12.5:1` for ref_id 12.5.1).
// Nodes without ref_id (4.3.2:1, 5.2:1) fall back to the URN suffix.
const controlId = (n) =>
  ID_PREFIX +
  (n.ref_id || nodeKey(n))
    .trim()
    .toLowerCase()
    .replace(/:/g, '-p')
    .replace(/\./g, '-');
const controlCode = (n) => {
  if (n.ref_id) return n.ref_id.trim();
  const [parent, idx] = nodeKey(n).split(':');
  return `${parent} (${idx})`;
};
const ancestors = (n) => {
  const list = [];
  for (let p = byUrn.get(n.parent_urn); p; p = byUrn.get(p.parent_urn)) {
    list.unshift(p);
  }
  return list;
};
const tr = (n, field, locale) =>
  locale === 'en' ? n[field] : n.translations?.[locale]?.[field];

// The source flags two leaf requirements as non-assessable (3.6.3 and
// 13.1.2.e) although they are obligations like their siblings; include every
// leaf requirement that has a description.
const isControl = (n) =>
  n.depth > 1 &&
  (n.assessable ||
    (n.description && !nodes.some((c) => c.parent_urn === n.urn)));

const sections = nodes.filter((n) => n.depth === 1);
const controls = nodes.filter(isControl);

// Chapter names look like
//   "RISK MANAGEMENT POLICY (ARTICLE 21(2), POINT (A) OF DIRECTIVE (EU) 2022/2555)"
// Split them into a section label ("Risk management policy") and the article
// reference used as control name ("Article 21(2), point (a)"), matching the
// sentence-case style of the other frameworks. German keeps its casing
// because nouns are capitalised.
const sentenceCase = (text, locale) => {
  if (locale === 'de') return text;
  const lower = text.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
};
function splitChapterName(name, locale) {
  // Bracket counting is unreliable ("(ARTICOLO 21, … LETTERA A), …)"), so
  // locate the reference by its leading "Article" keyword instead.
  const match = [
    ...name.matchAll(/[([]\s*(article|artikel|artículo|articolo)\b/gi),
  ].pop();
  if (!match) throw new Error(`No article reference in "${name}"`);
  const start = match.index;
  const title = name.slice(0, start).trim();
  const reference = name
    .slice(start + 1)
    .replace(/[)\]]\s*$/, '')
    .replace(
      /,?\s+(of|der|de la|della)\s+(directive|richtlinie|directiva|direttiva)\b.*$/i,
      ''
    )
    .trim();
  return {
    label:
      title === title.toLocaleUpperCase(locale)
        ? sentenceCase(title, locale)
        : title,
    reference: sentenceCase(reference, locale),
  };
}

function buildLocale(locale) {
  const out = { sections: {}, controls: {} };
  const guidance = { groups: {}, controls: {} };
  const references = {};
  for (const s of sections) {
    const name = tr(s, 'name', locale);
    if (!name) continue;
    const { label, reference } = splitChapterName(name, locale);
    out.sections[`section-${s.ref_id.trim()}`] = { label };
    references[s.urn] = reference;
  }
  for (const n of controls) {
    const chain = [...ancestors(n), n];
    const section = chain[0];
    const titled = [...chain].reverse().find((x) => x.depth > 1 && x.name);
    const guided = [...chain].reverse().find((x) => x.annotation);
    // The sub-topic (e.g. "Risk management framework") leads the requirements.
    const requirements = [
      ...(titled ? [titled] : []),
      ...chain.filter((x) => x.depth > 1 && x.description),
    ].map((x) =>
      x === titled ? tr(x, 'name', locale) : tr(x, 'description', locale)
    );
    const control = references[section.urn];
    // Incomplete translation → leave the key out so i18next falls back to en.
    if (!control || requirements.some((r) => !r)) continue;

    out.controls[controlId(n)] = {
      code: controlCode(n),
      section: `section-${section.ref_id.trim()}`,
      control,
      requirements: requirements.join('\n'),
    };

    const text = guided && tr(guided, 'annotation', locale);
    if (text) {
      const group = controlCode(guided);
      guidance.groups[group] ||= {
        code: group,
        guidance: text.trim(),
        evidence: (tr(guided, 'typical_evidence', locale) || '').trim(),
      };
      guidance.controls[controlId(n)] = group;
    }
  }
  return { out, guidance };
}

const frameworkTs = `export default {
  sections: [
${sections.map((s) => `    { id: 'section-${s.ref_id.trim()}' },`).join('\n')}
  ],
  controls: [
${controls
  .map(
    (n) =>
      `    {\n      id: '${controlId(n)}',\n      sectionId: 'section-${ancestors(n)[0].ref_id.trim()}',\n    },`
  )
  .join('\n')}
  ],
};
`;
fs.writeFileSync(
  path.join(ROOT, 'lib/csc/frameworks/eu_nis2_2024_2690.ts'),
  frameworkTs
);

// ENISA guidance is large (~300 KB per locale), so it is served as a static
// file fetched on demand instead of being part of the i18n namespace that is
// embedded in page props.
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
    `${locale}: ${Object.keys(out.sections).length} sections, ${Object.keys(out.controls).length} controls, ${Object.keys(guidance.groups).length} guidance groups`
  );
}

// ── Mappings ──────────────────────────────────────────────────────────────────

const known = loadFrameworkIds();
const controlIds = new Set(controls.map(controlId));

const convertTarget = {
  'iso27001-2022': (node) => [
    'iso-2022',
    `iso-2022-${node.replace(/\./g, '-')}`,
  ],
  'nist-csf-2.0': (node) => [
    'nistcsfv2',
    `nist-csf-v2-${node.replace('.', '-')}`,
  ],
};

const direct = new Map(); // nis2 id → { iso: Set(ids) }
const skipped = {};
for (const file of [arg('iso27001'), arg('nist')]) {
  const sets = load(file).objects.requirement_mapping_sets;
  for (const set of sets) {
    for (const rm of set.requirement_mappings) {
      let [nisUrn, otherUrn] = [
        rm.source_requirement_urn,
        rm.target_requirement_urn,
      ];
      if (!nisUrn.startsWith(NODE_PREFIX))
        [nisUrn, otherUrn] = [otherUrn, nisUrn];
      const nisNode = byUrn.get(nisUrn);
      const parts = otherUrn.split(':');
      const [iso, targetId] = convertTarget[parts[4]](parts.slice(5).join(':'));
      if (
        !nisNode ||
        !controlIds.has(controlId(nisNode)) ||
        !known[iso].has(targetId)
      ) {
        (skipped[iso] ||= new Set()).add(parts.slice(5).join(':'));
        continue;
      }
      const id = controlId(nisNode);
      if (!direct.has(id)) direct.set(id, {});
      (direct.get(id)[iso] ||= new Set()).add(targetId);
    }
  }
}

const { mapped } = mergeFrameworkMappings({
  isoKey: ISO_KEY,
  title: 'EU NIS2 Implementing Regulation 2024/2690',
  controlIds: controls.map(controlId),
  direct,
});

for (const [iso, s] of Object.entries(skipped)) {
  console.error(`skipped ${iso} targets not in Unicis: ${[...s].join(', ')}`);
}
const unmapped = controls.filter((n) => !mapped.has(controlId(n)));
console.error(
  `controls without mapping: ${unmapped.map(controlCode).join(', ')}`
);
