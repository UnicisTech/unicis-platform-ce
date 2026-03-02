import { Prisma } from '@/generated/client';
import { mapCscControlToId, mapCscStatusValueLabelToId } from './helpers';
import { ISO } from 'types';
import { getCscStatusesProp } from '@/lib/csc';

export type JsonWritable = Prisma.InputJsonValue;

// Helper: recieve object from Json
function asObject(value: JsonWritable): Record<string, any> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, any>;
}

/**
 * 1) csc_statuses -> csc_statuses_mvps
 *    Idempotent: if there is already csc_statuses_mvps or there is no csc_statuses — does nothing.
 */
export function renameCscStatusesToMvps(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  if (obj.csc_statuses_mvps !== undefined || obj.csc_statuses === undefined) {
    return props;
  }
  // Avoid mutations
  const cloned: Record<string, any> = { ...obj };

  cloned.csc_statuses_mvps = cloned.csc_statuses;
  delete cloned.csc_statuses;

  return cloned;
}

export function replaceDefaultInCscIso(props: JsonWritable): JsonWritable {
  const obj = asObject(props);
  if (!obj) return props;

  const arr = obj.csc_iso;
  if (!Array.isArray(arr)) return props; // якщо не масив — нічого не робимо

  // якщо немає "default" — нічого не робимо
  if (!arr.includes('default')) return props;

  // створюємо копію properties
  const cloned: Record<string, any> = { ...obj };

  // створюємо копію масиву з заміною
  cloned.csc_iso = arr.map((v) => (v === 'default' ? 'mvps' : v));

  return cloned;
}

export function normalizeCscStatuses(
  props: JsonWritable,
  framework: ISO
): JsonWritable {
  console.log('normalizeCscStatuses exec', framework);
  const obj = asObject(props);
  if (!obj) return props;

  const propName = getCscStatusesProp(framework);
  const raw = obj[propName];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return props;
  }

  const src = raw as Record<string, any>;
  const nextStatuses: Record<string, any> = {};
  let changed = false;

  for (const [labelKey, labelValue] of Object.entries(src)) {
    const keyId = mapCscControlToId(labelKey, framework);
    const valueId = mapCscStatusValueLabelToId(String(labelValue));

    // якщо не знайшли мапінг – лог уже в хелперах, дані не губимо
    const finalKey = keyId ?? labelKey;
    const finalValue = valueId ?? labelValue;

    nextStatuses[finalKey] = finalValue;

    if (finalKey !== labelKey || finalValue !== labelValue) {
      changed = true;
    }
  }

  if (!changed) {
    return props;
  }

  const cloned: Record<string, any> = { ...obj, [propName]: nextStatuses };

  return cloned;
}

export function normalizeCscStatusesMvps(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, 'mvps');
}

export function normalizeCscStatuses2013(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, '2013');
}

export function normalizeCscStatuses2022(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, '2022');
}

export function normalizeCscStatusesNistCsfV2(
  props: JsonWritable
): JsonWritable {
  return normalizeCscStatuses(props, 'nistcsfv2');
}

export function normalizeCscStatusesEuNis2(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, 'eunis2');
}

export function normalizeCscStatusesGdpr(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, 'gdpr');
}

export function normalizeCscStatusesCisV81(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, 'cisv81');
}

export function normalizeCscStatusesSoc2V2(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, 'soc2v2');
}

export function normalizeCscStatusesC52020(props: JsonWritable): JsonWritable {
  return normalizeCscStatuses(props, 'c5_2020');
}

// Список усіх трансформацій у потрібному порядку
const transforms = [
  renameCscStatusesToMvps,
  replaceDefaultInCscIso,
  normalizeCscStatusesMvps,
  normalizeCscStatuses2013,
  normalizeCscStatuses2022,
  normalizeCscStatusesNistCsfV2,
  normalizeCscStatusesEuNis2,
  normalizeCscStatusesGdpr,
  normalizeCscStatusesCisV81,
  normalizeCscStatusesSoc2V2,
  normalizeCscStatusesC52020,
] as const;

/**
 * Головна функція, яку викликає міграційний скрипт.
 * Проганяє properties через усі трансформації по черзі.
 */
export function transformTeamProperties(
  props: Prisma.JsonValue
): Prisma.InputJsonValue {
  let current: JsonWritable = props as JsonWritable;

  for (const fn of transforms) {
    current = fn(current);
  }

  return current;
}
