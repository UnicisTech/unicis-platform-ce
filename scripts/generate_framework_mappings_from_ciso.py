#!/usr/bin/env python3
"""
generate_framework_mappings_from_ciso.py

Reads CISO Assistant Community mapping YAML files and generates
lib/csc/framework-mappings.ts for the Unicis Platform.

Frameworks auto-mapped from YAML files:
  - ISO 27001:2022  (2022)      ← used as pivot framework
  - ISO 27001:2013  (2013)
  - NIST CSF v2     (nistcsfv2)
  - CIS Controls v8 (cisv81)
  - SOC2 2017+2022  (soc2v2)
  - BSI C5 2020     (c5_2020)   ← via Cisco CCF as two-hop pivot

Frameworks with hardcoded data (no compatible CISO mapping files):
  - MVSP            (mvps)       ← all 27 controls hardcoded below
  - EU NIS2         (eunis2)     ← NIS2 directive IDs differ from CISO annex
  - GDPR            (gdpr)       ← no ISO27001 mapping in CISO library

Usage:
  cd /path/to/unicis-platform
  python3 scripts/generate_framework_mappings_from_ciso.py \\
    --ciso-dir /path/to/ciso-assistant-community/backend/library/libraries \\
    > lib/csc/framework-mappings.ts

  # Or with default paths (assumes ciso-assistant-community next to unicis-platform):
  python3 scripts/generate_framework_mappings_from_ciso.py > lib/csc/framework-mappings.ts
"""

import re
import sys
import yaml
import argparse
from pathlib import Path
from collections import defaultdict
from typing import Optional, Dict, List, Set, Tuple

# ── Default paths ───────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_CISO_DIR = REPO_ROOT.parent.parent / "ciso-assistant-community" / "backend" / "library" / "libraries"
DEFAULT_UNICIS_FW_DIR = REPO_ROOT / "lib" / "csc" / "frameworks"

# ── CISO mapping files to load ──────────────────────────────────────────────────

# Direct mappings (one side is always iso27001-2022)
DIRECT_MAPPING_FILES = [
    "mapping-iso27001-2013-to-iso27001-2022.yaml",
    "mapping-cis-controls-v8-and-iso27001-2022.yaml",
    "mapping-soc2-2017-rev-2022-to-iso27001-2022.yaml",
    "mapping-nist-csf-2.0-to-iso27001-2022.yaml",
]

# C5 2020 indirect mapping files (C5 ↔ Cisco CCF ↔ ISO27001-2022)
C5_PIVOT_FILES = [
    "mapping-cisco-ccf-v3.0-and-bsi-c5-2020.yaml",
    "mapping-cisco-ccf-v3.0-and-iso27001-2022.yaml",
]

# ── CISO framework URN → Unicis ISO value ──────────────────────────────────────

CISO_FW_TO_UNICIS_ISO = {
    "iso27001-2022":     "2022",
    "iso27001-2013":     "2013",
    "nist-csf-2.0":      "nistcsfv2",
    "cis-controls-v8":   "cisv81",
    "soc2-2017-rev-2022": "soc2v2",
    "bsi-c5-2020":       "c5_2020",
}

UNICIS_ISO_TO_CISO_FW = {v: k for k, v in CISO_FW_TO_UNICIS_ISO.items()}

# ── Relationship mapping from CISO → Unicis ────────────────────────────────────

RELATIONSHIP_MAP = {
    "equal":      "equivalent",
    "equivalent": "equivalent",
    "subset":     "subset",
    "superset":   "superset",
    "intersect":  "related",
    "related":    "related",
    "implies":    "implements",
    "implements": "implements",
}


def normalize_relationship(rel: str, is_reversed: bool = False) -> str:
    """Map CISO relationship strings to Unicis RelationshipType values."""
    rel_lower = rel.lower() if rel else "related"
    unicis_rel = RELATIONSHIP_MAP.get(rel_lower, "related")
    if is_reversed:
        if unicis_rel == "subset":
            return "superset"
        if unicis_rel == "superset":
            return "subset"
    return unicis_rel


# ── URN ↔ Unicis control ID conversion ─────────────────────────────────────────

def fw_from_urn(urn: str) -> Optional[str]:
    """Extract framework short name from a CISO URN."""
    # urn:intuitem:risk:req_node:<framework>:<control_id>
    parts = urn.split(":")
    return parts[4] if len(parts) >= 6 else None


def node_from_urn(urn: str) -> Optional[str]:
    """Extract the control node ID from a CISO URN."""
    parts = urn.split(":")
    return parts[5] if len(parts) >= 6 else None


def ciso_urn_to_unicis_id(urn: str) -> Optional[str]:
    """
    Convert a CISO Assistant URN to a Unicis control ID.
    Returns None if the URN is not from a supported framework or cannot be converted.
    """
    fw = fw_from_urn(urn)
    node = node_from_urn(urn)
    if not fw or not node:
        return None

    if fw == "iso27001-2022":
        # Only Annex A controls (a.5.1, a.8.34, …)
        if not node.startswith("a."):
            return None
        return "iso-2022-" + node.replace(".", "-")

    elif fw == "iso27001-2013":
        # Only Annex A controls (a.5.1.1, a.18.2.3, …)
        if not node.startswith("a."):
            return None
        return "iso-2013-" + node.replace(".", "-")

    elif fw == "nist-csf-2.0":
        # gv.oc-01 → nist-csf-v2-gv-oc-01
        # The dot separates function from category; replace it with dash
        return "nist-csf-v2-" + node.replace(".", "-")

    elif fw == "cis-controls-v8":
        # 1.1 → cisv81-1-1
        return "cisv81-" + node.replace(".", "-")

    elif fw == "soc2-2017-rev-2022":
        # cc6.1.1 → soc2-v2-cc6-1-1
        return "soc2-v2-" + node.replace(".", "-")

    elif fw == "bsi-c5-2020":
        # ois-01 → c5-2020-ois-01
        return "c5-2020-" + node

    return None


def unicis_id_to_ciso_urn(unicis_iso: str, unicis_id: str) -> Optional[str]:
    """
    Convert a Unicis control ID back to a CISO Assistant URN.
    Returns None if the framework has no CISO mapping.
    """
    ciso_fw = UNICIS_ISO_TO_CISO_FW.get(unicis_iso)
    if not ciso_fw:
        return None

    if unicis_iso == "2022":
        # iso-2022-a-5-1 → urn:...:iso27001-2022:a.5.1
        node = unicis_id.removeprefix("iso-2022-").replace("-", ".")
        return f"urn:intuitem:risk:req_node:iso27001-2022:{node}"

    elif unicis_iso == "2013":
        # iso-2013-a-5-1-1 → urn:...:iso27001-2013:a.5.1.1
        node = unicis_id.removeprefix("iso-2013-").replace("-", ".")
        return f"urn:intuitem:risk:req_node:iso27001-2013:{node}"

    elif unicis_iso == "nistcsfv2":
        # nist-csf-v2-gv-oc-01 → urn:...:nist-csf-2.0:gv.oc-01
        stripped = unicis_id.removeprefix("nist-csf-v2-")
        # First two chars are the function (gv, id, pr, de, rs, rc)
        # then dash, then category-number (oc-01)
        node = stripped[:2] + "." + stripped[3:]
        return f"urn:intuitem:risk:req_node:nist-csf-2.0:{node}"

    elif unicis_iso == "cisv81":
        # cisv81-1-1 → urn:...:cis-controls-v8:1.1
        node = unicis_id.removeprefix("cisv81-").replace("-", ".")
        return f"urn:intuitem:risk:req_node:cis-controls-v8:{node}"

    elif unicis_iso == "soc2v2":
        # soc2-v2-cc6-1-1 → urn:...:soc2-2017-rev-2022:cc6.1.1
        node = unicis_id.removeprefix("soc2-v2-").replace("-", ".")
        return f"urn:intuitem:risk:req_node:soc2-2017-rev-2022:{node}"

    elif unicis_iso == "c5_2020":
        # c5-2020-ois-01 → urn:...:bsi-c5-2020:ois-01
        node = unicis_id.removeprefix("c5-2020-")
        return f"urn:intuitem:risk:req_node:bsi-c5-2020:{node}"

    return None


# ── YAML loading ────────────────────────────────────────────────────────────────

def load_yaml(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def extract_mappings(data: dict) -> List[Tuple[str, str, str]]:
    """
    Extract (source_urn, target_urn, relationship) triples from a CISO YAML file.
    Handles both singular `requirement_mapping_set` and plural `requirement_mapping_sets`.
    Does NOT add reverse mappings — caller handles direction.
    """
    result = []
    objs = data.get("objects", {})

    mapping_sets = []
    if "requirement_mapping_set" in objs:
        mapping_sets = [objs["requirement_mapping_set"]]
    elif "requirement_mapping_sets" in objs:
        mapping_sets = objs["requirement_mapping_sets"]

    for ms in mapping_sets:
        for rm in ms.get("requirement_mappings", []):
            src = rm.get("source_requirement_urn", "")
            tgt = rm.get("target_requirement_urn", "")
            rel = rm.get("relationship", "intersect") or "intersect"
            if src and tgt:
                result.append((src, tgt, str(rel)))

    return result


# ── Unicis framework control ID loader ─────────────────────────────────────────

def load_unicis_control_ids(fw_dir: Path) -> Dict[str, Set[str]]:
    """
    Load all control IDs from Unicis framework TypeScript files.
    Returns: {unicis_iso_value: {control_id, ...}}
    """
    file_map = {
        "2022":      "iso_2022.ts",
        "2013":      "iso_2013.ts",
        "nistcsfv2": "nist_csf_v2.ts",
        "cisv81":    "cis_v_81.ts",
        "soc2v2":    "soc2-v2.ts",
        "c5_2020":   "c5_2020.ts",
        "eunis2":    "eu_nis2.ts",
        "gdpr":      "gdpr.ts",
        "mvps":      "mvps.ts",
    }
    result = {}
    for iso, fname in file_map.items():
        path = fw_dir / fname
        if not path.exists():
            print(f"WARNING: Framework file not found: {path}", file=sys.stderr)
            result[iso] = set()
            continue
        content = path.read_text(encoding="utf-8")
        ids = set(re.findall(r"id:\s*'([^']+)'", content))
        result[iso] = ids
    return result


# ── Graph builder ───────────────────────────────────────────────────────────────

def build_graph(
    ciso_dir: Path,
    files: List[str],
) -> dict[str, List[Tuple[str, str]]]:
    """
    Load YAML mapping files and build a bidirectional URN graph.
    Returns: {src_urn: [(tgt_urn, relationship_str)]}
    """
    graph: Dict[str, List[Tuple[str, str]]] = defaultdict(list)

    for fname in files:
        path = ciso_dir / fname
        if not path.exists():
            print(f"WARNING: Mapping file not found: {path}", file=sys.stderr)
            continue
        data = load_yaml(path)
        pairs = extract_mappings(data)
        for src, tgt, rel in pairs:
            graph[src].append((tgt, rel))
            # Add reverse (relationship may flip for subset/superset)
            rev_rel = rel
            if rel.lower() == "subset":
                rev_rel = "superset"
            elif rel.lower() == "superset":
                rev_rel = "subset"
            graph[tgt].append((src, rev_rel))

    return dict(graph)


def build_c5_graph(
    ciso_dir: Path,
    c5_to_pivot_file: str,
    pivot_to_iso_file: str,
) -> dict[str, List[Tuple[str, str]]]:
    """
    Build C5 2020 ↔ ISO27001-2022 indirect mappings via Cisco CCF pivot.
    Returns: {c5_urn: [(iso2022_urn, 'related')], iso2022_urn: [(c5_urn, 'related')]}
    """
    graph: Dict[str, List[Tuple[str, str]]] = defaultdict(list)

    p1 = ciso_dir / c5_to_pivot_file
    p2 = ciso_dir / pivot_to_iso_file
    if not p1.exists() or not p2.exists():
        print(f"WARNING: C5 pivot files not found.", file=sys.stderr)
        return {}

    # c5 ↔ cisco_ccf
    c5_to_ccf: Dict[str, Set[str]] = defaultdict(set)
    ccf_to_c5: Dict[str, Set[str]] = defaultdict(set)
    for src, tgt, _ in extract_mappings(load_yaml(p1)):
        src_fw = fw_from_urn(src)
        tgt_fw = fw_from_urn(tgt)
        if src_fw == "bsi-c5-2020":
            c5_to_ccf[src].add(tgt)
            ccf_to_c5[tgt].add(src)
        elif tgt_fw == "bsi-c5-2020":
            c5_to_ccf[tgt].add(src)
            ccf_to_c5[src].add(tgt)

    # cisco_ccf ↔ iso27001-2022
    ccf_to_iso: Dict[str, Set[str]] = defaultdict(set)
    iso_to_ccf: Dict[str, Set[str]] = defaultdict(set)
    for src, tgt, _ in extract_mappings(load_yaml(p2)):
        src_fw = fw_from_urn(src)
        tgt_fw = fw_from_urn(tgt)
        if src_fw == "cisco-ccf-v3.0" and tgt_fw == "iso27001-2022":
            ccf_to_iso[src].add(tgt)
            iso_to_ccf[tgt].add(src)
        elif src_fw == "iso27001-2022" and tgt_fw == "cisco-ccf-v3.0":
            iso_to_ccf[src].add(tgt)
            ccf_to_iso[tgt].add(src)

    # Two-hop: C5 → CCF → ISO2022
    for c5_urn, ccf_urns in c5_to_ccf.items():
        iso_set: Set[str] = set()
        for ccf in ccf_urns:
            iso_set |= ccf_to_iso.get(ccf, set())
        for iso_urn in iso_set:
            graph[c5_urn].append((iso_urn, "related"))
            graph[iso_urn].append((c5_urn, "related"))

    return dict(graph)


# ── Mapping builder ─────────────────────────────────────────────────────────────

def build_unicis_mappings(
    direct_graph: Dict[str, List[Tuple[str, str]]],
    c5_graph: Dict[str, List[Tuple[str, str]]],
    all_control_ids: Dict[str, Set[str]],
) -> Dict[str, dict]:
    """
    For each Unicis control, find all cross-framework mappings.

    Uses ISO 27001:2022 as a pivot: for any control C in framework F,
    the algorithm does a two-hop traversal:
      1. C → [iso2022 controls] (direct mapping)
      2. iso2022 control → [controls in all other frameworks] (pivot hop)

    This ensures rich cross-framework coverage even when only pairwise
    F ↔ ISO2022 mapping files exist.

    Returns: {unicis_control_id: {relationship, mappings: {iso: [ids]}}}
    """
    # Merge both graphs
    merged: Dict[str, List[Tuple[str, str]]] = defaultdict(list)
    for graph in (direct_graph, c5_graph):
        for urn, neighbors in graph.items():
            merged[urn].extend(neighbors)

    ISO2022_FW = "iso27001-2022"

    def collect_neighbors(src_urn: str, exclude_iso: str) -> Dict[str, Set[str]]:
        """
        Collect all reachable controls for src_urn using ISO2022 as pivot.
        Step 1: direct neighbors of src_urn
        Step 2: for each ISO2022 neighbor, get ITS neighbors (pivot hop)
        Excludes controls in exclude_iso (the source framework).
        Returns {unicis_iso: {unicis_id}}
        """
        fw_mappings: Dict[str, Set[str]] = defaultdict(set)

        # All directly reachable URNs (and their relationships)
        direct_neighbors = merged.get(src_urn, [])

        # Separate ISO2022 neighbors from others
        iso2022_neighbors: List[str] = []
        for tgt_urn, _ in direct_neighbors:
            if fw_from_urn(tgt_urn) == ISO2022_FW:
                iso2022_neighbors.append(tgt_urn)
            else:
                # Non-ISO2022 direct neighbor (e.g., ISO2013 ↔ ISO2022 file
                # gives direct ISO2013 ↔ ISO2022 pairs)
                tgt_id = ciso_urn_to_unicis_id(tgt_urn)
                tgt_fw = fw_from_urn(tgt_urn)
                tgt_iso = CISO_FW_TO_UNICIS_ISO.get(tgt_fw or "", "")
                if tgt_id and tgt_iso and tgt_iso != exclude_iso:
                    if tgt_id in all_control_ids.get(tgt_iso, set()):
                        fw_mappings[tgt_iso].add(tgt_id)

        # Pivot hop: for each ISO2022 neighbor, get all non-ISO2022 neighbors
        for iso2022_urn in iso2022_neighbors:
            # Add the ISO2022 control itself
            iso2022_id = ciso_urn_to_unicis_id(iso2022_urn)
            if iso2022_id and "2022" != exclude_iso:
                if iso2022_id in all_control_ids.get("2022", set()):
                    fw_mappings["2022"].add(iso2022_id)

            # Now pivot: get neighbors of this ISO2022 control
            for pivot_tgt_urn, _ in merged.get(iso2022_urn, []):
                pivot_fw = fw_from_urn(pivot_tgt_urn)
                pivot_iso = CISO_FW_TO_UNICIS_ISO.get(pivot_fw or "", "")
                if not pivot_iso or pivot_iso == exclude_iso:
                    continue
                pivot_id = ciso_urn_to_unicis_id(pivot_tgt_urn)
                if pivot_id and pivot_id in all_control_ids.get(pivot_iso, set()):
                    fw_mappings[pivot_iso].add(pivot_id)

        return dict(fw_mappings)

    result: Dict[str, dict] = {}
    supported_isos = set(CISO_FW_TO_UNICIS_ISO.values())

    for unicis_iso, control_ids in all_control_ids.items():
        if unicis_iso not in supported_isos:
            continue

        for ctrl_id in sorted(control_ids):
            ciso_urn = unicis_id_to_ciso_urn(unicis_iso, ctrl_id)
            if not ciso_urn:
                continue

            fw_mappings = collect_neighbors(ciso_urn, exclude_iso=unicis_iso)
            if not fw_mappings:
                continue

            # Determine dominant relationship from direct neighbors
            rel_votes: Dict[str, int] = defaultdict(int)
            for tgt_urn, rel in merged.get(ciso_urn, []):
                rel_votes[normalize_relationship(rel)] += 1
            dominant_rel = max(rel_votes, key=rel_votes.get) if rel_votes else "related"

            result[ctrl_id] = {
                "relationship": dominant_rel,
                "mappings": {
                    iso: sorted(ids)
                    for iso, ids in sorted(fw_mappings.items())
                },
            }

    return result


# ── Hardcoded MVSP mappings ─────────────────────────────────────────────────────

MVSP_MAPPINGS = {
    # MVSP 1.1 — Vulnerability reports
    "mvsp-1-1": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-24", "iso-2022-a-8-8"],
            "2013":     ["iso-2013-a-16-1-1", "iso-2013-a-12-6-1"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01", "nist-csf-v2-rs-ma-01"],
            "eunis2":   ["eu-nis2-21-2-b"],
            "cisv81":   ["cisv81-7-7", "cisv81-17-1"],
            "soc2v2":   ["soc2-v2-cc7-3"],
            "c5_2020":  ["c5-2020-sim-01", "c5-2020-ops-07"],
        },
    },
    # MVSP 1.2 — Customer data access
    "mvsp-1-2": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-15", "iso-2022-a-5-18"],
            "2013":     ["iso-2013-a-9-1-1", "iso-2013-a-9-2-3"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-01", "nist-csf-v2-pr-aa-05"],
            "eunis2":   ["eu-nis2-21-2-i"],
            "cisv81":   ["cisv81-5-1", "cisv81-6-3"],
            "soc2v2":   ["soc2-v2-cc6-3"],
            "c5_2020":  ["c5-2020-idm-01", "c5-2020-idm-05"],
        },
    },
    # MVSP 1.3 — Validation
    "mvsp-1-3": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-35", "iso-2022-a-8-8"],
            "2013":     ["iso-2013-a-18-2-3", "iso-2013-a-12-6-1"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01", "nist-csf-v2-id-ra-05"],
            "eunis2":   ["eu-nis2-21-2-f"],
            "cisv81":   ["cisv81-18-1", "cisv81-18-2"],
            "soc2v2":   ["soc2-v2-cc4-1"],
            "c5_2020":  ["c5-2020-inq-01", "c5-2020-com-01"],
        },
    },
    # MVSP 1.4 — Bug bounty
    "mvsp-1-4": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-24", "iso-2022-a-8-8"],
            "2013":     ["iso-2013-a-16-1-1", "iso-2013-a-12-6-1"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01"],
            "cisv81":   ["cisv81-17-1"],
            "c5_2020":  ["c5-2020-sim-01"],
        },
    },
    # MVSP 1.5 — Annual security training
    "mvsp-1-5": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-6-3"],
            "2013":     ["iso-2013-a-7-2-2"],
            "nistcsfv2": ["nist-csf-v2-pr-at-01", "nist-csf-v2-pr-at-02"],
            "eunis2":   ["eu-nis2-21-2-g"],
            "cisv81":   ["cisv81-14-1", "cisv81-14-9"],
            "soc2v2":   ["soc2-v2-cc1-4"],
            "c5_2020":  ["c5-2020-hr-04"],
        },
    },
    # MVSP 1.6 — Incident response plan
    "mvsp-1-6": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-5-24", "iso-2022-a-5-26"],
            "2013":     ["iso-2013-a-16-1-1", "iso-2013-a-16-1-5"],
            "nistcsfv2": ["nist-csf-v2-rs-ma-01", "nist-csf-v2-rs-ma-02"],
            "eunis2":   ["eu-nis2-21-2-b"],
            "cisv81":   ["cisv81-17-2", "cisv81-17-3"],
            "soc2v2":   ["soc2-v2-cc7-3"],
            "c5_2020":  ["c5-2020-sim-02", "c5-2020-sim-03"],
        },
    },
    # MVSP 1.7 — Logs
    "mvsp-1-7": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-15", "iso-2022-a-8-16", "iso-2022-a-8-17"],
            "2013":     ["iso-2013-a-12-4-1", "iso-2013-a-12-4-2", "iso-2013-a-12-4-3"],
            "nistcsfv2": ["nist-csf-v2-de-cm-01", "nist-csf-v2-de-ae-03"],
            "eunis2":   ["eu-nis2-21-2-b"],
            "cisv81":   ["cisv81-8-2", "cisv81-8-5", "cisv81-8-11"],
            "soc2v2":   ["soc2-v2-cc7-2"],
            "c5_2020":  ["c5-2020-ops-14", "c5-2020-ops-15"],
            "gdpr":     ["gdpr-art-32-audit-logging"],
        },
    },
    # MVSP 1.8 — SLA / uptime
    "mvsp-1-8": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-29", "iso-2022-a-8-14"],
            "2013":     ["iso-2013-a-17-1-1", "iso-2013-a-17-2-1"],
            "nistcsfv2": ["nist-csf-v2-rc-rp-01"],
            "cisv81":   ["cisv81-11-1"],
            "soc2v2":   ["soc2-v2-a1-1"],
            "c5_2020":  ["c5-2020-bcm-01"],
        },
    },
    # MVSP 2.1 — Single sign-on
    "mvsp-2-1": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-5-16", "iso-2022-a-5-17", "iso-2022-a-8-5"],
            "2013":     ["iso-2013-a-9-2-1", "iso-2013-a-9-4-2"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-02", "nist-csf-v2-pr-aa-03"],
            "eunis2":   ["eu-nis2-21-2-i"],
            "cisv81":   ["cisv81-5-2", "cisv81-6-3"],
            "soc2v2":   ["soc2-v2-cc6-1"],
            "c5_2020":  ["c5-2020-idm-02", "c5-2020-idm-03"],
        },
    },
    # MVSP 2.2 — HTTPS
    "mvsp-2-2": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-24", "iso-2022-a-8-20"],
            "2013":     ["iso-2013-a-10-1-1", "iso-2013-a-13-1-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ds-02"],
            "eunis2":   ["eu-nis2-21-2-h", "eu-nis2-21-2-j"],
            "cisv81":   ["cisv81-3-10", "cisv81-13-9"],
            "soc2v2":   ["soc2-v2-cc6-1"],
            "c5_2020":  ["c5-2020-cry-01", "c5-2020-cos-01"],
            "gdpr":     ["gdpr-art-32-encryption-in-transit"],
        },
    },
    # MVSP 2.3 — Security headers
    "mvsp-2-3": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-9", "iso-2022-a-8-20"],
            "2013":     ["iso-2013-a-14-1-2", "iso-2013-a-13-1-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ps-01"],
            "cisv81":   ["cisv81-9-1", "cisv81-13-4"],
            "soc2v2":   ["soc2-v2-cc7-1"],
            "c5_2020":  ["c5-2020-dev-05"],
        },
    },
    # MVSP 2.4 — Password policy
    "mvsp-2-4": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-5-17", "iso-2022-a-8-5"],
            "2013":     ["iso-2013-a-9-3-1", "iso-2013-a-9-4-3"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-01", "nist-csf-v2-pr-aa-02"],
            "eunis2":   ["eu-nis2-21-2-i", "eu-nis2-21-2-j"],
            "cisv81":   ["cisv81-5-2", "cisv81-6-3", "cisv81-6-5"],
            "soc2v2":   ["soc2-v2-cc6-1"],
            "c5_2020":  ["c5-2020-idm-04", "c5-2020-idm-05"],
        },
    },
    # MVSP 2.5 — Encryption at rest
    "mvsp-2-5": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-24"],
            "2013":     ["iso-2013-a-10-1-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ds-01"],
            "eunis2":   ["eu-nis2-21-2-h"],
            "cisv81":   ["cisv81-3-9", "cisv81-3-11"],
            "soc2v2":   ["soc2-v2-cc6-1"],
            "c5_2020":  ["c5-2020-cry-01", "c5-2020-cry-02"],
            "gdpr":     ["gdpr-art-32-encryption-at-rest"],
        },
    },
    # MVSP 2.6 — Vulnerability scanning
    "mvsp-2-6": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-8", "iso-2022-a-8-28"],
            "2013":     ["iso-2013-a-12-6-1", "iso-2013-a-14-2-7"],
            "nistcsfv2": ["nist-csf-v2-id-ra-01", "nist-csf-v2-de-cm-01"],
            "eunis2":   ["eu-nis2-21-2-e"],
            "cisv81":   ["cisv81-7-1", "cisv81-16-1"],
            "soc2v2":   ["soc2-v2-cc7-1"],
            "c5_2020":  ["c5-2020-dev-07", "c5-2020-ops-07"],
        },
    },
    # MVSP 2.7 — Unique credentials
    "mvsp-2-7": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-5-17", "iso-2022-a-8-19"],
            "2013":     ["iso-2013-a-9-2-4", "iso-2013-a-12-5-1"],
            "nistcsfv2": ["nist-csf-v2-pr-aa-01"],
            "cisv81":   ["cisv81-4-7", "cisv81-5-3"],
            "soc2v2":   ["soc2-v2-cc6-1"],
            "c5_2020":  ["c5-2020-idm-04"],
        },
    },
    # MVSP 2.8 — Input validation
    "mvsp-2-8": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-28", "iso-2022-a-8-26"],
            "2013":     ["iso-2013-a-14-1-2", "iso-2013-a-14-2-5"],
            "nistcsfv2": ["nist-csf-v2-pr-ps-01"],
            "cisv81":   ["cisv81-16-7", "cisv81-16-12"],
            "soc2v2":   ["soc2-v2-cc8-1"],
            "c5_2020":  ["c5-2020-dev-05", "c5-2020-dev-06"],
        },
    },
    # MVSP 3.1 — Data inventory
    "mvsp-3-1": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-9", "iso-2022-a-5-12"],
            "2013":     ["iso-2013-a-8-1-1", "iso-2013-a-8-2-1"],
            "nistcsfv2": ["nist-csf-v2-id-am-01", "nist-csf-v2-id-am-02"],
            "eunis2":   ["eu-nis2-21-2-i"],
            "cisv81":   ["cisv81-1-1", "cisv81-2-1"],
            "soc2v2":   ["soc2-v2-cc3-2"],
            "c5_2020":  ["c5-2020-am-01", "c5-2020-am-02"],
            "gdpr":     ["gdpr-art-30-personal-data-inventory"],
        },
    },
    # MVSP 3.2 — Data retention
    "mvsp-3-2": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-33"],
            "2013":     ["iso-2013-a-18-1-3"],
            "eunis2":   ["eu-nis2-21-2-i"],
            "cisv81":   ["cisv81-3-12", "cisv81-3-13"],
            "soc2v2":   ["soc2-v2-p4-2"],
            "gdpr":     ["gdpr-art-5-retention-timelines"],
        },
    },
    # MVSP 3.3 — Employees
    "mvsp-3-3": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-6-1", "iso-2022-a-6-2", "iso-2022-a-6-5"],
            "2013":     ["iso-2013-a-7-1-1", "iso-2013-a-7-1-2", "iso-2013-a-7-3-1"],
            "nistcsfv2": ["nist-csf-v2-gv-po-01"],
            "cisv81":   ["cisv81-6-2"],
            "soc2v2":   ["soc2-v2-cc1-4"],
            "c5_2020":  ["c5-2020-hr-01", "c5-2020-hr-02", "c5-2020-hr-06"],
        },
    },
    # MVSP 3.4 — Compliance
    "mvsp-3-4": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-35", "iso-2022-a-5-36"],
            "2013":     ["iso-2013-a-18-2-1", "iso-2013-a-18-2-2"],
            "nistcsfv2": ["nist-csf-v2-gv-oc-01"],
            "eunis2":   ["eu-nis2-21-2-f"],
            "c5_2020":  ["c5-2020-com-01"],
        },
    },
    # MVSP 3.5 — Sub-processors
    "mvsp-3-5": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-19", "iso-2022-a-5-21"],
            "2013":     ["iso-2013-a-15-1-1", "iso-2013-a-15-1-3"],
            "nistcsfv2": ["nist-csf-v2-gv-sc-01", "nist-csf-v2-gv-sc-06"],
            "eunis2":   ["eu-nis2-21-2-d", "eu-nis2-21-3"],
            "cisv81":   ["cisv81-15-1"],
            "soc2v2":   ["soc2-v2-cc9-2"],
            "c5_2020":  ["c5-2020-sso-01", "c5-2020-pss-01"],
            "gdpr":     ["gdpr-art-28-processor-contracts"],
        },
    },
    # MVSP 4.1 — SDLC security
    "mvsp-4-1": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-5-8", "iso-2022-a-8-25", "iso-2022-a-8-27"],
            "2013":     ["iso-2013-a-14-1-1", "iso-2013-a-14-2-1", "iso-2013-a-14-2-5"],
            "nistcsfv2": ["nist-csf-v2-gv-rm-01", "nist-csf-v2-id-ra-03"],
            "eunis2":   ["eu-nis2-21-2-e"],
            "cisv81":   ["cisv81-16-1", "cisv81-16-14"],
            "soc2v2":   ["soc2-v2-cc8-1"],
            "c5_2020":  ["c5-2020-dev-01", "c5-2020-dev-02"],
        },
    },
    # MVSP 4.2 — Separation of environments
    "mvsp-4-2": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-31"],
            "2013":     ["iso-2013-a-14-2-6"],
            "nistcsfv2": ["nist-csf-v2-pr-ps-04"],
            "cisv81":   ["cisv81-12-1", "cisv81-13-4"],
            "soc2v2":   ["soc2-v2-cc5-3"],
            "c5_2020":  ["c5-2020-dev-03"],
            "gdpr":     ["gdpr-art-35-segregation-of-environment"],
        },
    },
    # MVSP 4.3 — Third-party security
    "mvsp-4-3": {
        "relationship": "related",
        "mappings": {
            "2022":     ["iso-2022-a-5-20", "iso-2022-a-5-22"],
            "2013":     ["iso-2013-a-15-1-2", "iso-2013-a-15-2-1"],
            "nistcsfv2": ["nist-csf-v2-gv-sc-02", "nist-csf-v2-gv-sc-05"],
            "eunis2":   ["eu-nis2-21-2-d", "eu-nis2-21-3"],
            "cisv81":   ["cisv81-15-2", "cisv81-15-3"],
            "soc2v2":   ["soc2-v2-cc9-2"],
            "c5_2020":  ["c5-2020-sso-02", "c5-2020-sso-03"],
        },
    },
    # MVSP 4.4 — Backups
    "mvsp-4-4": {
        "relationship": "implements",
        "mappings": {
            "2022":     ["iso-2022-a-8-13"],
            "2013":     ["iso-2013-a-12-3-1"],
            "nistcsfv2": ["nist-csf-v2-pr-ds-11", "nist-csf-v2-rc-rp-04"],
            "eunis2":   ["eu-nis2-21-2-c"],
            "cisv81":   ["cisv81-11-2", "cisv81-11-4"],
            "soc2v2":   ["soc2-v2-a1-2"],
            "c5_2020":  ["c5-2020-ops-13", "c5-2020-bcm-03"],
        },
    },
}


# ── TypeScript generator ────────────────────────────────────────────────────────

def iso_key_to_ts(iso: str) -> str:
    """Format an ISO key for TypeScript object notation."""
    # Keys that need quotes: '2022', '2013', 'c5_2020'
    if re.match(r"^\d", iso) or "_" in iso:
        return f"'{iso}'"
    return iso


def mapping_to_ts(ctrl_id: str, entry: dict, indent: int = 2) -> str:
    """Format a single control mapping entry as TypeScript."""
    pad = "  " * indent
    pad1 = "  " * (indent + 1)
    pad2 = "  " * (indent + 2)

    rel = entry["relationship"]
    lines = [f"'{ctrl_id}': {{"]
    lines.append(f"{pad1}relationship: '{rel}',")
    lines.append(f"{pad1}mappings: {{")

    for iso, ids in sorted(entry["mappings"].items()):
        ids_str = ", ".join(f"'{i}'" for i in sorted(ids))
        lines.append(f"{pad2}{iso_key_to_ts(iso)}: [{ids_str}],")

    lines.append(f"{pad1}}},")
    lines.append(f"{pad}}},")

    return ("\n" + pad).join(lines)


def generate_ts(mappings: Dict[str, dict]) -> str:
    """Generate the complete TypeScript file content."""
    auto_frameworks = ["2022", "2013", "nistcsfv2", "cisv81", "soc2v2", "c5_2020"]
    hardcoded_frameworks = ["mvps", "eunis2", "gdpr"]

    # Section ordering: define prefix → (title) in desired output order
    SECTION_ORDER = [
        ("iso-2022-",    "ISO 27001:2022 controls (auto-mapped)"),
        ("iso-2013-",    "ISO 27001:2013 controls (auto-mapped)"),
        ("nist-csf-v2-", "NIST CSF v2 controls (auto-mapped)"),
        ("cisv81-",      "CIS Controls v8.1 controls (auto-mapped)"),
        ("soc2-v2-",     "SOC2 v2 controls (auto-mapped)"),
        ("c5-2020-",     "BSI C5:2020 controls (auto-mapped via Cisco CCF pivot)"),
        ("mvsp-",        "MVSP controls (hardcoded)"),
    ]

    # Group controls by section prefix
    grouped: Dict[str, List[str]] = defaultdict(list)
    unmatched: List[str] = []
    for ctrl_id in mappings:
        matched = False
        for prefix, _ in SECTION_ORDER:
            if ctrl_id.startswith(prefix):
                grouped[prefix].append(ctrl_id)
                matched = True
                break
        if not matched:
            unmatched.append(ctrl_id)

    lines = [
        "// AUTO-GENERATED by scripts/generate_framework_mappings_from_ciso.py",
        "// Source: CISO Assistant Community mapping YAML files",
        "//",
        "// Auto-mapped frameworks (via CISO Assistant YAML):",
        *[f"//   {fw}" for fw in auto_frameworks],
        "// Hardcoded frameworks:",
        *[f"//   {fw}" for fw in hardcoded_frameworks],
        "//",
        "// To regenerate:",
        "//   python3 scripts/generate_framework_mappings_from_ciso.py \\",
        "//     --ciso-dir /path/to/ciso-assistant-community/backend/library/libraries \\",
        "//     > lib/csc/framework-mappings.ts",
        "",
        "import { FrameworkMappings, setMappings } from './framework-mapping-utils';",
        "",
        "const frameworkMappings: FrameworkMappings = {",
    ]

    for prefix, title in SECTION_ORDER:
        ctrl_ids = sorted(grouped.get(prefix, []))
        if not ctrl_ids:
            continue
        lines.append("")
        lines.append(f"  // ─── {title} {'─' * max(0, 60 - len(title))}─")
        for ctrl_id in ctrl_ids:
            lines.append(f"  {mapping_to_ts(ctrl_id, mappings[ctrl_id], indent=1)}")

    if unmatched:
        lines.append("")
        lines.append("  // ─── Other controls ─────────────────────────────────────────────────────")
        for ctrl_id in sorted(unmatched):
            lines.append(f"  {mapping_to_ts(ctrl_id, mappings[ctrl_id], indent=1)}")

    lines += [
        "",
        "};",
        "",
        "// Register mappings with the lazy-load registry",
        "setMappings(frameworkMappings);",
        "",
        "export default frameworkMappings;",
        "",
    ]

    return "\n".join(lines)


# ── Main ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate framework-mappings.ts from CISO Assistant YAML files")
    parser.add_argument(
        "--ciso-dir",
        type=Path,
        default=DEFAULT_CISO_DIR,
        help=f"Path to CISO Assistant library directory (default: {DEFAULT_CISO_DIR})",
    )
    parser.add_argument(
        "--unicis-fw-dir",
        type=Path,
        default=DEFAULT_UNICIS_FW_DIR,
        help=f"Path to Unicis framework TS files (default: {DEFAULT_UNICIS_FW_DIR})",
    )
    args = parser.parse_args()

    ciso_dir: Path = args.ciso_dir
    unicis_fw_dir: Path = args.unicis_fw_dir

    print(f"Loading Unicis framework control IDs from: {unicis_fw_dir}", file=sys.stderr)
    all_control_ids = load_unicis_control_ids(unicis_fw_dir)
    for iso, ids in all_control_ids.items():
        print(f"  {iso}: {len(ids)} controls", file=sys.stderr)

    print(f"\nLoading CISO mapping files from: {ciso_dir}", file=sys.stderr)

    print("  Building direct mapping graph...", file=sys.stderr)
    direct_graph = build_graph(ciso_dir, DIRECT_MAPPING_FILES)
    print(f"  Direct graph: {len(direct_graph)} URN nodes", file=sys.stderr)

    print("  Building C5 2020 indirect mapping graph...", file=sys.stderr)
    c5_graph = build_c5_graph(
        ciso_dir,
        c5_to_pivot_file=C5_PIVOT_FILES[0],
        pivot_to_iso_file=C5_PIVOT_FILES[1],
    )
    print(f"  C5 graph: {len(c5_graph)} URN nodes", file=sys.stderr)

    print("\nBuilding Unicis control mappings...", file=sys.stderr)
    mappings = build_unicis_mappings(direct_graph, c5_graph, all_control_ids)
    print(f"  Auto-generated entries: {len(mappings)}", file=sys.stderr)

    # Add hardcoded MVSP mappings (validate IDs against Unicis frameworks)
    print("  Adding hardcoded MVSP mappings...", file=sys.stderr)
    mvsp_ids = all_control_ids.get("mvps", set())
    for ctrl_id, entry in MVSP_MAPPINGS.items():
        if ctrl_id not in mvsp_ids:
            print(f"  WARNING: MVSP control '{ctrl_id}' not found in Unicis framework", file=sys.stderr)
            continue
        # Filter mapped IDs to only those that exist in their framework
        filtered_mappings = {}
        for iso, ids in entry["mappings"].items():
            valid_ids = [i for i in ids if i in all_control_ids.get(iso, set())]
            if valid_ids:
                filtered_mappings[iso] = valid_ids
        if filtered_mappings:
            mappings[ctrl_id] = {"relationship": entry["relationship"], "mappings": filtered_mappings}

    print(f"  Total entries: {len(mappings)}", file=sys.stderr)

    # Count per-framework coverage
    fw_coverage: Dict[str, int] = defaultdict(int)
    for entry in mappings.values():
        for iso in entry["mappings"]:
            fw_coverage[iso] += 1
    print("\nCoverage summary (source controls with at least 1 mapping):", file=sys.stderr)
    for iso, count in sorted(fw_coverage.items()):
        print(f"  {iso}: {count} controls mapped", file=sys.stderr)

    print("\nGenerating TypeScript...", file=sys.stderr)
    ts_content = generate_ts(mappings)
    print(ts_content)


if __name__ == "__main__":
    main()
