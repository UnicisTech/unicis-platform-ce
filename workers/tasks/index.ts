import type { TaskList } from 'graphile-worker';

import { taskDueCheck } from './task-due';
import { taskRecurrenceGenerate } from './task-recurrence-generate';

export const taskList: TaskList = {
  'task-due-check': taskDueCheck,
  'task-recurrence-generate': taskRecurrenceGenerate,
};
