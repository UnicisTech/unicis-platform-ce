const dateOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
};

export const statuses = [
  'todo',
  'inprogress',
  'inreview',
  'feedback',
  'done',
  'failed',
];

export const taskPriorities = ['low', 'medium', 'high'] as const;
export const DEFAULT_TASK_PRIORITY: TaskPriority = 'medium';

export type TaskPriority = (typeof taskPriorities)[number];
export const isTaskPriority = (value: string): value is TaskPriority =>
  taskPriorities.includes(value as TaskPriority);

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

export const hasTaskModule = (
  properties: Record<string, unknown>,
  moduleKey: TaskModuleKey
) => {
  if (moduleKey === 'csc_controls') {
    return Object.keys(properties).some(
      (key) =>
        (key === 'csc_controls' || key.startsWith('csc_controls_')) &&
        Boolean(properties[key])
    );
  }

  return Boolean(properties[moduleKey]);
};

export const getTaskModules = (properties: Record<string, unknown>) =>
  taskModuleKeys.filter((moduleKey) => hasTaskModule(properties, moduleKey));

export const taskNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
    {
      name: 'Processing Activities',
      active: activeTab === 'Processing Activities',
    },
    {
      name: 'Transfer Impact Assessment',
      active: activeTab == 'Transfer Impact Assessment',
    },
    {
      name: 'Privacy Impact Assessment',
      active: activeTab === 'Privacy Impact Assessment',
    },
    {
      name: 'Cybersecurity Controls',
      active: activeTab === 'Cybersecurity Controls',
    },
    {
      name: 'Risk Management',
      active: activeTab === 'Risk Management',
    },
  ];
};

export const taskCommentsNavigations = (activeTab: string) => {
  return [
    {
      name: 'Comments',
      active: activeTab === 'Comments',
    },
    {
      name: 'Audit logs',
      active: activeTab === 'Audit logs',
    },
  ];
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', dateOptions as any);
  const formattedDate = formatter.format(date);
  return formattedDate;
};
