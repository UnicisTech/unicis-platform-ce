export const taskModuleKeys = [
  'rpa_procedure',
  'tia_procedure',
  'pia_risk',
  'rm_risk',
  'csc_controls',
] as const;

export type TaskModuleKey = (typeof taskModuleKeys)[number];

export const isTaskModuleKey = (value: string): value is TaskModuleKey =>
  taskModuleKeys.includes(value as TaskModuleKey);
