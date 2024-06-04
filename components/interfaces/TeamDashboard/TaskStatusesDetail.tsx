import React from 'react';
import type { Task } from '@prisma/client';

const TaskStatusesDetail = ({
  tasks,
  statusCounts,
}: {
  tasks: Array<Task> | any;
  statusCounts: { [key: string]: number };
}) => {
  return (
    <div className="grid grid-cols-2 items-center lg:grid-cols-2 sm:grid-cols-2 gap-4">
      <div className="flex-1 bg-blue-100 dark:text-white dark:bg-blue-950 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
        <h1 className="text-sm font-bold">Total Tasks</h1>
        <span className="font-sans text-sm font-bold">
          {tasks?.length || 0}
        </span>
      </div>
      <div className="flex-1 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
        <h1 className="text-sm font-bold">To Do</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.todo || 0}
        </span>
      </div>
      <div className="flex-1 w-full ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
        <h1 className="text-sm font-bold">In Progress</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.inprogress || 0}
        </span>
      </div>
      <div className="flex-1  ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
        <h1 className="text-sm font-bold">In Review</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.inreview || 0}
        </span>
      </div>
      <div className="flex-1 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
        <h1 className="text-sm font-bold">Feedback</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.feedback || 0}
        </span>
      </div>
      <div className="flex-1 ring-1 ring-gray-300 rounded-md text-center justify-center p-4">
        <h1 className="text-sm font-bold">Done</h1>
        <span className="font-sans text-sm font-bold">
          {statusCounts?.done || 0}
        </span>
      </div>
    </div>
  );
};

export default TaskStatusesDetail;
