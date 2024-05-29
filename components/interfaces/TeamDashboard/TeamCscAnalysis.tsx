import useTasks from 'hooks/useTasks';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import PieChart from '../CSC/PieChart';
import RadarChart from '../CSC/RadarChart';
import ControlSelector from './ControlSelector';
import { useCallback, useState } from 'react';
import type { Option } from 'types';
import axios from 'axios';
import toast from 'react-hot-toast';
import { StatusCscFilter } from '../CSC/StatusFilter';

const labels = [
  'Unknown',
  'Not Applicable',
  'Not Performed',
  'Performed Informally',
  'Planned',
  'Well Defined',
  'Quantitatively Controlled',
  'Continuously Improving',
];

const ProcessingActivitiesAnalysis = ({
  csc_statuses,
  slug,
}: {
  csc_statuses: { [key: string]: string };
  slug: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('translation');
  const [statuses, setStatuses] = useState(csc_statuses);
  const [statusFilter, setStatusFilter] = useState<null | Option[]>(null);
  const [control, setControl] = useState('');

  const controlHandler = useCallback(async (value: string) => {
    setControl(value);
  }, []);

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


  console.log(statuses);
  

  return (
    <>
      {/* Processing Analysis */}
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md p-2">
        <div className="flex items-start justify-between mb-2">
          <div className="mb-2 flex items-center justify-between">
            <h4>{t('Cybersecurity Controls')}</h4>
          </div>
          <div className="flex ">
            <StatusCscFilter setStatusFilter={setStatusFilter} />
            <ControlSelector controlValue={control} handler={controlHandler} />
          </div>
        </div>
        <div className='mb-4 flex gap-2 items-center dark:bg-gray-800 bg-gray-100 rounded p-1'>
          <h4>
            Total number of controls
          </h4>
          <span className="font-sans text-sm font-bold">
            {control}
          </span>
        </div>
        <div
          style={{
            height: '400px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '10px',
          }}
        >
          <div style={{ width: '49%' }} className="stats p-4 stat-value shadow">
            <PieChart
              page_name={`dashboard`}
              statuses={statuses}
              labels={labels}
            />
          </div>
          <div style={{ width: '49%' }} className="stats p-4 stat-value shadow">
            <RadarChart ISO={'default'} statuses={statuses} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessingActivitiesAnalysis;
