#!/usr/bin/env node
/**
 * Merges new_mappings_output.ts into framework-mappings.ts
 *
 * Strategy:
 *  1. Read the existing framework-mappings.ts and eval() the frameworkMappings object
 *  2. Parse new_mappings_output.ts to extract MERGE and NEW entries
 *  3. Apply merges (add new framework keys to existing control entries)
 *  4. Apply additions (add brand-new control entries)
 *  5. Serialize back to TypeScript and write the file
 */

const fs = require('fs');
const path = require('path');

const EXISTING_PATH = path.join(__dirname, '..', 'lib', 'csc', 'framework-mappings.ts');
const NEW_MAPPINGS_PATH = path.join(__dirname, 'new_mappings_output.ts');
const OUTPUT_PATH = EXISTING_PATH; // overwrite in-place

// ── Step 1: Parse the existing framework-mappings.ts ──────────────────

function parseExistingMappings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract the object literal between `const frameworkMappings: FrameworkMappings = {` and the matching `};`
  const startMatch = content.match(/const\s+frameworkMappings\s*:\s*FrameworkMappings\s*=\s*\{/);
  if (!startMatch) throw new Error('Could not find frameworkMappings declaration');

  const startIdx = startMatch.index + startMatch[0].length - 1; // points to the `{`

  // Find the matching closing brace
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx === -1) throw new Error('Could not find closing brace of frameworkMappings');

  const objectStr = content.substring(startIdx, endIdx + 1);

  // Evaluate it as JS (the TS object literal is valid JS)
  // We need to wrap it in parens so it's an expression
  const obj = eval('(' + objectStr + ')');
  return obj;
}

// ── Step 2: Parse the new_mappings_output.ts ──────────────────────────

function parseNewMappings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const merges = {}; // controlId -> { frameworkKey: [...values] }
  const newEntries = {}; // controlId -> { relationship, mappings }

  // Find the split between MERGE and NEW sections
  let newSectionStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('═══ NEW entries')) {
      newSectionStart = i;
      break;
    }
  }

  // Parse MERGE section: extract everything between MERGE markers and eval each block
  const mergeSection = lines.slice(0, newSectionStart !== -1 ? newSectionStart : lines.length).join('\n');
  const mergeRegex = /\/\/\s*MERGE INTO '([^']+)'/g;
  let match;
  const mergePositions = [];
  while ((match = mergeRegex.exec(mergeSection)) !== null) {
    mergePositions.push({ id: match[1], index: match.index });
  }

  for (let i = 0; i < mergePositions.length; i++) {
    const startPos = mergePositions[i].index;
    const endPos = i + 1 < mergePositions.length ? mergePositions[i + 1].index : mergeSection.length;
    const block = mergeSection.substring(startPos, endPos);

    // Extract the key-value lines after the comment
    const blockLines = block.split('\n').slice(1); // skip the comment line
    // Build a JS object string from these lines
    const objStr = '({' + blockLines.join('\n') + '})';
    try {
      const obj = eval(objStr);
      merges[mergePositions[i].id] = obj;
    } catch (e) {
      console.error(`Warning: Could not parse MERGE block for '${mergePositions[i].id}':`, e.message);
    }
  }

  // Parse NEW section: wrap everything in an object and eval
  if (newSectionStart !== -1) {
    // Find the actual entries (skip comment lines after the NEW header)
    let entryStart = newSectionStart + 1;
    while (entryStart < lines.length && (lines[entryStart].trim().startsWith('//') || lines[entryStart].trim() === '')) {
      entryStart++;
    }

    // Find where entries end (before stats comments or end of file)
    let entryEnd = lines.length;
    for (let i = entryStart; i < lines.length; i++) {
      if (lines[i].startsWith('// ── Stats')) {
        entryEnd = i;
        break;
      }
    }

    const newSection = lines.slice(entryStart, entryEnd).join('\n');
    const objStr = '({' + newSection + '})';
    try {
      const obj = eval(objStr);
      Object.assign(newEntries, obj);
    } catch (e) {
      console.error('Warning: Could not parse NEW section:', e.message);
      console.error('First 200 chars:', objStr.substring(0, 200));
    }
  }

  return { merges, newEntries };
}

// ── Step 3: Merge the data ────────────────────────────────────────────

function applyMerges(existing, merges, newEntries) {
  // Apply MERGE entries
  let mergeCount = 0;
  let mergeKeyCount = 0;
  for (const [controlId, frameworkKeys] of Object.entries(merges)) {
    if (!existing[controlId]) {
      console.warn(`MERGE target '${controlId}' not found in existing mappings — adding as new entry`);
      existing[controlId] = { relationship: 'related', mappings: {} };
    }
    for (const [fwKey, values] of Object.entries(frameworkKeys)) {
      if (existing[controlId].mappings[fwKey]) {
        // Merge arrays, deduplicate
        const existingSet = new Set(existing[controlId].mappings[fwKey]);
        for (const v of values) existingSet.add(v);
        existing[controlId].mappings[fwKey] = [...existingSet].sort();
      } else {
        existing[controlId].mappings[fwKey] = [...values].sort();
      }
      mergeKeyCount++;
    }
    mergeCount++;
  }
  console.log(`Applied ${mergeCount} MERGE entries (${mergeKeyCount} framework keys added/updated)`);

  // Apply NEW entries
  let newCount = 0;
  for (const [controlId, entry] of Object.entries(newEntries)) {
    if (existing[controlId]) {
      console.warn(`NEW entry '${controlId}' already exists — merging instead`);
      for (const [fwKey, values] of Object.entries(entry.mappings)) {
        if (existing[controlId].mappings[fwKey]) {
          const existingSet = new Set(existing[controlId].mappings[fwKey]);
          for (const v of values) existingSet.add(v);
          existing[controlId].mappings[fwKey] = [...existingSet].sort();
        } else {
          existing[controlId].mappings[fwKey] = [...values].sort();
        }
      }
    } else {
      existing[controlId] = entry;
    }
    newCount++;
  }
  console.log(`Applied ${newCount} NEW entries`);

  return existing;
}

// ── Step 4: Serialize back to TypeScript ──────────────────────────────

function serializeToTS(mappings) {
  const lines = [];

  // Sort all control IDs for consistent output
  const sortedIds = Object.keys(mappings).sort((a, b) => {
    // Custom sort: group by prefix, then numerically
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Group by prefix for section comments
  let lastPrefix = null;
  const prefixLabels = {
    'iso-2022': 'ISO 27001:2022 controls',
    'iso-2013': 'ISO 27001:2013 controls',
    'nist-csf-v2': 'NIST CSF v2.0 controls',
    'cisv81': 'CIS Controls v8.1',
    'soc2v2': 'SOC 2 v2 controls',
    'c5-2020': 'C5:2020 controls',
    'eu-nis2': 'EU NIS2 controls',
    'gdpr': 'GDPR controls',
    'mvsp': 'MVSP controls',
    'pcidss': 'PCI DSS v4.0.1 controls',
    'iso-42001': 'ISO 42001:2023 controls',
  };

  for (const id of sortedIds) {
    const entry = mappings[id];
    const prefix = getPrefix(id);

    if (prefix !== lastPrefix) {
      if (lastPrefix !== null) lines.push('');
      const label = prefixLabels[prefix] || `${prefix} controls`;
      lines.push(`  // ─── ${label} ${'─'.repeat(Math.max(0, 50 - label.length))}──`);
      lastPrefix = prefix;
    }

    lines.push(`  '${id}': {`);
    lines.push(`    relationship: '${entry.relationship || 'related'}',`);
    lines.push(`    mappings: {`);

    // Sort framework keys
    const fwKeys = Object.keys(entry.mappings).sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    for (const fwKey of fwKeys) {
      const values = entry.mappings[fwKey];
      const sortedValues = [...values].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );

      // Determine if key needs quoting
      const keyStr = needsQuoting(fwKey) ? `'${fwKey}'` : fwKey;

      if (sortedValues.length <= 2) {
        // Single-line format
        const valStr = sortedValues.map((v) => `'${v}'`).join(', ');
        lines.push(`      ${keyStr}: [${valStr}],`);
      } else {
        // Multi-line format
        lines.push(`      ${keyStr}: [`);
        for (const v of sortedValues) {
          lines.push(`        '${v}',`);
        }
        lines.push(`      ],`);
      }
    }

    lines.push(`    },`);
    lines.push(`  },`);
  }

  return lines.join('\n');
}

function getPrefix(id) {
  // Extract framework prefix from control ID
  if (id.startsWith('iso-2022')) return 'iso-2022';
  if (id.startsWith('iso-2013')) return 'iso-2013';
  if (id.startsWith('iso-42001')) return 'iso-42001';
  if (id.startsWith('nist-csf-v2')) return 'nist-csf-v2';
  if (id.startsWith('cisv81')) return 'cisv81';
  if (id.startsWith('soc2v2')) return 'soc2v2';
  if (id.startsWith('c5-2020')) return 'c5-2020';
  if (id.startsWith('eu-nis2')) return 'eu-nis2';
  if (id.startsWith('gdpr')) return 'gdpr';
  if (id.startsWith('mvsp')) return 'mvsp';
  if (id.startsWith('pcidss')) return 'pcidss';
  // Fallback: take everything before the last hyphen-number segment
  const parts = id.split('-');
  return parts.slice(0, -1).join('-') || id;
}

function needsQuoting(key) {
  // Keys that start with a digit or contain special chars need quoting
  return /^\d/.test(key) || /[^a-zA-Z0-9_$]/.test(key);
}

// ── Step 5: Write the output ──────────────────────────────────────────

function writeOutput(mappingsStr, outputPath) {
  const header = `// AUTO-GENERATED by scripts/generate_framework_mappings_from_ciso.py
// Source: CISO Assistant Community mapping YAML files
//
// Auto-mapped frameworks (via CISO Assistant YAML):
//   2022
//   2013
//   nistcsfv2
//   cisv81
//   soc2v2
//   c5_2020
//   pcidss_v401
// Hardcoded frameworks:
//   mvps
//   eunis2
//   gdpr
//   iso42001
//
// To regenerate:
//   python3 scripts/generate_framework_mappings_from_ciso.py \\
//     --ciso-dir /path/to/ciso-assistant-community/backend/library/libraries \\
//     > lib/csc/framework-mappings.ts

import { FrameworkMappings, setMappings } from './framework-mapping-utils';

const frameworkMappings: FrameworkMappings = {
${mappingsStr}
};

// Register mappings with the lazy-load registry
setMappings(frameworkMappings);

export default frameworkMappings;
`;

  fs.writeFileSync(outputPath, header, 'utf8');
  console.log(`Written to ${outputPath}`);
}

// ── Main ──────────────────────────────────────────────────────────────

function main() {
  console.log('Reading existing framework-mappings.ts...');
  const existing = parseExistingMappings(EXISTING_PATH);
  const existingCount = Object.keys(existing).length;
  console.log(`  Found ${existingCount} existing control entries`);

  console.log('Reading new_mappings_output.ts...');
  const { merges, newEntries } = parseNewMappings(NEW_MAPPINGS_PATH);
  console.log(`  Found ${Object.keys(merges).length} MERGE entries`);
  console.log(`  Found ${Object.keys(newEntries).length} NEW entries`);

  console.log('Applying merges and additions...');
  const merged = applyMerges(existing, merges, newEntries);
  const finalCount = Object.keys(merged).length;
  console.log(`  Final count: ${finalCount} control entries (was ${existingCount})`);

  console.log('Serializing to TypeScript...');
  const tsContent = serializeToTS(merged);

  console.log('Writing output...');
  writeOutput(tsContent, OUTPUT_PATH);

  console.log('Done!');
}

main();
