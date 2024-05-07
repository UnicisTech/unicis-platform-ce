import React, { useState } from 'react';
import { getControlOptions } from '@/components/defaultLanding/data/configs/csc';
import type { Task } from '@prisma/client';
import { ControlOption, ISO } from 'types';

const TaskStatusesDetail = ({
  ISO,
  tasks,
  statuses,
}: {
  ISO: ISO;
  tasks: Array<Task> | any;
  statuses: any;
}) => {
  const [filteredControls, setFilteredControls] = useState<
    Array<ControlOption>
  >(getControlOptions(ISO));

  return (
    <>
      <div className="flex px-2 gap-4">
        <h1 className="text-center text-sm font-bold">Total Tasks</h1>
        <span className="font-sans text-sm font-bold">{tasks?.length}</span>
      </div>
    </>
  );
};

export default TaskStatusesDetail;
