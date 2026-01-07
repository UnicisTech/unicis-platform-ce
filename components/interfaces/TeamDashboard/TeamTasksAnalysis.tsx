import { TaskStatusesDetail } from '@/components/interfaces/CSC';
import { useTranslation } from 'next-i18next';
import useTeamTasks from 'hooks/useTeamTasks';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import TasksPieChart from './TasksPieChart';

const TasksAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('common');
  const { tasks } = useTeamTasks(slug as string);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md">
        <Card className="p-6 text-center text-muted-foreground">
          {t('no-tasks-available')}
        </Card>
      </div>
    );
  }

  const statuses = tasks.reduce<Record<string, string>>((acc, task) => {
    if (task.status) {
      acc[task.id] = task.status;
    }
    return acc;
  }, {});

  const statusCounts: { [key: string]: number } = tasks.reduce(
    (acc: { [key: string]: number }, task) => {
      if (task.status) {
        const statusKey = task.status.toLowerCase();
        acc[statusKey] = (acc[statusKey] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="w-full lg:w-1/2 shadow-sm">
          <CardContent className="flex items-center justify-center h-[300px]">
            <TasksPieChart statuses={statuses} />
          </CardContent>
        </Card>
        <Card className="w-full lg:w-1/2 shadow-sm">
          <CardHeader>
            <CardTitle>{t('status-summary')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <TaskStatusesDetail tasks={tasks} statusCounts={statusCounts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksAnalysis;
