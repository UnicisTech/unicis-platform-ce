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

export const statusLabels: Record<string, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  inreview: 'In Review',
  feedback: 'Feedback',
  done: 'Done',
  failed: 'Failed',
};

export const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const taskPriorities = ['low', 'medium', 'high'] as const;
export const DEFAULT_TASK_PRIORITY: TaskPriority = 'medium';

export type TaskPriority = (typeof taskPriorities)[number];
export const isTaskPriority = (value: string): value is TaskPriority =>
  taskPriorities.includes(value as TaskPriority);

export {
  getTaskModules,
  hasTaskModule,
  isTaskModuleKey,
  taskModuleKeys,
  type TaskModuleKey,
} from '@/lib/properties';

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
      name: 'Activity',
      active: activeTab === 'Activity',
    },
  ];
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', dateOptions as any);
  const formattedDate = formatter.format(date);
  return formattedDate;
};
