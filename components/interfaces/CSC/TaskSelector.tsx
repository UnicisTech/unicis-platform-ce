import React, { useRef } from 'react';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { getCscControlsProp } from '@/lib/csc';
import type { Task } from '@prisma/client';
import type { CscOption, ISO } from 'types';

const getSelectedOptions = (
  ISO: ISO,
  control: string,
  tasks: Array<Task>
): CscOption[] => {
  const cscStatusesProp = getCscControlsProp(ISO);
  return tasks
    .filter((task: any) =>
      task.properties?.[cscStatusesProp]?.includes(control)
    )
    .map((task) => ({
      label: task.title,
      value: task.taskNumber,
    }));
};

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
    dataToChange: {
      value: number;
    }[],
    control: string
  ) => Promise<string | undefined>;
  ISO: ISO;
}) => {
  const orderedTasks = React.useMemo(
    () => [...tasks].sort((a, b) => b.taskNumber - a.taskNumber),
    [tasks]
  );
  const options: CscOption[] = orderedTasks.map((task) => ({
    label: task.title,
    value: task.taskNumber,
  }));
  const selected: CscOption[] = getSelectedOptions(
    ISO,
    control,
    orderedTasks
  );
  //TODO: review if prevSelectedRef is still needed
  const prevSelectedRef = useRef<Array<{ value: number }>>(selected);

  const handleValueChange = async (newValues: string[]) => {
    const optionsByValue = new Map(
      options.map((opt) => [opt.value.toString(), opt])
    );
    const prev = prevSelectedRef.current;

    const newSelected = newValues
      .map((value) => optionsByValue.get(value))
      .filter((opt): opt is CscOption => Boolean(opt));

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
