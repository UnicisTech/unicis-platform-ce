import type { Serialized } from 'types';

export const serializeForApi = <T>(data: T): Serialized<T> =>
  JSON.parse(JSON.stringify(data)) as Serialized<T>;
