import type { TaskList } from 'graphile-worker';

import { taskDueCheck } from './task-due';

export const taskList: TaskList = {
  'task.due.check': taskDueCheck,
};
