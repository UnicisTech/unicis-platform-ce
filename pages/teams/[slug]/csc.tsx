import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loading, Error } from '@/components/shared';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import {
  StatusesTable,
  PieChart,
  RadarChart,
  SectionFilter,
  StatusCscFilter,
} from '@/components/interfaces/CSC';
import { PerPageSelector } from '@/components/shared/atlaskit';
import {
  perPageOptions,
  isoOptions,
} from '@/components/defaultLanding/data/configs/csc';
import useTeamTasks from 'hooks/useTeamTasks';
import { getCscStatusesBySlug } from 'models/team';
import type { Option } from 'types';
import useISO from 'hooks/useISO';

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

const barColors = [
  'rgba(241, 241, 241, 1)',
  'rgba(178, 178, 178, 1)',
  'rgba(255, 0, 0, 1)',
  'rgba(202, 0, 63, 1)',
  'rgba(102, 102, 102, 1)',
  'rgba(255, 190, 0, 1)',
  'rgba(106, 217, 0, 1)',
  'rgba(47, 143, 0, 1)',
];

const CscDashboard = ({
  csc_statuses,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { slug } = router.query;

  const [statuses, setStatuses] = useState(csc_statuses || {});
  const [sectionFilter, setSectionFilter] = useState<
    null | { label: string; value: string }[]
  >(null);
  const [statusFilter, setStatusFilter] = useState<null | Option[]>(null);
  const [perPage, setPerPage] = useState<number>(10);

  const { isLoading, isError, team } = useTeam(slug as string);
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const { ISO } = useISO(team);

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

  const taskSelectorHandler = useCallback(
    async (action: string, dataToRemove: any, control: string) => {
      const operation = action === 'select-option' ? 'add' : 'remove';
      for (const option of dataToRemove) {
        const taskNumber = option.value;
        const response = await axios.put(
          `/api/teams/${slug}/tasks/${taskNumber}/csc`,
          {
            controls: [control],
            operation,
            ISO,
          }
        );

        const { error } = response.data;

        if (error) {
          toast.error(error.message);
          return;
        }

        mutateTasks();
      }
    },
    [ISO, slug, mutateTasks]
  );

  useEffect(() => {
    console.log('CSC ISO', ISO);
  }, [ISO]);

  if (isLoading || !team || !tasks || !ISO) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <h2 className="text-xl font-medium leading-none tracking-tight">
        {'Cybersecurity Controls Dashboard: '}
        {team.name}
      </h2>
      {/* <h2 className="text-2xl font-bold">{"Cybersecurity Controls Dashboard: "}{team.name}</h2> */}
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
          className="stats stat-value shadow pl-4 py-4"
        >
          <PieChart
            page_name={`csc`}
            statuses={statuses}
            barColor={barColors}
            labels={labels}
          />
        </div>
        <div style={{ width: '49%' }} className="stats stat-value shadow">
          <RadarChart statuses={statuses} ISO={ISO} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="flex items-center">
          <p>
            Framework:{' '}
            <b>{isoOptions.find(({ value }) => value === ISO)?.label}</b>
          </p>
        </div>
        <div className="flex flex-row justify-end">
          <SectionFilter ISO={ISO} setSectionFilter={setSectionFilter} />
          <StatusCscFilter setStatusFilter={setStatusFilter} />
          <PerPageSelector
            setPerPage={setPerPage}
            options={perPageOptions}
            placeholder="Controls per page"
            defaultValue={{
              label: '10',
              value: 10,
            }}
          />
        </div>
      </div>
      <StatusesTable
        ISO={ISO}
        tasks={tasks}
        statuses={statuses}
        sectionFilter={sectionFilter}
        statusFilter={statusFilter}
        perPage={perPage}
        statusHandler={statusHandler}
        taskSelectorHandler={taskSelectorHandler}
      />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
};

export default CscDashboard;
