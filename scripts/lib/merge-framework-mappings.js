/**
 * Merges direct mappings of an imported framework into
 * lib/csc/framework-mappings.ts:
 *   - keeps the direct mappings (e.g. from CISO Assistant mapping libraries)
 *   - adds transitive mappings through ISO 27001:2022 (pivot) to every
 *     framework the pivot control is already mapped to (GDPR, MVSP, C5, …)
 *   - adds reverse entries so every relation is bidirectional
 *
 * Output is inserted as text (not re-serialised) so existing entries and
 * comments stay untouched; running it again replaces the previous output.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const MAPPINGS_PATH = path.join(ROOT, 'lib/csc/framework-mappings.ts');
const FRAMEWORKS_DIR = path.join(ROOT, 'lib/csc/frameworks');

const FILE_TO_ISO = {
  'c5_2020.ts': 'c5_2020',
  'ccb_cff_2023.ts': 'ccb_cff_2023',
  'cis_v_81.ts': 'cisv81',
  'eu_nis2.ts': 'eunis2',
  'eu_nis2_2024_2690.ts': 'eunis2_2024_2690',
  'gdpr.ts': 'gdpr',
  'iso42001.ts': 'iso42001',
  'iso_2013.ts': 'iso-2013',
  'iso_2022.ts': 'iso-2022',
  'mvsp.ts': 'mvsp',
  'nist_csf_v2.ts': 'nistcsfv2',
  'owasp_asvs_v5.ts': 'owasp_asvs_v5',
  'pcidss_v401.ts': 'pcidss_v401',
  'soc2-v2.ts': 'soc2v2',
};

const frameworkIds = (file) =>
  new Set(
    [
      ...fs
        .readFileSync(path.join(FRAMEWORKS_DIR, file), 'utf8')
        .matchAll(/id: '([^']+)'/g),
    ].map((m) => m[1])
  );

/** Control ids per framework key, read from lib/csc/frameworks/*.ts. */
function loadFrameworkIds() {
  const byIso = {};
  for (const file of fs.readdirSync(FRAMEWORKS_DIR)) {
    if (file === 'index.ts') continue;
    if (!FILE_TO_ISO[file]) throw new Error(`Unknown framework file ${file}`);
    byIso[FILE_TO_ISO[file]] = frameworkIds(file);
  }
  return byIso;
}

const addTo = (map, key, iso, id) => {
  if (!map.has(key)) map.set(key, {});
  (map.get(key)[iso] ||= new Set()).add(id);
};

/**
 * @param {object} opts
 * @param {string} opts.isoKey      framework key, e.g. 'ccb_cff_2023'
 * @param {string} opts.title       section title used as idempotency marker
 * @param {string[]} opts.controlIds imported control ids in framework order
 * @param {Map<string, Record<string, Set<string>>>} opts.direct
 *        imported control id → { targetIso: Set(targetIds) }
 */
function mergeFrameworkMappings({ isoKey, title, controlIds, direct }) {
  const source = fs.readFileSync(MAPPINGS_PATH, 'utf8');
  const START = 'const frameworkMappings: FrameworkMappings = ';
  const bodyStart = source.indexOf(START) + START.length;
  const bodyEnd = source.indexOf('\n};\n', bodyStart) + 2;
  const mappings = Function(`return ${source.slice(bodyStart, bodyEnd)}`)();

  const idsByIso = loadFrameworkIds();
  const isoOf = new Map();
  for (const [iso, ids] of Object.entries(idsByIso)) {
    for (const id of ids) isoOf.set(id, iso);
  }
  const orderOf = new Map(controlIds.map((id, i) => [id, i]));
  const byOrder = (a, b) => orderOf.get(a) - orderOf.get(b);
  const natural = (a, b) => a.localeCompare(b, 'en', { numeric: true });

  // Existing mappings are not always symmetric (e.g. GDPR entries point to
  // ISO 27001:2022 controls without a reverse entry), so pivot neighbours are
  // collected in both directions.
  const pivotNeighbours = new Map();
  for (const [key, entry] of Object.entries(mappings)) {
    for (const [iso, ids] of Object.entries(entry.mappings)) {
      if (iso === isoKey) continue;
      for (const t of ids) {
        if (key.startsWith('iso-2022-')) addTo(pivotNeighbours, key, iso, t);
        if (t.startsWith('iso-2022-') && isoOf.has(key)) {
          addTo(pivotNeighbours, t, isoOf.get(key), key);
        }
      }
    }
  }

  const combined = new Map();
  for (const [id, byIso] of direct) {
    for (const [iso, ids] of Object.entries(byIso)) {
      for (const t of ids) addTo(combined, id, iso, t);
    }
    for (const pivot of byIso['iso-2022'] || []) {
      const neighbours = pivotNeighbours.get(pivot) || {};
      for (const [iso, ids] of Object.entries(neighbours)) {
        if (iso === isoKey || iso === 'iso-2022') continue;
        for (const t of ids) addTo(combined, id, iso, t);
      }
    }
  }

  const escaped = title.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  let text = source
    .replace(
      new RegExp(
        `\\n {2}// ─── ${escaped} controls[\\s\\S]*?// ─── end ${escaped} ─+\\n`
      ),
      '\n'
    )
    .replace(new RegExp(`\\n {6}${isoKey}: \\[[^\\]]*\\],`, 'g'), '');

  const quote = (ids) => `[${ids.map((i) => `'${i}'`).join(', ')}]`;
  const tsKey = (iso) => (/^[a-z][a-z0-9_]*$/i.test(iso) ? iso : `'${iso}'`);
  const entryTs = (id, byIso) =>
    `  '${id}': {\n    relationship: 'related',\n    mappings: {\n` +
    Object.entries(byIso)
      .map(([iso, ids]) => `      ${tsKey(iso)}: ${quote(ids)},\n`)
      .join('') +
    `    },\n  },\n`;

  let pairs = 0;
  const reverse = new Map();
  let block = '';
  for (const id of [...combined.keys()].sort(byOrder)) {
    const out = {};
    for (const [iso, ids] of Object.entries(combined.get(id)).sort()) {
      out[iso] = [...ids].sort(natural);
      for (const t of ids) {
        pairs++;
        addTo(reverse, t, isoKey, id);
      }
    }
    block += entryTs(id, out);
  }

  const missing = [];
  for (const [target, byIso] of reverse) {
    const ids = [...byIso[isoKey]].sort(byOrder);
    const at = text.indexOf(`\n  '${target}': {\n`);
    if (at === -1) {
      missing.push(entryTs(target, { [isoKey]: ids }));
      continue;
    }
    const mapsAt = text.indexOf('\n    mappings: {\n', at);
    const closeAt = text.indexOf('\n    },\n', mapsAt);
    text =
      text.slice(0, closeAt) +
      `\n      ${isoKey}: ${quote(ids)},` +
      text.slice(closeAt);
  }

  const endAt = text.lastIndexOf('\n};\n');
  text =
    text.slice(0, endAt) +
    `\n\n  // ─── ${title} controls ${'─'.repeat(20)}\n` +
    block +
    missing.join('') +
    `  // ─── end ${title} ${'─'.repeat(20)}\n` +
    text.slice(endAt + 1);
  fs.writeFileSync(MAPPINGS_PATH, text);

  console.error(`mapped controls: ${combined.size}/${controlIds.length}`);
  console.error(`pairs (each stored in both directions): ${pairs}`);
  console.error(
    `reverse-updated entries: ${reverse.size} (new target entries: ${missing.length})`
  );
  return { mapped: new Set(combined.keys()) };
}

module.exports = { ROOT, loadFrameworkIds, mergeFrameworkMappings };
