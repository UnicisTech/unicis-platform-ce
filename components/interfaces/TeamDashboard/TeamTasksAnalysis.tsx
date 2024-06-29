import { useTranslation } from 'next-i18next';
import PieChart from '../CSC/PieChart';
import { TaskStatusesDetail } from '@/components/interfaces/CSC';
import useTeamTasks from 'hooks/useTeamTasks';

const labels = ['To Do', 'In Progress', 'In Review', 'Feedback', 'Done'];

const barColors = [
  'rgb(232, 232, 232)', // todo
  'rgb(123, 146, 178)', // in progress
  'rgb(77, 110, 255)', // in review
  'rgb(0, 181, 255)', // feedback
  'rgb(0, 169, 110)', // done
];

const TasksAnalysis = ({
  slug,
}: {
  csc_statuses: { [key: string]: string };
  slug: string;
}) => {
  const { t } = useTranslation('translation');
  const { tasks } = useTeamTasks(slug as string);

  const statuses: { [key: string]: string } =
    tasks?.reduce((acc: { [key: string]: string }, task) => {
      if (task.status && !acc[task.status.toLowerCase()]) {
        acc[task.id] = getStatusName(task.status);
      }
      return acc;
    }, {}) || {};

  const statusCounts: { [key: string]: number } =
    tasks?.reduce((acc: { [key: string]: number }, task) => {
      if (task.status) {
        const statusKey = task.status.toLowerCase();
        acc[statusKey] = (acc[statusKey] || 0) + 1;
      }
      return acc;
    }, {}) || {};

  return (
    <>
      {/* Team Tasks Analysis */}
      <div className="mb-2 mx-4 flex items-center justify-between">
        <h4>{t(`${slug?.toString().toUpperCase()} Task Overview`)}</h4>
      </div>
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md p-2">
        <div
          style={{
            height: '400px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '10px',
          }}
        >
          <div
            style={{ width: '49%' }}
            className="stats py-2 stat-value shadow"
          >
            <PieChart
              page_name={`task`}
              statuses={statuses}
              barColor={barColors}
              labels={labels}
            />
          </div>
          <div style={{ width: '49%' }} className="shadow p-4">
            <TaskStatusesDetail tasks={tasks} statusCounts={statusCounts} />
          </div>
        </div>
      </div>
      <h4>{t('Data Privacy Overview')}</h4>
    </>
  );
};

export default TasksAnalysis;

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
