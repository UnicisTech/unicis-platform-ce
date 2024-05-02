import axios from 'axios';
import useTasks from 'hooks/useTasks';
import type { Option } from 'types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import PieChart from '../PieChart';
import { StatusTaskFilter } from '../StatusFilter';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const statusesData = {
  '12': 'To Do',
  '1': 'In Progress',
  2: 'In Review',
  3: 'Feedback',
  21: 'Done',
};

const labels = ['To Do', 'In Progress', 'In Review', 'Feedback', 'Done'];

const TasksAnalysis = () => {
  const router = useRouter();
  const { t } = useTranslation('translation');
  const { slug } = router.query;
  const [statusFilter, setStatusFilter] = useState<null | Option[]>(null);
  const [perPage, setPerPage] = useState<number>(10);
  const { isLoading, isError, tasks } = useTasks(slug as string);

  const statusHandler = useCallback(
    async (control: string, value: string) => {
      const response = await axios.put(`/api/teams/${slug}/csc`, {
        control,
        value,
      });

      const { data, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      setStatuses(data.statuses);
    },
    [slug]
  );

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
          <div
            style={{ width: '49%' }}
            className="stats py-2 stat-value shadow"
          >
            <PieChart
              page_name={`task`}
              statuses={statusesData}
              labels={labels}
            />
          </div>
          <div style={{ width: '49%' }} className="shadow p-4">
            <div className="flex px-2 gap-4">
              <h1 className="text-center text-sm font-bold">Total Tasks</h1>
              <span className="font-sans text-sm font-bold">
                {tasks?.length}
              </span>
            </div>
            <div className='py-4'>
              <StatusTaskFilter setStatusFilter={setStatusFilter} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TasksAnalysis;
function setStatuses(statuses: any) {
  throw new Error('Function not implemented.');
}
