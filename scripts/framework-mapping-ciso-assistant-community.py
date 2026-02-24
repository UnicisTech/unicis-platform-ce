#!/usr/bin/env python3

from __future__ import annotations
import os
import re
import json
import yaml
from pathlib import Path
from collections import defaultdict

# -----------------------------------------------------------------------------
# CONFIG
# -----------------------------------------------------------------------------

REPO_ROOT = Path("/Users/pece/dev/unicis/ciso-assistant-community/backend/library/libraries")
SUPPORTED_EXTENSIONS = (".json", ".yaml", ".yml", ".ts")

ISO_KEYS = [
    "2013",
    "2022",
    "mvps",
    "nistcsfv2",
    "eunis2",
    "gdpr",
    "cisv81",
    "soc2v2",
    "c5_2020",
]

FRAMEWORK_PREFIX_MAP = {
    "iso-2013": "2013",
    "iso-2022": "2022",
    "mvsp": "mvps",
    "nist-csf-v2": "nistcsfv2",
    "eu-nis2": "eunis2",
    "gdpr": "gdpr",
    "cisv81": "cisv81",
    "soc2-v2": "soc2v2",
    "c5-2020": "c5_2020",
}

RELATIONSHIP_REVERSAL = {
    "equivalent": "equivalent",
    "related": "related",
    "implements": "superset",
    "superset": "subset",
    "subset": "superset",
}

# -----------------------------------------------------------------------------
# DISCOVERY
# -----------------------------------------------------------------------------

def find_mapping_files():
    files = []
    for root, _, filenames in os.walk(REPO_ROOT):
        for f in filenames:
            if f.lower().startswith(("map", "mapping")) and f.endswith(SUPPORTED_EXTENSIONS):
                files.append(Path(root) / f)
    return files

# -----------------------------------------------------------------------------
# PARSING
# -----------------------------------------------------------------------------

def extract_json_from_ts(content: str):
    match = re.search(r"\{[\s\S]*\}", content)
    if not match:
        return None
    try:
        return json.loads(match.group())
    except Exception:
        return None

def load_mapping_file(path: Path):
    try:
        text = path.read_text(encoding="utf-8")
        if path.suffix in (".yaml", ".yml"):
            return yaml.safe_load(text)
        if path.suffix == ".json":
            return json.loads(text)
        if path.suffix == ".ts":
            return extract_json_from_ts(text)
    except Exception as e:
        print(f"⚠️ Failed parsing {path}: {e}")
    return None

# -----------------------------------------------------------------------------
# FRAMEWORK DETECTION
# -----------------------------------------------------------------------------

def detect_framework_from_id(control_id: str):
    for prefix, iso_key in FRAMEWORK_PREFIX_MAP.items():
        if control_id.startswith(prefix):
            return iso_key
    return None

# -----------------------------------------------------------------------------
# CORE ENGINE
# -----------------------------------------------------------------------------

def build_bidirectional_mappings(mapping_files):
    controls = defaultdict(lambda: {
        "relationship": None,
        "mappings": defaultdict(list)
    })

    for file in mapping_files:
        data = load_mapping_file(file)
        if not isinstance(data, dict):
            continue

        for source_control, entry in data.items():

            if isinstance(entry, dict):
                relationship = entry.get("relationship", "related")
                mappings = entry.get("mappings", {})

            elif isinstance(entry, list):
                relationship = "related"
                mappings = {}
                for target in entry:
                    fw = detect_framework_from_id(target)
                    if fw:
                        mappings.setdefault(fw, []).append(target)

            elif isinstance(entry, str):
                relationship = "related"
                fw = detect_framework_from_id(entry)
                mappings = {fw: [entry]} if fw else {}

            else:
                continue

            source_fw = detect_framework_from_id(source_control)
            if not source_fw:
                continue

            controls[source_control]["relationship"] = relationship

            for target_fw, target_controls in mappings.items():
                if not target_fw:
                    continue

                for target_control in target_controls:

                    if target_control not in controls[source_control]["mappings"][target_fw]:
                        controls[source_control]["mappings"][target_fw].append(target_control)

                    reverse_rel = RELATIONSHIP_REVERSAL.get(relationship, "related")

                    if controls[target_control]["relationship"] is None:
                        controls[target_control]["relationship"] = reverse_rel

                    if source_control not in controls[target_control]["mappings"][source_fw]:
                        controls[target_control]["mappings"][source_fw].append(source_control)

    return controls

# -----------------------------------------------------------------------------
# TS GENERATION
# -----------------------------------------------------------------------------

HEADER = """import type { ISO } from 'types';
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

const frameworkMappings: FrameworkMappings = {
"""

FOOTER = """};

setMappings(frameworkMappings);

export default frameworkMappings;
"""

def format_id_list(ids, indent=6):
    pad = " " * indent
    ids = sorted(set(ids))
    inline = ", ".join(f"'{i}'" for i in ids)
    if len(inline) + indent < 100:
        return f"[{inline}]"

    lines = ["["]
    for i in ids:
        lines.append(f"{pad}  '{i}',")
    lines.append(f"{pad}]")
    return "\n".join(lines)

def generate_ts(controls):
    lines = [HEADER]

    for ctrl_id in sorted(controls.keys()):
        entry = controls[ctrl_id]
        relationship = entry["relationship"] or "related"

        lines.append(f"  '{ctrl_id}': {{")
        lines.append(f"    relationship: '{relationship}',")
        lines.append(f"    mappings: {{")

        for iso in ISO_KEYS:
            ids = entry["mappings"].get(iso)
            if ids:
                lines.append(f"      '{iso}': {format_id_list(ids)},")

        lines.append("    },")
        lines.append("  },")
        lines.append("")

    lines.append(FOOTER)
    return "\n".join(lines)

# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------

def main():
    print("🔎 Searching mapping files...")
    mapping_files = find_mapping_files()
    print(f"Found {len(mapping_files)} mapping files")

    print("🔄 Building control relationships...")
    controls = build_bidirectional_mappings(mapping_files)

    print("📦 Generating framework-mappings.ts ...")
    print(generate_ts(controls))

if __name__ == "__main__":
    main()