import React, { useState, useEffect } from 'react';
import Select from '@atlaskit/select';
import { WithoutRing } from 'sharedStyles';
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
    dataToRemove: any,
    control: string
  ) => Promise<void>;
  ISO: ISO;
}) => {
  const [value, setValue] = useState<CscOption[]>([]);
  const [options, setOptions] = useState<CscOption[]>([]);

  useEffect(() => {
    const options = tasks.map((task) => ({
      label: task.title,
      value: task.taskNumber,
    }));
    const cscStatusesProp = getCscControlsProp(ISO);
    const selectedOptions = tasks
      .filter((task: any) =>
        task.properties?.[cscStatusesProp]?.find(
          (item: string) => item === control
        )
      )
      ?.map((issue) => ({ label: issue.title, value: issue.taskNumber }));
    setOptions(options);
    setValue(selectedOptions);
  }, []);
  return (
    <WithoutRing>
      <Select
        inputId="multi-select-status"
        className="multi-select"
        classNamePrefix="react-select"
        options={options}
        onChange={(selectedIssue, actionMeta) => {
          const { action, option, removedValue, removedValues } = actionMeta;
          setValue([...selectedIssue]);
          const dataToRemove = option
            ? [option]
            : removedValue
              ? [removedValue]
              : removedValues;
          handler(action, dataToRemove, control);
        }}
        value={value}
        placeholder="Tasks"
        isMulti
      />
    </WithoutRing>
  );
};

export default TaskSelector;
