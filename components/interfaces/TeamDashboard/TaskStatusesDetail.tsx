import type { Task } from 'types';
import { useTranslation } from 'next-i18next';

const TaskStatusesDetail = ({
  tasks,
  statusCounts,
}: {
  tasks: Array<Task> | any;
  statusCounts: { [key: string]: number };
}) => {
  const { t } = useTranslation('common');
  const stats = [
    { label: t('total-tasks'), value: tasks?.length || 0 },
    { label: t('task-statuses.todo'), value: statusCounts?.todo || 0 },
    {
      label: t('task-statuses.inprogress'),
      value: statusCounts?.inprogress || 0,
    },
    { label: t('task-statuses.inreview'), value: statusCounts?.inreview || 0 },
    { label: t('task-statuses.feedback'), value: statusCounts?.feedback || 0 },
    { label: t('task-statuses.done'), value: statusCounts?.done || 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="rounded border bg-background p-4 text-center shadow-sm"
        >
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
};

export default TaskStatusesDetail;
