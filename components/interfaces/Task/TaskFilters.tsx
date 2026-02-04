import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import { useTranslation } from 'next-i18next';
import { taskModuleKeys } from '@/lib/tasks';

const moduleLabels: Record<(typeof taskModuleKeys)[number], string> = {
  rpa_procedure: 'RPA',
  tia_procedure: 'TIA',
  pia_risk: 'PIA',
  rm_risk: 'RM',
  csc_controls: 'CSC',
};

type Props = {
  selectedStatuses: string[];
  setSelectedStatuses: (val: string[]) => void;
  selectedModules: string[];
  setSelectedModules: (val: string[]) => void;
};

const TaskFilters = ({
  selectedStatuses,
  setSelectedStatuses,
  selectedModules,
  setSelectedModules,
}: Props) => {
  const { t } = useTranslation('common');
  const moduleOptions = taskModuleKeys.map((value) => ({
    label: moduleLabels[value],
    value,
  }));
  const statusOptions = [
    { label: t('task-statuses.todo'), value: 'todo' },
    { label: t('task-statuses.inprogress'), value: 'inprogress' },
    { label: t('task-statuses.inreview'), value: 'inreview' },
    { label: t('task-statuses.feedback'), value: 'feedback' },
    { label: t('task-statuses.done'), value: 'done' },
    { label: t('task-statuses.failed'), value: 'failed' },
  ];

  return (
    <div className="flex flex-wrap gap-4 my-2">
      <div>
        <MultiSelect
          options={statusOptions}
          defaultValue={selectedStatuses}
          onValueChange={setSelectedStatuses}
          placeholder={t('filter-by-status')}
          maxCount={3}
        />
      </div>

      <div>
        <MultiSelect
          options={moduleOptions}
          defaultValue={selectedModules}
          onValueChange={setSelectedModules}
          placeholder={t('filter-by-module')}
          maxCount={3}
        />
      </div>
    </div>
  );
};

export default TaskFilters;
