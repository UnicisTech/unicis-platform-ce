#!/usr/bin/env python3
"""
generate_framework_mappings.py
==============================
Generates lib/csc/framework-mappings.ts for the Unicis Platform CSC module.

Usage:
    python3 scripts/generate_framework_mappings.py > lib/csc/framework-mappings.ts

Each control entry looks like:
    'control-id': {
        relationship: 'equivalent' | 'implements' | 'subset' | 'superset' | 'related',
        mappings: {
            '2013':      [...],
            '2022':      [...],
            'mvps':      [...],
            'nistcsfv2': [...],
            'eunis2':    [...],
            'gdpr':      [...],
            'cisv81':    [...],
            'soc2v2':    [...],
            'c5_2020':   [...],
        }
    }

HOW TO FILL IN MAPPINGS:
  - Add entries to the MAPPINGS dict below.
  - Key = the source control ID (exact string used in the framework .ts file).
  - 'relationship' = how this control relates to its peers:
        'equivalent'  — same requirement, different wording
        'implements'  — this control operationalises the peer
        'subset'      — this control is narrower than the peer
        'superset'    — this control is broader than the peer
        'related'     — topically linked but not equivalent
  - 'mappings' = dict of ISO value → list of peer control IDs.
  - You only need to populate the MAPPINGS dict; the script handles formatting.
"""

from __future__ import annotations
import json, textwrap

# ---------------------------------------------------------------------------
# TYPE DEFINITIONS (mirrors TypeScript types in framework-mapping-utils.ts)
# ---------------------------------------------------------------------------
RelationshipType = str   # 'equivalent' | 'implements' | 'subset' | 'superset' | 'related'

# Structure: { 'control-id': { 'relationship': str, 'mappings': { iso: [ids] } } }
MAPPINGS: dict[str, dict] = {

    # =========================================================================
    # MVSP — Minimum Viable Secure Product
    # =========================================================================

    "mvsp-1-1": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-24", "iso-2022-a-8-8"],
            "2013":      ["iso-2013-a-16-1-1", "iso-2013-a-12-6-1"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01", "nist-csf-v2-rs-ma-01"],
            "eunis2":    ["eu-nis2-21-2-b"],
            "cisv81":    ["cisv81-7-7", "cisv81-17-1"],
            "soc2v2":    ["soc2-v2-cc7-3"],
            "c5_2020":   ["c5-2020-sim-01", "c5-2020-ops-07"],
        },
    },
    "mvsp-1-2": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-15", "iso-2022-a-5-18"],
            "2013":      ["iso-2013-a-9-1-1", "iso-2013-a-9-2-3"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-01", "nist-csf-v2-pr-aa-05"],
            "eunis2":    ["eu-nis2-21-2-i"],
            "cisv81":    ["cisv81-5-1", "cisv81-6-3"],
            "soc2v2":    ["soc2-v2-cc6-3"],
            "c5_2020":   ["c5-2020-idm-01", "c5-2020-idm-05"],
        },
    },
    "mvsp-1-3": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-35", "iso-2022-a-8-8"],
            "2013":      ["iso-2013-a-18-2-3", "iso-2013-a-12-6-1"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01", "nist-csf-v2-id-ra-05"],
            "eunis2":    ["eu-nis2-21-2-f"],
            "cisv81":    ["cisv81-18-1", "cisv81-18-2"],
            "soc2v2":    ["soc2-v2-cc4-1"],
            "c5_2020":   ["c5-2020-inq-01", "c5-2020-com-01"],
        },
    },
    "mvsp-1-4": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-24", "iso-2022-a-8-8"],
            "2013":      ["iso-2013-a-16-1-1", "iso-2013-a-12-6-1"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01"],
            "cisv81":    ["cisv81-17-1"],
            "c5_2020":   ["c5-2020-sim-01"],
        },
    },
    "mvsp-1-5": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-6-3"],
            "2013":      ["iso-2013-a-7-2-2"],
            "nistcsfv2": ["nist-csf-v2-pr-at-01", "nist-csf-v2-pr-at-02"],
            "eunis2":    ["eu-nis2-21-2-g"],
            "cisv81":    ["cisv81-14-1", "cisv81-14-9"],
            "soc2v2":    ["soc2-v2-cc1-4"],
            "c5_2020":   ["c5-2020-hr-04"],
        },
    },
    "mvsp-1-6": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-5-24", "iso-2022-a-5-26"],
            "2013":      ["iso-2013-a-16-1-1", "iso-2013-a-16-1-5"],
            "nistcsfv2": ["nist-csf-v2-rs-ma-01", "nist-csf-v2-rs-ma-02"],
            "eunis2":    ["eu-nis2-21-2-b"],
            "cisv81":    ["cisv81-17-2", "cisv81-17-3"],
            "soc2v2":    ["soc2-v2-cc7-3"],
            "c5_2020":   ["c5-2020-sim-02", "c5-2020-sim-03"],
        },
    },
    "mvsp-1-7": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-15", "iso-2022-a-8-16", "iso-2022-a-8-17"],
            "2013":      ["iso-2013-a-12-4-1", "iso-2013-a-12-4-2", "iso-2013-a-12-4-3"],
            "nistcsfv2": ["nist-csf-v2-de-cm-01", "nist-csf-v2-de-ae-03"],
            "eunis2":    ["eu-nis2-21-2-b"],
            "cisv81":    ["cisv81-8-2", "cisv81-8-5", "cisv81-8-11"],
            "soc2v2":    ["soc2-v2-cc7-2"],
            "c5_2020":   ["c5-2020-ops-14", "c5-2020-ops-15"],
            "gdpr":      ["gdpr-art-32-audit-logging"],
        },
    },
    "mvsp-1-8": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-29", "iso-2022-a-8-14"],
            "2013":      ["iso-2013-a-17-1-1", "iso-2013-a-17-2-1"],
            "nistcsfv2": ["nist-csf-v2-rc-rp-01"],
            "cisv81":    ["cisv81-11-1"],
            "soc2v2":    ["soc2-v2-a1-1"],
            "c5_2020":   ["c5-2020-bcm-01"],
        },
    },
    "mvsp-2-1": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-5-16", "iso-2022-a-5-17", "iso-2022-a-8-5"],
            "2013":      ["iso-2013-a-9-2-1", "iso-2013-a-9-4-2"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-02", "nist-csf-v2-pr-aa-03"],
            "eunis2":    ["eu-nis2-21-2-i"],
            "cisv81":    ["cisv81-5-2", "cisv81-6-3"],
            "soc2v2":    ["soc2-v2-cc6-1"],
            "c5_2020":   ["c5-2020-idm-02", "c5-2020-idm-03"],
        },
    },
    "mvsp-2-2": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-24", "iso-2022-a-8-20"],
            "2013":      ["iso-2013-a-10-1-1", "iso-2013-a-13-1-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ds-02"],
            "eunis2":    ["eu-nis2-21-2-h", "eu-nis2-21-2-j"],
            "cisv81":    ["cisv81-3-10", "cisv81-13-9"],
            "soc2v2":    ["soc2-v2-cc6-1"],
            "c5_2020":   ["c5-2020-cry-01", "c5-2020-cos-01"],
            "gdpr":      ["gdpr-art-32-encryption-in-transit"],
        },
    },
    "mvsp-2-3": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-9", "iso-2022-a-8-20"],
            "2013":      ["iso-2013-a-14-1-2", "iso-2013-a-13-1-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ps-01"],
            "cisv81":    ["cisv81-9-1", "cisv81-13-4"],
            "soc2v2":    ["soc2-v2-cc7-1"],
            "c5_2020":   ["c5-2020-dev-05"],
        },
    },
    "mvsp-2-4": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-5-17", "iso-2022-a-8-5"],
            "2013":      ["iso-2013-a-9-3-1", "iso-2013-a-9-4-3"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-01", "nist-csf-v2-pr-aa-02"],
            "eunis2":    ["eu-nis2-21-2-i", "eu-nis2-21-2-j"],
            "cisv81":    ["cisv81-5-2", "cisv81-6-3", "cisv81-6-5"],
            "soc2v2":    ["soc2-v2-cc6-1"],
            "c5_2020":   ["c5-2020-idm-04", "c5-2020-idm-05"],
        },
    },
    "mvsp-2-5": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-24"],
            "2013":      ["iso-2013-a-10-1-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ds-01"],
            "eunis2":    ["eu-nis2-21-2-h"],
            "cisv81":    ["cisv81-3-9", "cisv81-3-11"],
            "soc2v2":    ["soc2-v2-cc6-1"],
            "c5_2020":   ["c5-2020-cry-01", "c5-2020-cry-02"],
            "gdpr":      ["gdpr-art-32-encryption-at-rest"],
        },
    },
    "mvsp-2-6": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-8", "iso-2022-a-8-28"],
            "2013":      ["iso-2013-a-12-6-1", "iso-2013-a-14-2-7"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01", "nist-csf-v2-de-cm-01"],
            "eunis2":    ["eu-nis2-21-2-e"],
            "cisv81":    ["cisv81-7-1", "cisv81-16-1"],
            "soc2v2":    ["soc2-v2-cc7-1"],
            "c5_2020":   ["c5-2020-dev-07", "c5-2020-ops-07"],
        },
    },
    "mvsp-2-7": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-5-17", "iso-2022-a-8-19"],
            "2013":      ["iso-2013-a-9-2-4", "iso-2013-a-12-5-1"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-01"],
            "cisv81":    ["cisv81-4-7", "cisv81-5-3"],
            "soc2v2":    ["soc2-v2-cc6-1"],
            "c5_2020":   ["c5-2020-idm-04"],
        },
    },
    "mvsp-2-8": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-28", "iso-2022-a-8-26"],
            "2013":      ["iso-2013-a-14-1-2", "iso-2013-a-14-2-5"],
            "nistcsfv2": ["nist-csf-v2-pr-ps-01"],
            "cisv81":    ["cisv81-16-7", "cisv81-16-12"],
            "soc2v2":    ["soc2-v2-cc8-1"],
            "c5_2020":   ["c5-2020-dev-05", "c5-2020-dev-06"],
        },
    },
    "mvsp-3-1": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-9", "iso-2022-a-5-12"],
            "2013":      ["iso-2013-a-8-1-1", "iso-2013-a-8-2-1"],
            "nistcsfv2": ["nist-csf-v2-id-am-01", "nist-csf-v2-id-am-02"],
            "eunis2":    ["eu-nis2-21-2-i"],
            "cisv81":    ["cisv81-1-1", "cisv81-2-1"],
            "soc2v2":    ["soc2-v2-cc3-2"],
            "c5_2020":   ["c5-2020-am-01", "c5-2020-am-02"],
            "gdpr":      ["gdpr-art-30-personal-data-inventory"],
        },
    },
    "mvsp-3-2": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-33"],
            "2013":      ["iso-2013-a-18-1-3"],
            "eunis2":    ["eu-nis2-21-2-i"],
            "cisv81":    ["cisv81-3-12", "cisv81-3-13"],
            "soc2v2":    ["soc2-v2-p4-2"],
            "gdpr":      ["gdpr-art-5-retention-timelines"],
        },
    },
    "mvsp-3-3": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-6-1", "iso-2022-a-6-2", "iso-2022-a-6-5"],
            "2013":      ["iso-2013-a-7-1-1", "iso-2013-a-7-1-2", "iso-2013-a-7-3-1"],
            "nistcsfv2": ["nist-csf-v2-gv-po-01"],
            "cisv81":    ["cisv81-6-2"],
            "soc2v2":    ["soc2-v2-cc1-4"],
            "c5_2020":   ["c5-2020-hr-01", "c5-2020-hr-02", "c5-2020-hr-06"],
        },
    },
    "mvsp-3-4": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-35", "iso-2022-a-5-36"],
            "2013":      ["iso-2013-a-18-2-1", "iso-2013-a-18-2-2"],
            "nistcsfv2": ["nist-csf-v2-gv-oc-01"],
            "eunis2":    ["eu-nis2-21-2-f"],
            "c5_2020":   ["c5-2020-com-01"],
        },
    },
    "mvsp-3-5": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-19", "iso-2022-a-5-21"],
            "2013":      ["iso-2013-a-15-1-1", "iso-2013-a-15-1-3"],
            "nistcsfv2": ["nist-csf-v2-gv-sc-01", "nist-csf-v2-gv-sc-06"],
            "eunis2":    ["eu-nis2-21-2-d", "eu-nis2-21-3"],
            "cisv81":    ["cisv81-15-1"],
            "soc2v2":    ["soc2-v2-cc9-2"],
            "c5_2020":   ["c5-2020-sso-01", "c5-2020-pss-01"],
            "gdpr":      ["gdpr-art-28-processor-contracts"],
        },
    },
    "mvsp-4-1": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-5-8", "iso-2022-a-8-25", "iso-2022-a-8-27"],
            "2013":      ["iso-2013-a-14-1-1", "iso-2013-a-14-2-1", "iso-2013-a-14-2-5"],
            "nistcsfv2": ["nist-csf-v2-gv-rm-01", "nist-csf-v2-id-ra-03"],
            "eunis2":    ["eu-nis2-21-2-e"],
            "cisv81":    ["cisv81-16-1", "cisv81-16-14"],
            "soc2v2":    ["soc2-v2-cc8-1"],
            "c5_2020":   ["c5-2020-dev-01", "c5-2020-dev-02"],
        },
    },
    "mvsp-4-2": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-31"],
            "2013":      ["iso-2013-a-14-2-6"],
            "nistcsfv2": ["nist-csf-v2-pr-ps-04"],
            "cisv81":    ["cisv81-12-1", "cisv81-13-4"],
            "soc2v2":    ["soc2-v2-cc5-3"],
            "c5_2020":   ["c5-2020-dev-03"],
            "gdpr":      ["gdpr-art-35-segregation-of-environment"],
        },
    },
    "mvsp-4-3": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-20", "iso-2022-a-5-22"],
            "2013":      ["iso-2013-a-15-1-2", "iso-2013-a-15-2-1"],
            "nistcsfv2": ["nist-csf-v2-gv-sc-02", "nist-csf-v2-gv-sc-05"],
            "eunis2":    ["eu-nis2-21-2-d", "eu-nis2-21-3"],
            "cisv81":    ["cisv81-15-2", "cisv81-15-3"],
            "soc2v2":    ["soc2-v2-cc9-2"],
            "c5_2020":   ["c5-2020-sso-02", "c5-2020-sso-03"],
        },
    },
    "mvsp-4-4": {
        "relationship": "implements",
        "mappings": {
            "2022":      ["iso-2022-a-8-13"],
            "2013":      ["iso-2013-a-12-3-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ds-11", "nist-csf-v2-rc-rp-04"],
            "eunis2":    ["eu-nis2-21-2-c"],
            "cisv81":    ["cisv81-11-2", "cisv81-11-4"],
            "soc2v2":    ["soc2-v2-a1-2"],
            "c5_2020":   ["c5-2020-ops-13", "c5-2020-bcm-03"],
        },
    },

    # =========================================================================
    # ISO 27001:2022 — full list below
    # Add all iso-2022-a-5-1 through iso-2022-a-8-34 entries here
    # =========================================================================

    "iso-2022-a-5-1": {
        "relationship": "related",
        "mappings": {
            "2013":      ["iso-2013-a-5-1-1", "iso-2013-a-5-1-2"],
            "mvps":      ["mvsp-3-4"],
            "nistcsfv2": ["nist-csf-v2-gv-po-01", "nist-csf-v2-gv-po-02"],
            "eunis2":    ["eu-nis2-21", "eu-nis2-21-1"],
            "cisv81":    ["cisv81-3-1"],
            "soc2v2":    ["soc2-v2-cc1-1"],
            "c5_2020":   ["c5-2020-ois-01", "c5-2020-sp-01"],
            "gdpr":      ["gdpr-art-24-data-protection-policy"],
        },
    },
    "iso-2022-a-5-2": {
        "relationship": "related",
        "mappings": {
            "2013":      ["iso-2013-a-6-1-1"],
            "nistcsfv2": ["nist-csf-v2-gv-oc-01", "nist-csf-v2-gv-rm-01"],
            "eunis2":    ["eu-nis2-21"],
            "cisv81":    ["cisv81-3-1"],
            "soc2v2":    ["soc2-v2-cc1-2"],
            "c5_2020":   ["c5-2020-ois-02"],
        },
    },

    # =========================================================================
    # ISO 27001:2013 — full list below
    # Add all iso-2013-a-5-1-1 through iso-2013-a-18-2-3 entries here
    # =========================================================================

    "iso-2013-a-5-1-1": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-1"],
            "mvps":      ["mvsp-3-4"],
            "nistcsfv2": ["nist-csf-v2-gv-po-01"],
            "eunis2":    ["eu-nis2-21"],
            "cisv81":    ["cisv81-3-1"],
            "soc2v2":    ["soc2-v2-cc1-1"],
            "c5_2020":   ["c5-2020-ois-01"],
            "gdpr":      ["gdpr-art-24-data-protection-policy"],
        },
    },
    "iso-2013-a-5-1-2": {
        "relationship": "related",
        "mappings": {
            "2022":      ["iso-2022-a-5-1"],
            "nistcsfv2": ["nist-csf-v2-gv-po-02"],
            "cisv81":    ["cisv81-3-1"],
            "soc2v2":    ["soc2-v2-cc1-1"],
            "c5_2020":   ["c5-2020-sp-01"],
        },
    },

    # =========================================================================
    # Add remaining frameworks (NIS2, GDPR, CIS, SOC2, C5, NIST) below
    # following the same pattern.
    # =========================================================================
}


# ---------------------------------------------------------------------------
# CODE GENERATION — do not edit below this line
# ---------------------------------------------------------------------------

ISO_KEYS = ["2013", "2022", "mvps", "nistcsfv2", "eunis2", "gdpr", "cisv81", "soc2v2", "c5_2020"]

HEADER = '''\
import type { ISO } from 'types';
import { setMappings } from './framework-mapping-utils';

export type RelationshipType =
  | 'equivalent'
  | 'implements'
  | 'subset'
  | 'superset'
  | 'related';

export interface ControlMappingEntry {
  relationship: RelationshipType;
  mappings: Partial<Record<ISO, string[]>>;
}

export type FrameworkMappings = Record<string, ControlMappingEntry>;

/**
 * Comprehensive cross-framework control mappings for the Unicis Platform CSC module.
 * Auto-generated by scripts/generate_framework_mappings.py — edit that file, not this one.
 */
const frameworkMappings: FrameworkMappings = {
'''

FOOTER = '''\
};

// Register with the lazy-load registry so UI components can access mappings
setMappings(frameworkMappings);

export default frameworkMappings;
'''


def format_id_list(ids: list[str], indent: int) -> str:
    pad = " " * indent
    if not ids:
        return "[]"
    items = ", ".join(f"'{i}'" for i in ids)
    # wrap long lines
    if len(items) + indent + 6 < 100:
        return f"[{items}]"
    inner_pad = pad + "  "
    lines = [f"["]
    for id_ in ids:
        lines.append(f"{inner_pad}'{id_}',")
    lines.append(f"{pad}]")
    return "\n".join(lines)


def generate() -> str:
    lines = [HEADER]
    for ctrl_id, entry in MAPPINGS.items():
        relationship = entry["relationship"]
        mappings = entry.get("mappings", {})
        lines.append(f"  // {ctrl_id}")
        lines.append(f"  '{ctrl_id}': {{")
        lines.append(f"    relationship: '{relationship}',")
        lines.append(f"    mappings: {{")
        for iso in ISO_KEYS:
            ids = mappings.get(iso)
            if ids:
                id_str = format_id_list(ids, indent=6)
                lines.append(f"      '{iso}': {id_str},")
        lines.append(f"    }},")
        lines.append(f"  }},")
        lines.append("")
    lines.append(FOOTER)
    return "\n".join(lines)


if __name__ == "__main__":
    print(generate())
