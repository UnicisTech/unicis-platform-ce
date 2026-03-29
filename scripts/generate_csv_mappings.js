#!/usr/bin/env node
/**
 * Generates framework mapping entries from NIST CSF 2.0 CSV mappings.
 * Parses CSV, resolves control IDs against platform JSON files,
 * builds bidirectional mappings, and outputs TypeScript.
 */

const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────────
const CSV_PATH = '/Users/pece/Downloads/nist-csf-mappings.csv';
const BASE = '/Users/pece/dev/unicis-tech/unicis-platform';
const PCIDSS_JSON = path.join(BASE, 'locales/en/csc/pcidss_v401.json');
const ISO2022_JSON = path.join(BASE, 'locales/en/csc/2022.json');
const CISV81_JSON = path.join(BASE, 'locales/en/csc/cisv81.json');
const FMAPPINGS_TS = path.join(BASE, 'lib/csc/framework-mappings.ts');
const OUTPUT_PATH = path.join(BASE, 'scripts/new_mappings_output.ts');

// ── Load platform control IDs ──────────────────────────────────────────
const pcidssControls = Object.keys(require(PCIDSS_JSON).controls);
const iso2022Controls = Object.keys(require(ISO2022_JSON).controls);
const cisv81Controls = Object.keys(require(CISV81_JSON).controls);

// ── Load existing top-level keys from framework-mappings.ts ────────────
const fmContent = fs.readFileSync(FMAPPINGS_TS, 'utf8');
const existingKeys = new Set();
for (const line of fmContent.split('\n')) {
  const m = line.match(/^  '([^']+)':\s*\{/);
  if (m) existingKeys.add(m[1]);
}

// Also extract existing mappings so we can merge
const existingMappings = {};
{
  // Parse the existing file to extract mappings for each control
  const controlRegex = /^  '([^']+)':\s*\{/;
  const mappingKeyRegex = /^\s+([\w']+):\s*\[/;
  const valueRegex = /'([^']+)'/g;
  const lines = fmContent.split('\n');
  let currentControl = null;
  let currentMappingKey = null;
  let inMappings = false;
  let bracketDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cm = line.match(controlRegex);
    if (cm) {
      currentControl = cm[1];
      existingMappings[currentControl] = {};
      bracketDepth = 1;
      inMappings = false;
      continue;
    }
    if (currentControl) {
      if (line.match(/^\s+mappings:\s*\{/)) {
        inMappings = true;
        continue;
      }
      if (inMappings) {
        const mkm = line.match(/^\s+([\w']+):\s*\[/);
        if (mkm) {
          currentMappingKey = mkm[1].replace(/'/g, '');
          existingMappings[currentControl][currentMappingKey] = [];
          // Extract values on same line
          let m2;
          while ((m2 = valueRegex.exec(line.slice(line.indexOf('['))))) {
            existingMappings[currentControl][currentMappingKey].push(m2[1]);
          }
          valueRegex.lastIndex = 0;
          // Check if array closes on same line
          if (line.includes('],')) {
            currentMappingKey = null;
          }
          continue;
        }
        if (currentMappingKey) {
          let m2;
          while ((m2 = valueRegex.exec(line))) {
            existingMappings[currentControl][currentMappingKey].push(m2[1]);
          }
          valueRegex.lastIndex = 0;
          if (line.includes('],') || line.trim() === '],') {
            currentMappingKey = null;
          }
          continue;
        }
        if (line.match(/^\s+\},/)) {
          inMappings = false;
          continue;
        }
      }
      if (line.match(/^\s+\},/) && !inMappings) {
        currentControl = null;
      }
    }
  }
}

// ── CSV parsing (simple quoted CSV) ────────────────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
const csvLines = csvContent.split('\n').filter(l => l.trim());
const headers = parseCSVLine(csvLines[0]);
const rows = csvLines.slice(1).map(l => {
  const fields = parseCSVLine(l);
  const obj = {};
  headers.forEach((h, i) => { obj[h] = fields[i] || ''; });
  return obj;
});

// ── Control ID conversion helpers ──────────────────────────────────────

function nistToControlId(code) {
  // GV.OC-01 → nist-csf-v2-gv-oc-01
  return 'nist-csf-v2-' + code.toLowerCase().replace(/\./g, '-').replace(/-/g, '-');
}

function extractPciReq(text) {
  // "Req 12.1 - description (priority)" → "12.1"
  // "Req 12.8 and 12.9 - ..." → ["12.8", "12.9"]
  if (!text || text === 'Not mapped') return [];
  const results = [];
  // Handle "Req X.Y and X.Z" pattern
  const andMatch = text.match(/Req\s+([\d.]+)\s+and\s+([\d.]+)/);
  if (andMatch) {
    results.push(andMatch[1], andMatch[2]);
  } else {
    const match = text.match(/Req\s+([\d.]+)/);
    if (match) results.push(match[1]);
  }
  return results;
}

function resolvepcidss(reqNum) {
  // reqNum like "12.1" → find all pcidss controls starting with "pcidss-12-1-"
  const prefix = 'pcidss-' + reqNum.replace(/\./g, '-');
  return pcidssControls.filter(id => id === prefix || id.startsWith(prefix + '-'));
}

function extractIso2022(text) {
  // "5.1 - Information security policies (high)" → "5.1"
  // "5.31 - Legal..." → "5.31"
  if (!text || text === 'Not mapped') return [];
  const results = [];
  // Could have multiple refs separated by commas within the text - but looking at CSV it's single
  const match = text.match(/^([\d.]+)\s*-/);
  if (match) results.push(match[1]);
  // Also handle A.X.Y format
  const matchA = text.match(/^A\.([\d.]+)\s*-/);
  if (matchA) results.push(matchA[1]);
  return results;
}

function resolveIso2022(refNum) {
  // refNum like "5.1" → "iso-2022-a-5-1"
  const id = 'iso-2022-a-' + refNum.replace(/\./g, '-');
  if (iso2022Controls.includes(id)) return [id];
  // Try prefix match
  return iso2022Controls.filter(c => c === id || c.startsWith(id + '-'));
}

function extractCis(text) {
  // Returns array of { type: 'control'|'specific'|'safeguard', num: string }
  if (!text || text === 'Not mapped') return [];
  const results = [];
  // Handle multiple comma-separated refs like "CIS Control 15.15.1, CIS Control 15.15.3 (high)"
  // or "CIS Control 1.1.1, CIS Control 3.3.5 (high)"
  // Patterns:
  // "Control X - ... (priority)" → broad control X
  // "CIS Control X.X.X (priority)" → specific
  // "CIS Safeguard X.X (priority)" → specific safeguard

  // Split by comma to handle multiple
  const parts = text.split(',').map(p => p.trim());

  for (const part of parts) {
    // "CIS Safeguard X.Y" pattern
    const safeguardMatch = part.match(/CIS Safeguard\s+([\d.]+)/);
    if (safeguardMatch) {
      results.push({ type: 'specific', num: safeguardMatch[1] });
      continue;
    }

    // "CIS Control X.X.X" pattern (specific)
    const specificMatch = part.match(/CIS Control\s+([\d.]+)/);
    if (specificMatch) {
      results.push({ type: 'specific', num: specificMatch[1] });
      continue;
    }

    // "Control X - Description (priority)" pattern (broad)
    const broadMatch = part.match(/^Control\s+(\d+)\s*-/);
    if (broadMatch) {
      results.push({ type: 'broad', num: broadMatch[1] });
      continue;
    }
  }

  return results;
}

function resolveCis(ref) {
  if (ref.type === 'broad') {
    // Control X → all cisv81-X-*
    const prefix = 'cisv81-' + ref.num + '-';
    return cisv81Controls.filter(id => id.startsWith(prefix));
  } else {
    // CIS Control X.Y.Z or CIS Safeguard X.Y
    // X.Y.Z → cisv81-X-Y (the first two parts)
    // Actually looking at data: "CIS Control 14.14.1" and platform has "cisv81-14-1" etc.
    // The format "X.Y.Z" where X is the control group, second num is the safeguard
    // "CIS Control 1.1.1" → cisv81-1-1
    // "CIS Control 15.15.2" → cisv81-15-2
    // "CIS Safeguard 2.6" → cisv81-2-6
    const parts = ref.num.split('.');
    let id;
    if (parts.length >= 2) {
      // For "X.Y.Z" pattern like "14.14.1" → cisv81-14-1 (group-safeguard)
      // For "X.Y" pattern like "2.6" → cisv81-2-6
      if (parts.length === 3) {
        // X.X.Y format: first number is group, third is safeguard number
        id = 'cisv81-' + parts[0] + '-' + parts[2];
      } else {
        id = 'cisv81-' + parts[0] + '-' + parts[1];
      }
    } else {
      id = 'cisv81-' + parts[0];
    }
    if (cisv81Controls.includes(id)) return [id];
    // Fallback: try prefix
    return cisv81Controls.filter(c => c.startsWith(id));
  }
}

// ── Build new mappings ─────────────────────────────────────────────────
// newMappings[controlId][frameworkKey] = Set of control IDs
const newMappings = {};

function addMapping(sourceId, fwKey, targetIds) {
  if (!targetIds || targetIds.length === 0) return;
  if (!newMappings[sourceId]) newMappings[sourceId] = {};
  if (!newMappings[sourceId][fwKey]) newMappings[sourceId][fwKey] = new Set();
  for (const t of targetIds) {
    newMappings[sourceId][fwKey].add(t);
  }
}

// Process CSV rows
for (const row of rows) {
  const nistCode = row['NIST CSF 2.0'];
  if (!nistCode || nistCode.startsWith('UNMAPPED')) continue; // skip unmapped rows for NIST→others

  const nistId = nistToControlId(nistCode);

  // PCI DSS
  const pciRefs = extractPciReq(row['PCI DSS 4.0.1']);
  const pciIds = [];
  for (const ref of pciRefs) {
    pciIds.push(...resolvepcidss(ref));
  }
  if (pciIds.length > 0) {
    // NIST → PCI DSS
    addMapping(nistId, 'pcidss_v401', pciIds);
    // PCI DSS → NIST (bidirectional)
    for (const pid of pciIds) {
      addMapping(pid, 'nistcsfv2', [nistId]);
    }
  }

  // ISO 27001:2022
  const isoRefs = extractIso2022(row['ISO 27001:2022']);
  const isoIds = [];
  for (const ref of isoRefs) {
    isoIds.push(...resolveIso2022(ref));
  }
  if (isoIds.length > 0) {
    // NIST → ISO
    addMapping(nistId, '2022', isoIds);
    // ISO → NIST (bidirectional)
    for (const iid of isoIds) {
      addMapping(iid, 'nistcsfv2', [nistId]);
    }
  }

  // CIS Controls
  const cisRefs = extractCis(row['CIS Controls v8.1']);
  const cisIds = [];
  for (const ref of cisRefs) {
    cisIds.push(...resolveCis(ref));
  }
  if (cisIds.length > 0) {
    // NIST → CIS
    addMapping(nistId, 'cisv81', cisIds);
    // CIS → NIST (bidirectional)
    for (const cid of cisIds) {
      addMapping(cid, 'nistcsfv2', [nistId]);
    }
  }

  // Also build PCI DSS ↔ ISO 27001 and PCI DSS ↔ CIS and ISO ↔ CIS cross-mappings
  if (pciIds.length > 0 && isoIds.length > 0) {
    for (const pid of pciIds) {
      addMapping(pid, '2022', isoIds);
    }
    for (const iid of isoIds) {
      addMapping(iid, 'pcidss_v401', pciIds);
    }
  }
  if (pciIds.length > 0 && cisIds.length > 0) {
    for (const pid of pciIds) {
      addMapping(pid, 'cisv81', cisIds);
    }
    for (const cid of cisIds) {
      addMapping(cid, 'pcidss_v401', pciIds);
    }
  }
  if (isoIds.length > 0 && cisIds.length > 0) {
    for (const iid of isoIds) {
      addMapping(iid, 'cisv81', cisIds);
    }
    for (const cid of cisIds) {
      addMapping(cid, '2022', isoIds);
    }
  }
}

// Process UNMAPPED rows too (for non-NIST mappings between PCI/ISO/CIS)
for (const row of rows) {
  const nistCode = row['NIST CSF 2.0'];
  if (!nistCode) continue;

  // For UNMAPPED rows, process cross-framework mappings
  if (nistCode.startsWith('UNMAPPED')) {
    const pciRefs = extractPciReq(row['PCI DSS 4.0.1']);
    const pciIds = [];
    for (const ref of pciRefs) {
      pciIds.push(...resolvepcidss(ref));
    }

    const isoRefs = extractIso2022(row['ISO 27001:2022']);
    const isoIds = [];
    for (const ref of isoRefs) {
      isoIds.push(...resolveIso2022(ref));
    }

    const cisRefs = extractCis(row['CIS Controls v8.1']);
    const cisIds = [];
    for (const ref of cisRefs) {
      cisIds.push(...resolveCis(ref));
    }

    if (pciIds.length > 0 && isoIds.length > 0) {
      for (const pid of pciIds) addMapping(pid, '2022', isoIds);
      for (const iid of isoIds) addMapping(iid, 'pcidss_v401', pciIds);
    }
    if (pciIds.length > 0 && cisIds.length > 0) {
      for (const pid of pciIds) addMapping(pid, 'cisv81', cisIds);
      for (const cid of cisIds) addMapping(cid, 'pcidss_v401', pciIds);
    }
    if (isoIds.length > 0 && cisIds.length > 0) {
      for (const iid of isoIds) addMapping(iid, 'cisv81', cisIds);
      for (const cid of cisIds) addMapping(cid, '2022', isoIds);
    }
  }
}

// ── Add ISO 27001:2022 ↔ ISO 42001:2023 hardcoded mappings ────────────
const iso42001Mappings = [
  {
    iso42001: ['iso42001-6-1', 'iso42001-8-2', 'iso42001-8-3'],
    iso2022: ['iso-2022-a-5-1'],
  },
  {
    iso42001: ['iso42001-a-7-2', 'iso42001-a-7-3', 'iso42001-a-7-4', 'iso42001-a-7-5', 'iso42001-a-7-6'],
    iso2022: ['iso-2022-a-5-12', 'iso-2022-a-5-13', 'iso-2022-a-8-10', 'iso-2022-a-8-11', 'iso-2022-a-8-12'],
  },
  {
    iso42001: ['iso42001-a-5-2', 'iso42001-a-5-3', 'iso42001-a-5-4', 'iso42001-a-5-5', 'iso42001-8-4'],
    iso2022: ['iso-2022-a-5-29', 'iso-2022-a-5-30'],
  },
  {
    iso42001: ['iso42001-a-6-2-7', 'iso42001-a-6-2-8', 'iso42001-a-8-2'],
    iso2022: ['iso-2022-a-8-15', 'iso-2022-a-8-16', 'iso-2022-a-8-17'],
  },
  {
    iso42001: ['iso42001-a-10-2', 'iso42001-a-10-3', 'iso42001-a-10-4'],
    iso2022: ['iso-2022-a-5-19', 'iso-2022-a-5-20', 'iso-2022-a-5-21', 'iso-2022-a-5-22'],
  },
  {
    iso42001: ['iso42001-9-3-1', 'iso42001-9-3-2', 'iso42001-9-3-3'],
    iso2022: ['iso-2022-a-5-35', 'iso-2022-a-5-36'],
  },
];

for (const group of iso42001Mappings) {
  for (const ai of group.iso42001) {
    addMapping(ai, '2022', group.iso2022);
  }
  for (const iso of group.iso2022) {
    addMapping(iso, 'iso42001', group.iso42001);
  }
}

// ── Merge with existing mappings ───────────────────────────────────────
// For controls that already exist in framework-mappings.ts, we need to
// identify which framework keys are NEW vs already present.
// We'll output:
// 1. For existing controls: only new framework keys (not already present)
// 2. For new controls: full entry

const output = [];
const processedIds = new Set();

// Sort control IDs for consistent output
const allNewIds = Object.keys(newMappings).sort();

// Separate into: controls needing merge vs new controls
const mergeEntries = [];
const brandNewEntries = [];

for (const controlId of allNewIds) {
  const fwMappings = newMappings[controlId];

  if (existingKeys.has(controlId)) {
    // Check which framework keys are truly new
    const existingFw = existingMappings[controlId] || {};
    const newFwKeys = {};

    for (const [fwKey, idSet] of Object.entries(fwMappings)) {
      const existingIds = new Set(existingFw[fwKey] || []);
      const brandNewIds = [...idSet].filter(id => !existingIds.has(id));

      if (!existingFw[fwKey]) {
        // Entirely new framework key for this control
        newFwKeys[fwKey] = [...idSet].sort();
      } else if (brandNewIds.length > 0) {
        // Existing key but new IDs to add
        newFwKeys[fwKey] = brandNewIds.sort();
      }
    }

    if (Object.keys(newFwKeys).length > 0) {
      mergeEntries.push({ controlId, newFwKeys, isPartialMerge: true });
    }
  } else {
    // Brand new control
    const mappings = {};
    for (const [fwKey, idSet] of Object.entries(fwMappings)) {
      mappings[fwKey] = [...idSet].sort();
    }
    brandNewEntries.push({ controlId, mappings });
  }
}

// ── Generate TypeScript output ─────────────────────────────────────────
let ts = '';

ts += '// ──────────────────────────────────────────────────────────────────\n';
ts += '// NEW MAPPINGS generated from NIST CSF 2.0 ↔ PCI DSS 4.0.1 ↔ ISO 27001:2022 ↔ CIS Controls v8.1 CSV\n';
ts += '// and ISO 27001:2022 ↔ ISO 42001:2023 hardcoded mappings\n';
ts += '//\n';
ts += '// Instructions:\n';
ts += '//   - MERGE entries: These controls already exist in framework-mappings.ts.\n';
ts += '//     Add the listed framework keys/values to their existing mappings object.\n';
ts += '//   - NEW entries: These are brand new controls to add to the frameworkMappings object.\n';
ts += '// ──────────────────────────────────────────────────────────────────\n\n';

function formatMappingValue(key, values) {
  const quotedKey = /^\d/.test(key) || key.includes('-') ? `'${key}'` : key;
  if (values.length <= 2) {
    return `      ${quotedKey}: [${values.map(v => `'${v}'`).join(', ')}],`;
  }
  let s = `      ${quotedKey}: [\n`;
  for (const v of values) {
    s += `        '${v}',\n`;
  }
  s += `      ],`;
  return s;
}

if (mergeEntries.length > 0) {
  ts += '// ═══ MERGE these into existing entries ═══════════════════════════\n';
  ts += `// (${mergeEntries.length} existing controls need additional framework mappings)\n\n`;

  for (const entry of mergeEntries) {
    ts += `  // MERGE INTO '${entry.controlId}' — add these framework keys to its mappings:\n`;
    for (const [fwKey, values] of Object.entries(entry.newFwKeys)) {
      ts += formatMappingValue(fwKey, values) + '\n';
    }
    ts += '\n';
  }
}

if (brandNewEntries.length > 0) {
  ts += '\n// ═══ NEW entries to add to frameworkMappings ═════════════════════\n';
  ts += `// (${brandNewEntries.length} new controls)\n\n`;

  for (const entry of brandNewEntries) {
    ts += `  '${entry.controlId}': {\n`;
    ts += `    relationship: 'related',\n`;
    ts += `    mappings: {\n`;

    // Sort framework keys for consistent output
    const fwKeys = Object.keys(entry.mappings).sort();
    for (const fwKey of fwKeys) {
      ts += formatMappingValue(fwKey, entry.mappings[fwKey]) + '\n';
    }

    ts += `    },\n`;
    ts += `  },\n`;
  }
}

// Stats
const stats = {
  csvRows: rows.length,
  totalNewControls: brandNewEntries.length,
  totalMergeControls: mergeEntries.length,
  newMappingEntries: Object.keys(newMappings).length,
};

ts += `\n// ── Stats ──────────────────────────────────────────────────────────\n`;
ts += `// CSV rows processed: ${stats.csvRows}\n`;
ts += `// New controls (brand new entries): ${stats.totalNewControls}\n`;
ts += `// Existing controls needing merge: ${stats.totalMergeControls}\n`;
ts += `// Total controls with mappings: ${stats.newMappingEntries}\n`;

fs.writeFileSync(OUTPUT_PATH, ts, 'utf8');
console.log(`Output written to ${OUTPUT_PATH}`);
console.log(`Stats: ${JSON.stringify(stats, null, 2)}`);
