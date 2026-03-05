#!/usr/bin/env node
/**
 * Script to add NIS2 bidirectional mappings to framework-mappings.ts
 *
 * Based on: https://github.com/skrypnikau/compliance-notes/tree/master/frameworks
 *
 * Part 1: Create NIS2 top-level control entries with NIST CSF 2.0, GDPR, and ISO 2022 mappings
 * Part 2: Add `eunis2` reverse entries to NIST CSF 2.0 controls
 * Part 3: Add `eunis2` reverse entries to GDPR controls
 * Part 4: Add `eunis2` reverse entries to ISO 2022 controls
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../lib/csc/framework-mappings.ts');
let content = fs.readFileSync(filePath, 'utf8');

// ============================================================================
// NIS2 control definitions with mappings to NIST CSF 2.0, GDPR, ISO 2022
// Based on: https://github.com/skrypnikau/compliance-notes/tree/master/frameworks
// ============================================================================

const nis2Controls = {
  'eu-nis2-21-2-a': {
    comment:
      'Art. 21(2)(a) - Policies on risk analysis and information system security',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-gv-oc-01',
        'nist-csf-v2-gv-rm-01',
        'nist-csf-v2-gv-rm-02',
        'nist-csf-v2-id-ra-01',
        'nist-csf-v2-id-ra-02',
        'nist-csf-v2-id-ra-03',
        'nist-csf-v2-id-ra-04',
        'nist-csf-v2-id-ra-05',
        'nist-csf-v2-id-ra-06',
      ],
      2022: ['iso-2022-a-5-1', 'iso-2022-a-5-2', 'iso-2022-a-5-4'],
      gdpr: [
        'gdpr-art-24-responsibility-accountability',
        'gdpr-art-24-data-protection-policy',
        'gdpr-art-35-data-protection-impact-assessment',
        'gdpr-art-35-risk-mitigation',
      ],
    },
  },
  'eu-nis2-21-2-b': {
    comment: 'Art. 21(2)(b) - Incident handling',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-de-ae-01',
        'nist-csf-v2-de-ae-02',
        'nist-csf-v2-de-ae-03',
        'nist-csf-v2-de-ae-04',
        'nist-csf-v2-de-ae-06',
        'nist-csf-v2-de-ae-07',
        'nist-csf-v2-de-ae-08',
        'nist-csf-v2-rs-ma-01',
        'nist-csf-v2-rs-ma-02',
        'nist-csf-v2-rs-ma-03',
        'nist-csf-v2-rs-ma-04',
        'nist-csf-v2-rs-ma-05',
        'nist-csf-v2-rs-co-02',
        'nist-csf-v2-rs-co-03',
      ],
      2022: [
        'iso-2022-a-5-24',
        'iso-2022-a-5-25',
        'iso-2022-a-5-26',
        'iso-2022-a-5-27',
        'iso-2022-a-5-28',
        'iso-2022-a-6-8',
      ],
      gdpr: [
        'gdpr-art-33-breach-notification-to-customer',
        'gdpr-art-34-breach-notification-to-data-subjects',
        'gdpr-art-32-audit-logging',
      ],
    },
  },
  'eu-nis2-21-2-c': {
    comment:
      'Art. 21(2)(c) - Business continuity, backups, disaster recovery, crisis management',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-rs-mi-01',
        'nist-csf-v2-rs-mi-02',
        'nist-csf-v2-rc-rp-01',
        'nist-csf-v2-rc-rp-02',
        'nist-csf-v2-rc-rp-03',
        'nist-csf-v2-rc-rp-04',
        'nist-csf-v2-rc-rp-05',
        'nist-csf-v2-rc-rp-06',
        'nist-csf-v2-rc-co-03',
        'nist-csf-v2-rc-co-04',
      ],
      2022: [
        'iso-2022-a-5-29',
        'iso-2022-a-5-30',
        'iso-2022-a-8-13',
        'iso-2022-a-8-14',
      ],
      gdpr: ['gdpr-art-32-backup'],
    },
  },
  'eu-nis2-21-2-d': {
    comment: 'Art. 21(2)(d) - Supply chain security',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-gv-sc-01',
        'nist-csf-v2-gv-sc-02',
        'nist-csf-v2-gv-sc-03',
        'nist-csf-v2-gv-sc-04',
        'nist-csf-v2-gv-sc-05',
        'nist-csf-v2-gv-sc-06',
        'nist-csf-v2-gv-sc-07',
        'nist-csf-v2-gv-sc-08',
        'nist-csf-v2-gv-sc-09',
        'nist-csf-v2-gv-sc-10',
        'nist-csf-v2-id-ra-09',
        'nist-csf-v2-id-ra-10',
      ],
      2022: [
        'iso-2022-a-5-19',
        'iso-2022-a-5-20',
        'iso-2022-a-5-21',
        'iso-2022-a-5-22',
        'iso-2022-a-5-23',
      ],
      gdpr: [
        'gdpr-art-28-processor-contracts',
        'gdpr-art-28-data-processing-agreement',
        'gdpr-art-28-third-party-integration',
        'gdpr-art-44-46-data-transfers-outside-eu',
      ],
    },
  },
  'eu-nis2-21-2-e': {
    comment:
      'Art. 21(2)(e) - Security in network/information systems acquisition, development, maintenance',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-pr-ps-01',
        'nist-csf-v2-pr-ps-02',
        'nist-csf-v2-pr-ps-03',
        'nist-csf-v2-pr-ps-04',
        'nist-csf-v2-pr-ps-05',
        'nist-csf-v2-pr-ps-06',
        'nist-csf-v2-id-im-01',
        'nist-csf-v2-id-im-02',
        'nist-csf-v2-id-im-03',
        'nist-csf-v2-id-im-04',
      ],
      2022: [
        'iso-2022-a-8-8',
        'iso-2022-a-8-9',
        'iso-2022-a-8-25',
        'iso-2022-a-8-26',
        'iso-2022-a-8-27',
        'iso-2022-a-8-28',
      ],
      gdpr: [
        'gdpr-art-25-data-protection-by-design',
        'gdpr-art-32-vulnerability-assessment',
        'gdpr-art-32-product-version',
        'gdpr-art-35-change-management',
      ],
    },
  },
  'eu-nis2-21-2-f': {
    comment:
      'Art. 21(2)(f) - Policies/procedures to assess effectiveness of cybersecurity risk management',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-gv-ov-01',
        'nist-csf-v2-gv-ov-02',
        'nist-csf-v2-gv-ov-03',
        'nist-csf-v2-id-im-02',
        'nist-csf-v2-id-im-03',
      ],
      2022: ['iso-2022-a-5-35', 'iso-2022-a-5-36'],
      gdpr: [
        'gdpr-art-24-monitoring-review',
        'gdpr-art-40-42-codes-of-conduct-and-certifications',
      ],
    },
  },
  'eu-nis2-21-2-g': {
    comment:
      'Art. 21(2)(g) - Basic cyber hygiene practices and cybersecurity training',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-pr-at-01',
        'nist-csf-v2-pr-at-02',
        'nist-csf-v2-gv-rr-02',
        'nist-csf-v2-gv-rr-04',
      ],
      2022: ['iso-2022-a-6-3'],
      gdpr: ['gdpr-art-24-training-awareness'],
    },
  },
  'eu-nis2-21-2-h': {
    comment:
      'Art. 21(2)(h) - Policies and procedures regarding cryptography and encryption',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-pr-ds-01',
        'nist-csf-v2-pr-ds-02',
        'nist-csf-v2-pr-ds-10',
      ],
      2022: ['iso-2022-a-8-24'],
      gdpr: [
        'gdpr-art-32-encryption-at-rest',
        'gdpr-art-32-encryption-in-transit',
      ],
    },
  },
  'eu-nis2-21-2-i': {
    comment:
      'Art. 21(2)(i) - Human resources security, access control policies, and asset management',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-pr-aa-01',
        'nist-csf-v2-pr-aa-02',
        'nist-csf-v2-pr-aa-03',
        'nist-csf-v2-pr-aa-04',
        'nist-csf-v2-pr-aa-05',
        'nist-csf-v2-pr-aa-06',
        'nist-csf-v2-id-am-01',
        'nist-csf-v2-id-am-02',
        'nist-csf-v2-id-am-03',
        'nist-csf-v2-id-am-04',
        'nist-csf-v2-id-am-05',
        'nist-csf-v2-id-am-07',
        'nist-csf-v2-id-am-08',
      ],
      2022: [
        'iso-2022-a-5-9',
        'iso-2022-a-5-10',
        'iso-2022-a-5-15',
        'iso-2022-a-6-1',
        'iso-2022-a-6-2',
        'iso-2022-a-6-4',
        'iso-2022-a-6-5',
        'iso-2022-a-8-2',
        'iso-2022-a-8-3',
      ],
      gdpr: [
        'gdpr-art-32-access-restriction',
        'gdpr-art-25-data-protection-by-default',
        'gdpr-art-30-personal-data-inventory',
      ],
    },
  },
  'eu-nis2-21-2-j': {
    comment:
      'Art. 21(2)(j) - Use of multi-factor authentication or continuous authentication',
    relationship: 'related',
    mappings: {
      nistcsfv2: ['nist-csf-v2-pr-aa-03', 'nist-csf-v2-pr-aa-05'],
      2022: ['iso-2022-a-8-5'],
      gdpr: ['gdpr-art-32-access-restriction'],
    },
  },
  'eu-nis2-21-3': {
    comment:
      'Art. 21(3) - Supply chain vulnerabilities and overall supply chain quality',
    relationship: 'related',
    mappings: {
      nistcsfv2: [
        'nist-csf-v2-gv-sc-01',
        'nist-csf-v2-gv-sc-05',
        'nist-csf-v2-gv-sc-09',
        'nist-csf-v2-gv-sc-10',
        'nist-csf-v2-id-ra-09',
        'nist-csf-v2-id-ra-10',
      ],
      2022: [
        'iso-2022-a-5-19',
        'iso-2022-a-5-20',
        'iso-2022-a-5-21',
        'iso-2022-a-5-22',
        'iso-2022-a-5-23',
      ],
      gdpr: [
        'gdpr-art-28-processor-contracts',
        'gdpr-art-28-third-party-integration',
      ],
    },
  },
};

// ============================================================================
// Part 1: Insert NIS2 top-level control entries
// ============================================================================

function formatArray(arr, indent) {
  if (arr.length <= 2) {
    return `[${arr.map((v) => `'${v}'`).join(', ')}]`;
  }
  const lines = arr.map((v) => `${indent}  '${v}',`);
  return `[\n${lines.join('\n')}\n${indent}]`;
}

function generateNis2Entries() {
  const lines = [];
  lines.push('');
  lines.push(
    '  // ─── EU NIS2 controls (manually mapped) ──────────────────────────'
  );
  lines.push('');

  for (const [controlId, def] of Object.entries(nis2Controls)) {
    lines.push(`  // ${def.comment}`);
    lines.push(`  '${controlId}': {`);
    lines.push(`    relationship: '${def.relationship}',`);
    lines.push(`    mappings: {`);

    // Output mappings in alphabetical key order
    const orderedKeys = Object.keys(def.mappings).sort((a, b) => {
      const order = [
        "'2013'",
        "'2022'",
        'c5_2020',
        'cisv81',
        'eunis2',
        'gdpr',
        'mvps',
        'nistcsfv2',
        'soc2v2',
      ];
      // Handle quoted keys
      const aKey = a === '2022' ? "'2022'" : a;
      const bKey = b === '2022' ? "'2022'" : b;
      return order.indexOf(aKey) - order.indexOf(bKey);
    });

    for (const key of orderedKeys) {
      const values = def.mappings[key];
      const displayKey = key === '2022' ? `'2022'` : key;
      const indent = '      ';
      const formatted = formatArray(values, indent);
      lines.push(`      ${displayKey}: ${formatted},`);
    }

    lines.push(`    },`);
    lines.push(`  },`);
  }

  return lines.join('\n');
}

// Insert NIS2 entries before the closing `};`
const closingBrace = '\n};\n';
const closingIndex = content.lastIndexOf(closingBrace);
if (closingIndex === -1) {
  console.error('Could not find closing }; in file');
  process.exit(1);
}

const nis2Block = generateNis2Entries();
content =
  content.substring(0, closingIndex) +
  nis2Block +
  '\n' +
  content.substring(closingIndex);
console.log(
  `Part 1: Inserted ${Object.keys(nis2Controls).length} NIS2 top-level control entries`
);

// ============================================================================
// Part 2-4: Add `eunis2` reverse entries to NIST CSF 2.0, GDPR, ISO 2022 controls
// ============================================================================

// Build reverse maps from NIS2 controls
const nistcsfv2Reverse = {}; // nist control -> [nis2 controls]
const gdprReverse = {}; // gdpr control -> [nis2 controls]
const iso2022Reverse = {}; // iso 2022 control -> [nis2 controls]

for (const [nis2Id, def] of Object.entries(nis2Controls)) {
  if (def.mappings.nistcsfv2) {
    for (const nistId of def.mappings.nistcsfv2) {
      if (!nistcsfv2Reverse[nistId]) nistcsfv2Reverse[nistId] = [];
      if (!nistcsfv2Reverse[nistId].includes(nis2Id))
        nistcsfv2Reverse[nistId].push(nis2Id);
    }
  }
  if (def.mappings.gdpr) {
    for (const gdprId of def.mappings.gdpr) {
      if (!gdprReverse[gdprId]) gdprReverse[gdprId] = [];
      if (!gdprReverse[gdprId].includes(nis2Id))
        gdprReverse[gdprId].push(nis2Id);
    }
  }
  if (def.mappings['2022']) {
    for (const isoId of def.mappings['2022']) {
      if (!iso2022Reverse[isoId]) iso2022Reverse[isoId] = [];
      if (!iso2022Reverse[isoId].includes(nis2Id))
        iso2022Reverse[isoId].push(nis2Id);
    }
  }
}

/**
 * Add a key to a control's mappings block.
 */
function addKeyToControl(content, controlId, key, values) {
  const controlPattern = `'${controlId}': {`;
  const controlIndex = content.indexOf(controlPattern);

  if (controlIndex === -1) {
    console.warn(`  WARNING: Control '${controlId}' not found`);
    return content;
  }

  const mappingsPattern = 'mappings: {';
  const mappingsIndex = content.indexOf(mappingsPattern, controlIndex);

  if (mappingsIndex === -1 || mappingsIndex - controlIndex > 500) {
    console.warn(`  WARNING: 'mappings:' not found near '${controlId}'`);
    return content;
  }

  const mappingsOpenBrace = mappingsIndex + mappingsPattern.length;
  let braceDepth = 1;
  let pos = mappingsOpenBrace;
  while (pos < content.length && braceDepth > 0) {
    if (content[pos] === '{') braceDepth++;
    if (content[pos] === '}') braceDepth--;
    pos++;
  }
  const mappingsCloseBrace = pos - 1;
  const mappingsBlock = content.substring(mappingsIndex, mappingsCloseBrace);

  if (mappingsBlock.includes(`${key}:`)) {
    // Key already exists - need to merge values
    return mergeValues(
      content,
      controlId,
      key,
      values,
      mappingsIndex,
      mappingsCloseBrace,
      mappingsBlock
    );
  }

  // Insert new key in alphabetical order
  const keyOrder = [
    "'2013'",
    "'2022'",
    'c5_2020',
    'cisv81',
    'eunis2',
    'gdpr',
    'mvps',
    'nistcsfv2',
    'soc2v2',
  ];
  const keyIndex = keyOrder.indexOf(key);
  const keysAfter = keyOrder.slice(keyIndex + 1);

  let insertBeforePos = null;
  for (const afterKey of keysAfter) {
    const searchKey = afterKey + ':';
    const relPos = mappingsBlock.indexOf(searchKey);
    if (relPos !== -1) {
      const absPos = mappingsIndex + relPos;
      const lineStart = content.lastIndexOf('\n', absPos) + 1;
      insertBeforePos = lineStart;
      break;
    }
  }

  if (insertBeforePos === null) {
    const lineStart = content.lastIndexOf('\n', mappingsCloseBrace) + 1;
    insertBeforePos = lineStart;
  }

  const indent = '      ';
  const formattedValue = formatArray(values, indent);
  const newLine = `${indent}${key}: ${formattedValue},\n`;

  content =
    content.substring(0, insertBeforePos) +
    newLine +
    content.substring(insertBeforePos);
  return content;
}

/**
 * Merge new values into an existing key's array.
 */
function mergeValues(
  content,
  controlId,
  key,
  newValues,
  mappingsIndex,
  mappingsCloseBrace,
  mappingsBlock
) {
  // Find the key line
  const keyPattern = `${key}:`;
  const keyRelPos = mappingsBlock.indexOf(keyPattern);
  if (keyRelPos === -1) return content;

  const keyAbsPos = mappingsIndex + keyRelPos;

  // Find the array - look for [ ... ]
  const arrayStart = content.indexOf('[', keyAbsPos);
  if (arrayStart === -1 || arrayStart > mappingsCloseBrace + 200)
    return content;

  // Find matching ]
  let bracketDepth = 1;
  let p = arrayStart + 1;
  while (p < content.length && bracketDepth > 0) {
    if (content[p] === '[') bracketDepth++;
    if (content[p] === ']') bracketDepth--;
    p++;
  }
  const arrayEnd = p; // position after ]

  // Extract existing values
  const arrayContent = content.substring(arrayStart, arrayEnd);
  const existingValues = [];
  const valueRegex = /'([^']+)'/g;
  let match;
  while ((match = valueRegex.exec(arrayContent)) !== null) {
    existingValues.push(match[1]);
  }

  // Merge - add only new values
  const merged = [...existingValues];
  let added = 0;
  for (const v of newValues) {
    if (!merged.includes(v)) {
      merged.push(v);
      added++;
    }
  }

  if (added === 0) {
    console.log(`  SKIP: '${controlId}' ${key} already has all values`);
    return content;
  }

  // Replace the array
  const indent = '      ';
  const newArrayStr = formatArray(merged, indent);
  content =
    content.substring(0, arrayStart) +
    newArrayStr +
    content.substring(arrayEnd);

  return content;
}

let changeCount = 0;

function applyReverseMappings(label, reverseMap, key) {
  console.log(`\n${label}`);
  let count = 0;
  for (const [controlId, nis2Ids] of Object.entries(reverseMap)) {
    const before = content;
    content = addKeyToControl(content, controlId, key, nis2Ids);
    if (content !== before) {
      console.log(`  ✓ ${controlId} → ${key}: [${nis2Ids.join(', ')}]`);
      count++;
      changeCount++;
    }
  }
  console.log(`  Applied ${count} changes`);
}

applyReverseMappings(
  'Part 2: Adding eunis2 entries to NIST CSF 2.0 controls...',
  nistcsfv2Reverse,
  'eunis2'
);
applyReverseMappings(
  'Part 3: Adding eunis2 entries to GDPR controls...',
  gdprReverse,
  'eunis2'
);
applyReverseMappings(
  'Part 4: Adding eunis2 entries to ISO 2022 controls...',
  iso2022Reverse,
  'eunis2'
);

fs.writeFileSync(filePath, content);
console.log(`\nDone! Total reverse-mapping changes: ${changeCount}`);
