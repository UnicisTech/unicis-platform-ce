import React, { useEffect, useRef, useState } from 'react';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { getCscControlsProp } from '@/lib/csc';
import type { Task } from '@prisma/client';
import type { CscOption, ISO } from 'types';

const TaskSelector = ({
  tasks,
  control,
  handler,
  ISO,
}: {
  tasks: Array<Task>;
  control: string;
  handler: (
    action: string,
    dataToRemove: CscOption[],
    control: string
  ) => Promise<void>;
  ISO: ISO;
}) => {
  const [options, setOptions] = useState<CscOption[]>([]);
  const [selected, setSelected] = useState<CscOption[]>([]);
  const prevSelectedRef = useRef<CscOption[]>([]);

  useEffect(() => {
    const opts = tasks.map((task) => ({
      label: task.title,
      value: task.taskNumber,
    }));
    const cscStatusesProp = getCscControlsProp(ISO);
    const initialSelected = tasks
      .filter((task: any) =>
        task.properties?.[cscStatusesProp]?.includes(control)
      )
      .map((task) => ({
        label: task.title,
        value: task.taskNumber,
      }));

    setOptions(opts);
    setSelected(initialSelected);
    prevSelectedRef.current = initialSelected;
  }, [tasks, control, ISO]);

  const handleValueChange = async (newValues: string[]) => {
    const all = options;
    const prev = prevSelectedRef.current;

    const newSelected = all.filter((opt) => newValues.includes(opt.value.toString()));
    setSelected(newSelected);

    const added = newSelected.filter(
      (newOpt) => !prev.some((oldOpt) => oldOpt.value === newOpt.value)
    );
    const removed = prev.filter(
      (oldOpt) => !newSelected.some((newOpt) => newOpt.value === oldOpt.value)
    );

    if (added.length) {
      await handler('select-option', added, control);
    }
    if (removed.length) {
      await handler('remove-value', removed, control);
    }

    prevSelectedRef.current = newSelected;
  };

  return (
    <div className="w-full">
      <MultiSelect
        options={options.map((opt) => ({
          label: opt.label,
          value: opt.value.toString(),
        }))}
        defaultValue={selected.map((opt) => opt.value.toString())}
        onValueChange={handleValueChange}
        placeholder="Tasks"
        animation={0}
      />
    </div>
  );
};

export default TaskSelector;
