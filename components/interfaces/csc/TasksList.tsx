import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Task } from 'types';
import { getAllCscControls } from '@/lib/properties';

const TasksList = ({
  tasks,
  control,
}: {
  tasks: Array<Task>;
  control: string;
}) => {
  const [selectedTasks] = useState<Array<Task>>(
    tasks.filter((task) => getAllCscControls(task.properties).includes(control))
  );

  const router = useRouter();
  const { slug } = router.query;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {selectedTasks.map((task) => (
        <Link
          key={task.taskNumber}
          href={`/teams/${slug}/tasks/${task.taskNumber}`}
          title={task.title}
          className="underline whitespace-nowrap"
        >
          #{task.taskNumber}
        </Link>
      ))}
    </div>
  );
};

export default TasksList;
