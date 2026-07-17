import type { TaskList } from 'graphile-worker';

import { fleetRetentionCleanup } from './fleet-retention-cleanup';
import { taskDueCheck } from './task-due';
import { taskRecurrenceGenerate } from './task-recurrence-generate';

export const taskList: TaskList = {
  'fleet-retention-cleanup': fleetRetentionCleanup,
  'task-due-check': taskDueCheck,
  'task-recurrence-generate': taskRecurrenceGenerate,
};
