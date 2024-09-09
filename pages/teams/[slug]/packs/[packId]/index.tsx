import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import {
  TaskTab,
} from '@/components/interfaces/Task';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import { getCscStatusesBySlug } from 'models/team';
import Breadcrumb from '../../../../../components/interfaces/Task/Breadcrumb';
import PackTab from '@/components/interfaces/Pack/PackTab';

const TaskById = ({
}: {
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { taskNumber, slug } = router.query;
  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam(slug as string);

  if (isTeamLoading) {
    return <Loading />;
  }

  if (isTeamError) {
    return <Error message={'isError.message'} />;
  }

  return (
    <>
      <Breadcrumb
        taskTitle={'Task'}
        backTo={`/teams/${slug}/packs`}
        teamName={slug as string}
        taskNumber={taskNumber as string}
      />
      <h3 className="text-2xl font-bold">{'Title'}</h3>
      <PackTab activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};

export async function getServerSideProps({
  locale,
  query,
}: GetServerSidePropsContext) {
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TaskById;
