import type { RmRisk } from './services/api.js';

type PropertyObject = Record<string, unknown>;

const isPropertyObject = (value: unknown): value is PropertyObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getObjectTuple = (
  value: unknown,
  allowedLengths: readonly number[]
): PropertyObject[] | undefined => {
  if (
    !Array.isArray(value) ||
    !allowedLengths.includes(value.length) ||
    !value.every(isPropertyObject)
  ) {
    return undefined;
  }

  return value;
};

export const getRpaProcedure = (
  properties: unknown
): PropertyObject[] | undefined => {
  if (!isPropertyObject(properties)) return undefined;
  return getObjectTuple(properties.rpa_procedure, [6]);
};

export const getTiaProcedure = (
  properties: unknown
): PropertyObject[] | undefined => {
  if (!isPropertyObject(properties)) return undefined;
  return getObjectTuple(properties.tia_procedure, [2, 4]);
};

export const getPiaRisk = (
  properties: unknown
): Array<PropertyObject | null> | undefined => {
  if (!isPropertyObject(properties)) return undefined;
  const value = properties.pia_risk;
  if (
    !Array.isArray(value) ||
    value.length !== 5 ||
    !value.every((item, index) =>
      index === 4
        ? item === null || isPropertyObject(item)
        : isPropertyObject(item)
    )
  ) {
    return undefined;
  }

  return value;
};

export const getRmRisk = (
  properties: unknown
): [RmRisk, RmRisk] | undefined => {
  if (!isPropertyObject(properties)) return undefined;
  const value = getObjectTuple(properties.rm_risk, [2]);
  return value ? (value as [RmRisk, RmRisk]) : undefined;
};

export const hasRpaProcedure = (properties: unknown): boolean =>
  getRpaProcedure(properties) !== undefined;

export const hasTiaProcedure = (properties: unknown): boolean =>
  getTiaProcedure(properties) !== undefined;

export const hasPiaRisk = (properties: unknown): boolean =>
  getPiaRisk(properties) !== undefined;

export const getAllCscControls = (properties: unknown): string[] => {
  if (!isPropertyObject(properties)) return [];

  const controls = Object.entries(properties).flatMap(([key, value]) => {
    if (key !== 'csc_controls' && !key.startsWith('csc_controls_')) return [];
    if (!Array.isArray(value)) return [];
    return value.filter(
      (control): control is string => typeof control === 'string'
    );
  });

  return [...new Set(controls)];
};
