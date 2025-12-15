import { Prisma } from '@prisma/client';
import { mapCscControlToId, mapCscControlToIdAny } from './helpers';
import { getCscControlsProp } from '@/lib/csc';
import { ISO } from 'types';

export type JsonWritable = Prisma.InputJsonValue;

function asObject(value: JsonWritable): Record<string, any> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, any>;
}

/**
 * 1) Renaming csc_controls -> csc_controls_mvps
 */
export function renameCscControlsToMvps(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  if (obj.csc_controls_mvps !== undefined || obj.csc_controls === undefined) {
    return props;
  }

  const cloned: Record<string, any> = { ...obj };

  cloned.csc_controls_mvps = cloned.csc_controls;
  delete cloned.csc_controls;

  return cloned;
}

export function normalizeCscControls(
  props: JsonWritable,
  framework: ISO
): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const propName = getCscControlsProp(framework);
  const raw = obj[propName];

  if (!Array.isArray(raw)) {
    return props;
  }

  const src = raw as unknown[];
  const nextControls: string[] = [];
  let changed = false;

  for (const item of src) {
    const label = String(item);
    const controlId = mapCscControlToId(label, framework);

    const finalValue = controlId ?? label;
    nextControls.push(finalValue);

    if (finalValue !== label) {
      changed = true;
    }
  }

  if (!changed) {
    return props;
  }

  const cloned: Record<string, any> = {
    ...obj,
    [propName]: nextControls,
  };

  return cloned;
}

export function normalizeCscControlsMvps(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, 'mvps')
}

export function normalizeCscControls2013(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, '2013')
}

export function normalizeCscControls2022(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, '2022')
}

export function normalizeCscControlsNistCsfV2(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, 'nistcsfv2')
}

export function normalizeCscControlsEuNis2(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, 'eunis2')
}

export function normalizeCscControlsGdpr(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, 'gdpr')
}

export function normalizeCscControlsCisV81(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, 'cisv81')
}

export function normalizeCscControlSoc2V2(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, 'soc2v2')
}

export function normalizeCscControlC5_2020(props: JsonWritable): JsonWritable {
    return normalizeCscControls(props, 'c5_2020')
}

export function normalizeCscAuditLogs(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const raw = obj.csc_audit_logs;

  if (!Array.isArray(raw)) {
    return props;
  }

  const logs = raw as any[];
  const nextLogs: any[] = [];
  let changed = false;

  for (const log of logs) {
    const originalDiff = log?.diff ?? {};
    const prevRaw = originalDiff.prevValue;
    const nextRaw = originalDiff.nextValue;

    let finalPrev = prevRaw;
    let finalNext = nextRaw;

    // prevValue: string | null
    if (typeof prevRaw === 'string') {
      const mappedPrev = mapCscControlToIdAny(prevRaw);
      if (mappedPrev) {
        finalPrev = mappedPrev;
      }
    }

    // nextValue: string
    if (typeof nextRaw === 'string') {
      const mappedNext = mapCscControlToIdAny(nextRaw);
      if (mappedNext) {
        finalNext = mappedNext;
      }
    }

    if (finalPrev !== prevRaw || finalNext !== nextRaw) {
      changed = true;
    }

    const clonedLog = {
      ...log,
      diff: {
        ...originalDiff,
        prevValue: finalPrev,
        nextValue: finalNext,
      },
    };

    nextLogs.push(clonedLog);
  }

  if (!changed) {
    return props;
  }

  const clonedProps: Record<string, any> = {
    ...obj,
    csc_audit_logs: nextLogs,
  };

  return clonedProps;
}


const transforms = [
  renameCscControlsToMvps,
  normalizeCscControlsMvps,
  normalizeCscControls2013,
  normalizeCscControls2022,
  normalizeCscControlsNistCsfV2,
  normalizeCscControlsEuNis2,
  normalizeCscControlsGdpr,
  normalizeCscControlsCisV81,
  normalizeCscControlSoc2V2,
  normalizeCscControlC5_2020,
  normalizeCscAuditLogs,
] as const;

export function transformTaskProperties(
  props: Prisma.JsonValue
): Prisma.InputJsonValue {
  let current: JsonWritable = props as JsonWritable;

  for (const fn of transforms) {
    current = fn(current);
  }

  return current;
}
