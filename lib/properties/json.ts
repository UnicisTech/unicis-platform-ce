export type JsonObject = Record<string, unknown>;

export const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const asJsonObject = (value: unknown): JsonObject =>
  isJsonObject(value) ? value : {};
