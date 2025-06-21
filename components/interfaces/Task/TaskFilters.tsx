import { MultiSelect } from '@/components/shadcn/ui/multi-select';

const moduleOptions = [
  { label: 'RPA', value: 'rpa_procedure' },
  { label: 'TIA', value: 'tia_procedure' },
  { label: 'PIA', value: 'pia_risk' },
  { label: 'RM', value: 'rm_risk' },
];

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'inprogress' },
  { label: 'In Review', value: 'inreview' },
  { label: 'Feedback', value: 'feedback' },
  { label: 'Done', value: 'done' },
  { label: 'Failed', value: 'failed' },
];

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
  return (
    <div className="flex flex-wrap gap-4 my-2">
      <div>
        {/* <Label className="mb-1 block">Statuses</Label> */}
        <MultiSelect
          options={statusOptions}
          defaultValue={selectedStatuses}
          onValueChange={setSelectedStatuses}
          placeholder="Filter by status"
          maxCount={3}
        />
      </div>

      <div>
        {/* <Label className="mb-1 block">Modules</Label> */}
        <MultiSelect
          options={moduleOptions}
          defaultValue={selectedModules}
          onValueChange={setSelectedModules}
          placeholder="Filter by module"
          maxCount={3}
        />
      </div>
    </div>
  );
};

export default TaskFilters;
