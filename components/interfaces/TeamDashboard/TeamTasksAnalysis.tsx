import { TaskStatusesDetail } from '@/components/interfaces/CSC';
import useTeamTasks from 'hooks/useTeamTasks';
import { Card } from '@/components/shadcn/ui/card';
import TasksPieChart from './TasksPieChart';

//TODO: move to lib?
const labels = ['To Do', 'In Progress', 'In Review', 'Feedback', 'Done'];

const TasksAnalysis = ({ slug }: { slug: string }) => {
  const { tasks } = useTeamTasks(slug as string);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md">
        <Card className="p-6 text-center text-muted-foreground">
          No tasks available.
        </Card>
      </div>
    );
  }

  const statuses: { [key: string]: string } = tasks.reduce(
    (acc: { [key: string]: string }, task) => {
      if (task.status && !acc[task.status.toLowerCase()]) {
        acc[task.id] = getStatusName(task.status);
      }
      return acc;
    },
    {}
  );

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
    <div className="mx-auto mt-4 w-full max-w-7xl rounded-md">
      <div className="flex justify-around mb-2" style={{ height: '400px' }}>
        <Card className="flex-1 h-full flex flex-col p-2 mr-4 justify-between">
          <TasksPieChart statuses={statuses} labels={labels} />
        </Card>
        <TaskStatusesDetail tasks={tasks} statusCounts={statusCounts} />
      </div>
    </div>
  );
};

export default TasksAnalysis;

// TODO: move to lib?
function getStatusName(statusId: string): string {
  switch (statusId.toLowerCase()) {
    case 'todo':
      return 'To Do';
    case 'inprogress':
      return 'In Progress';
    case 'inreview':
      return 'In Review';
    case 'feedback':
      return 'Feedback';
    case 'done':
      return 'Done';
    default:
      return statusId;
  }
}
