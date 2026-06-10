import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form';
import { Combobox } from '@/components/shadcn/ui/combobox';
import { Control } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import type { Task } from 'types';

interface Props {
  control: Control<{ task: Task }>;
  name: 'task';
  tasks: Task[];
}

export default function TaskPicker({ control, name, tasks }: Props) {
  const { t } = useTranslation('common');

  const options = tasks.map((task) => ({
    value: String(task.id),
    label: `#${task.taskNumber} ${task.title}`,
    searchValue: `${task.taskNumber} ${task.title}`,
  }));

  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: 'Please select a task.' }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('task')}</FormLabel>
          <FormControl>
            <Combobox
              options={options}
              value={field.value?.id ? String(field.value.id) : null}
              onValueChange={(taskId) => {
                if (!taskId) return;
                const found = tasks.find((task) => String(task.id) === taskId);
                field.onChange(found ?? null);
              }}
              placeholder={t('select-task', { defaultValue: 'Select a task' })}
              searchPlaceholder={t('search-task', { defaultValue: 'Search tasks…' })}
              emptyText={t('no-tasks-found', { defaultValue: 'No tasks found.' })}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
