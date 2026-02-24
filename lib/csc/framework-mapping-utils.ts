import type { ISO } from 'types';

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

// Lazy-loaded mappings (imported separately to keep bundle manageable)
let _mappings: FrameworkMappings | null = null;

export function setMappings(m: FrameworkMappings) {
  _mappings = m;
}

export function getFrameworkMappings(
  controlId: string
): ControlMappingEntry | null {
  return _mappings?.[controlId] ?? null;
}

export function getMappingCount(
  controlId: string,
  enabledFrameworks: ISO[],
  currentFramework: ISO
): number {
  const entry = getFrameworkMappings(controlId);
  if (!entry) return 0;
  return enabledFrameworks
    .filter((f) => f !== currentFramework)
    .reduce((n, fw) => n + (entry.mappings[fw]?.length ?? 0), 0);
}

export interface CoverageStats {
  sourceFramework: ISO;
  targetFramework: ISO;
  mappedCount: number;
  totalControls: number;
  coveragePercent: number;
}

export function computeCoverageMatrix(
  enabledFrameworks: ISO[],
  frameworkControls: Partial<Record<ISO, string[]>>
): CoverageStats[] {
  const stats: CoverageStats[] = [];
  for (const src of enabledFrameworks) {
    const srcControls = frameworkControls[src] ?? [];
    for (const tgt of enabledFrameworks) {
      if (src === tgt) continue;
      let mappedCount = 0;
      for (const cid of srcControls) {
        const e = getFrameworkMappings(cid);
        if (e?.mappings[tgt]?.length) mappedCount++;
      }
      stats.push({
        sourceFramework: src,
        targetFramework: tgt,
        mappedCount,
        totalControls: srcControls.length,
        coveragePercent:
          srcControls.length > 0
            ? Math.round((mappedCount / srcControls.length) * 100)
            : 0,
      });
    }
  }
  return stats;
}
