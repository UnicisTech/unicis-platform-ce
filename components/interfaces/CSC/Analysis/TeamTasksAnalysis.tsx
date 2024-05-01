import useTasks from 'hooks/useTasks';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import PieChart from '../PieChart';

const statusesData = {
  '12': 'To Do',
  '1': 'In Progress',
  2: 'In Review',
  3: 'Feedback',
  21: 'Done',
};

const labels = [
  'To Do',
  'In Progress',
  'In Review',
  'Feedback',
  'Done',
]


const TasksAnalysis = () => {
  const router = useRouter();
  const { t } = useTranslation('translation');
  const { slug } = router.query;
  const { isLoading, isError, tasks } = useTasks(slug as string);

  return (
    <>
      {/* Team Tasks Analysis */}
      <div className="mb-2 mx-4 flex items-center justify-between">
        <h4>{t(`${slug?.toString().toUpperCase()} Task Analysis`)}</h4>
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
          <div style={{ width: '49%' }} className="stats py-2 stat-value shadow">
            <PieChart page_name={`task`} statuses={statusesData} labels={labels}/>
          </div>
          <div style={{ width: '49%' }} className="shadow p-4">
            <div className="flex gap-4">
              <h1 className="text-center text-sm font-bold">Total Tasks</h1>
              <span className="font-sans text-sm font-bold">
                {tasks?.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TasksAnalysis;
