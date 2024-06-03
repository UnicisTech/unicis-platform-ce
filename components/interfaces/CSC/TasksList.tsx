import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Task } from '@prisma/client';

const TasksList = ({
  tasks,
  control,
}: {
  tasks: Array<Task>;
  control: string;
}) => {
  const [selectedTasks] = useState<Array<Task>>(
    tasks.filter((task: any) =>
      task.properties?.csc_controls?.find((item: string) => item === control)
    )
  );

  const router = useRouter();
  const { slug } = router.query;

  return (
    <div className="flex flex-col">
      {selectedTasks.map((task, index) => (
        <Link key={index} href={`/teams/${slug}/tasks/${task.taskNumber}`}>
          <div className="flex items-center justify-start space-x-2">
            <span className="underline">{task.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TasksList;
