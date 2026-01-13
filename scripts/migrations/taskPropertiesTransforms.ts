import { Prisma } from '@prisma/client';
import { mapCscControlToId, mapCscControlToIdAny, optionArrayToStringArray, optionToString, error, preview, mapValueByFieldConfig, rpaFieldToId, countryToValue, tiaFieldToId, piaFieldToId, stripOuterQuotes, resolvePiaAuditFieldId, tryExtractValueFromStringifiedJson, rmFieldToId } from './helpers';
import { getCscControlsProp } from '@/lib/csc';
import { Diff, ISO } from 'types';

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
  return normalizeCscControls(props, 'mvps');
}

export function normalizeCscControls2013(props: JsonWritable): JsonWritable {
  return normalizeCscControls(props, '2013');
}

export function normalizeCscControls2022(props: JsonWritable): JsonWritable {
  return normalizeCscControls(props, '2022');
}

export function normalizeCscControlsNistCsfV2(
  props: JsonWritable
): JsonWritable {
  return normalizeCscControls(props, 'nistcsfv2');
}

export function normalizeCscControlsEuNis2(props: JsonWritable): JsonWritable {
  return normalizeCscControls(props, 'eunis2');
}

export function normalizeCscControlsGdpr(props: JsonWritable): JsonWritable {
  return normalizeCscControls(props, 'gdpr');
}

export function normalizeCscControlsCisV81(props: JsonWritable): JsonWritable {
  return normalizeCscControls(props, 'cisv81');
}

export function normalizeCscControlSoc2V2(props: JsonWritable): JsonWritable {
  return normalizeCscControls(props, 'soc2v2');
}

export function normalizeCscControlC5_2020(props: JsonWritable): JsonWritable {
  return normalizeCscControls(props, 'c5_2020');
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

// ------ RPA ------

function normalizeRpaProcedure(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const raw = obj.rpa_procedure;
  if (!Array.isArray(raw)) return props;

  let changed = false;

  const next = raw.map((block, blockIndex) => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) return block;

    const src = block as Record<string, unknown>;
    const cloned: Record<string, unknown> = { ...src };

    for (const [key, value] of Object.entries(src)) {
      const ctx = `rpa_procedure[${blockIndex}].${key}`;

      // Option[]
      const arrResult = optionArrayToStringArray(value, ctx);
      if (arrResult !== value) {
        cloned[key] = arrResult as any;
        changed = true;
        continue;
      }

      // Option
      const singleResult = optionToString(value, ctx);
      if (singleResult !== value) {
        cloned[key] = singleResult as any;
        changed = true;
      }
    }

    return cloned;
  });

  if (!changed) return props;

  return {
    ...obj,
    rpa_procedure: next,
  };
}

function normalizeRpaAuditLogs(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const raw = obj.rpa_audit_logs;
  if (!Array.isArray(raw)) return props;

  let changed = false;
  const nextLogs: Prisma.InputJsonValue[] = [];

  for (let i = 0; i < raw.length; i++) {
    const log = raw[i];

    if (!log || typeof log !== 'object' || Array.isArray(log)) {
      nextLogs.push(log);
      continue;
    }

    const event = String((log as any).event ?? '');

    if (event !== 'updated') {
      nextLogs.push(log);
      continue;
    }

    const diff = (log as any).diff;
    if (!diff || typeof diff !== 'object' || Array.isArray(diff)) {
      error(
        `[RPA_AUDIT] Updated log without valid diff`,
        `logIndex=${i}`,
        `event=${event}`,
        `diff=${preview(diff)}`
      );
      nextLogs.push(log);
      continue;
    }

    const fieldRaw = (diff as any).field;
    const fieldStr = typeof fieldRaw === 'string' ? fieldRaw : String(fieldRaw ?? '');
    const fieldId = rpaFieldToId(fieldStr);

    if (!fieldId) {
      error(
        `[RPA_AUDIT] Unknown field`,
        `logIndex=${i}`,
        `event=${event}`,
        `field=${preview(fieldRaw)}`
      );
      nextLogs.push(log);
      continue;
    }

    const prevRaw = (diff as any).prevValue;
    const nextRaw = (diff as any).nextValue;

    const prevRes = mapValueByFieldConfig(fieldId, prevRaw, { idx: i, which: 'prevValue' }, 'RPA');
    const nextRes = mapValueByFieldConfig(fieldId, nextRaw, { idx: i, which: 'nextValue' }, 'RPA');

    const fieldChanged = fieldId !== fieldRaw;
    const thisChanged = fieldChanged || prevRes.changed || nextRes.changed;

    if (!thisChanged) {
      nextLogs.push(log);
      continue;
    }

    changed = true;

    nextLogs.push({
      ...(log as any),
      diff: {
        ...(diff as any),
        field: fieldId,
        prevValue: prevRes.value,
        nextValue: nextRes.value,
      },
    });
  }

  if (!changed) return props;

  return {
    ...obj,
    rpa_audit_logs: nextLogs,
  };
}

// ------ RPA ------

// ------ TIA ------

function normalizeTiaProcedure(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const raw = obj.tia_procedure;
  if (!Array.isArray(raw)) return props;

  let changed = false;

  const next = raw.map((block, blockIndex) => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) return block;

    const src = block as Record<string, unknown>;
    const cloned: Record<string, unknown> = { ...src };

    for (const [key, value] of Object.entries(src)) {
      const ctx = `tia_procedure[${blockIndex}].${key}`;

      const mapped = countryToValue(value, ctx);
      if (mapped !== value) {
        cloned[key] = mapped as any;
        changed = true;
      }
    }

    return cloned;
  });

  if (!changed) return props;

  return {
    ...obj,
    tia_procedure: next as Prisma.InputJsonValue[],
  } as Prisma.InputJsonValue;
}

function normalizeTiaAuditLogs(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const raw = obj.tia_audit_logs;
  if (!Array.isArray(raw)) return props;

  let changed = false;
  const nextLogs: Prisma.InputJsonValue[] = [];

  for (let i = 0; i < raw.length; i++) {
    const log = raw[i];

    if (!log || typeof log !== 'object' || Array.isArray(log)) {
      nextLogs.push(log);
      continue;
    }

    const event = String((log as any).event ?? '');

    if (event !== 'updated') {
      nextLogs.push(log);
      continue;
    }

    const diff = (log as any).diff;
    if (!diff || typeof diff !== 'object' || Array.isArray(diff)) {
      error(
        `[TIA_AUDIT] Updated log without valid diff`,
        `logIndex=${i}`,
        `event=${event}`,
        `diff=${preview(diff)}`
      );
      nextLogs.push(log);
      continue;
    }

    const fieldRaw = (diff as any).field;
    const fieldStr = typeof fieldRaw === 'string' ? fieldRaw : String(fieldRaw ?? '');
    const fieldId = tiaFieldToId(fieldStr);

    if (!fieldId) {
      error(
        `[TIA_AUDIT] Unknown field`,
        `logIndex=${i}`,
        `event=${event}`,
        `field=${preview(fieldRaw)}`
      );
      nextLogs.push(log);
      continue;
    }

    const prevRaw = (diff as any).prevValue;
    const nextRaw = (diff as any).nextValue;

    const prevRes = mapValueByFieldConfig(fieldId, prevRaw, { idx: i, which: 'prevValue' }, 'TIA');
    const nextRes = mapValueByFieldConfig(fieldId, nextRaw, { idx: i, which: 'nextValue' }, 'TIA');

    const fieldChanged = fieldId !== fieldRaw;
    const thisChanged = fieldChanged || prevRes.changed || nextRes.changed;

    if (!thisChanged) {
      nextLogs.push(log);
      continue;
    }

    changed = true;

    nextLogs.push({
      ...(log as any),
      diff: {
        ...(diff as any),
        field: fieldId,
        prevValue: prevRes.value,
        nextValue: nextRes.value,
      },
    });
  }

  if (!changed) return props;

  return {
    ...obj,
    tia_audit_logs: nextLogs,
  };
}

// ------ TIA ------


// ------ PIA ------

function normalizePiaAuditLogs(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const raw = obj.pia_audit_logs;
  if (!Array.isArray(raw)) return props;

  let changed = false;
  const nextLogs: Prisma.InputJsonValue[] = [];

  for (let i = 0; i < raw.length; i++) {
    const log = raw[i];

    if (!log || typeof log !== 'object' || Array.isArray(log)) {
      nextLogs.push(log);
      continue;
    }

    const event = String((log as any).event ?? '');

    if (event !== 'updated') {
      nextLogs.push(log);
      continue;
    }

    const diff = (log as any).diff;
    if (!diff || typeof diff !== 'object' || Array.isArray(diff)) {
      error(
        `[PIA_AUDIT] Updated log without valid diff`,
        `logIndex=${i}`,
        `event=${event}`,
        `diff=${preview(diff)}`
      );
      nextLogs.push(log);
      continue;
    }

    const fieldRaw = (diff as any).field;
    const fieldStr = typeof fieldRaw === 'string' ? fieldRaw : String(fieldRaw ?? '');
    const fieldId = resolvePiaAuditFieldId({diff: diff as Diff, event: diff.event});

    if (!fieldId) {
      error(
        `[PIA_AUDIT] Unknown field`,
        `logIndex=${i}`,
        `event=${event}`,
        `field=${preview(fieldRaw)}`
      );
      nextLogs.push(log);
      continue;
    }

    const prevRaw = stripOuterQuotes((diff as any).prevValue);
    const nextRaw = stripOuterQuotes((diff as any).nextValue);

    const prevRes = mapValueByFieldConfig(fieldId, prevRaw, { idx: i, which: 'prevValue' }, 'PIA');
    const nextRes = mapValueByFieldConfig(fieldId, nextRaw, { idx: i, which: 'nextValue' }, 'PIA');

    const fieldChanged = fieldId !== fieldRaw;
    const thisChanged = fieldChanged || prevRes.changed || nextRes.changed;

    if (!thisChanged) {
      nextLogs.push(log);
      continue;
    }

    changed = true;

    nextLogs.push({
      ...(log as any),
      diff: {
        ...(diff as any),
        field: fieldId,
        prevValue: prevRes.value,
        nextValue: nextRes.value,
      },
    });
  }

  if (!changed) return props;

  return {
    ...obj,
    pia_audit_logs: nextLogs,
  };
}

// ------ PIA ------

// ------ RM ------

function normalizeRmRisk(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  let raw = obj.rm_risk;
  if (!Array.isArray(raw)) return props;

  // let changed = false;

  if (!raw[0].AssetOwner?.value) {
    error(
        `[RM_RISK] No AssetOwner value`,
        `logIndex=${0}`,
        `event=${'none'}`,
        `field=${'none'}`
      );
    return props;
  }

  raw[0].AssetOwner = raw[0].AssetOwner.value

  return {
    ...obj,
    rm_risk: raw as Prisma.InputJsonValue[],
  } as Prisma.InputJsonValue;
}

function normalizeRmAuditLogs(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const raw = (obj as any).rm_audit_logs;
  if (!Array.isArray(raw)) return props;

  let changed = false;
  const nextLogs: Prisma.InputJsonValue[] = [];

  for (let i = 0; i < raw.length; i++) {
    const log = raw[i];

    if (!log || typeof log !== 'object' || Array.isArray(log)) {
      nextLogs.push(log as Prisma.InputJsonValue);
      continue;
    }

    const event = String((log as any).event ?? '');
    if (event !== 'updated') {
      nextLogs.push(log as Prisma.InputJsonValue);
      continue;
    }

    const diff = (log as any).diff;
    if (!diff || typeof diff !== 'object' || Array.isArray(diff)) {
      error(`[RM_AUDIT] Updated log without valid diff`, `logIndex=${i}`);
      nextLogs.push(log as Prisma.InputJsonValue);
      continue;
    }

    const prevRaw = (diff as any).prevValue;
    const nextRaw = (diff as any).nextValue;

    const prevStripped = stripOuterQuotes(prevRaw);
    const nextStripped = stripOuterQuotes(nextRaw);

    let prevOut: any = prevStripped;
    let nextOut: any = nextStripped;

    let prevChanged = prevOut !== prevRaw;
    let nextChanged = nextOut !== nextRaw;

    const fieldRaw = (diff as any).field;
    const fieldStr = typeof fieldRaw === 'string' ? fieldRaw : String(fieldRaw ?? '');
    const fieldId = rmFieldToId(fieldStr);

    if (!fieldId) {
      error(`[RM_AUDIT] Unknown field`, `logIndex=${i}`, `field=${fieldStr}`);

      if (!prevChanged && !nextChanged) {
        nextLogs.push(log as Prisma.InputJsonValue);
        continue;
      }

      changed = true;
      nextLogs.push({
        ...(log as any),
        diff: {
          ...(diff as any),
          prevValue: prevOut,
          nextValue: nextOut,
        },
      } as Prisma.InputJsonValue);
      continue;
    }

    if (fieldId === 'AssetOwner') {
      const p = tryExtractValueFromStringifiedJson(prevOut, `logIndex=${i} prevValue`);
      const n = tryExtractValueFromStringifiedJson(nextOut, `logIndex=${i} nextValue`);

      prevOut = p.out;
      nextOut = n.out;

      prevChanged = prevChanged || p.changed;
      nextChanged = nextChanged || n.changed;
    }

    const fieldChanged = fieldId !== fieldRaw;

    if (!fieldChanged && !prevChanged && !nextChanged) {
      nextLogs.push(log as Prisma.InputJsonValue);
      continue;
    }

    changed = true;

    nextLogs.push({
      ...(log as any),
      diff: {
        ...(diff as any),
        field: fieldId,
        prevValue: prevOut,
        nextValue: nextOut,
      },
    } as Prisma.InputJsonValue);
  }

  if (!changed) return props;

  return {
    ...(obj as any),
    rm_audit_logs: nextLogs,
  } as Prisma.InputJsonValue;
}

// ------ RM ------

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
  normalizeRpaProcedure,
  normalizeRpaAuditLogs,
  normalizeTiaProcedure,
  normalizeTiaAuditLogs,
  // normalizePiaAuditLogs,
  normalizeRmRisk,
  normalizeRmAuditLogs,
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
