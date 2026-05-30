import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, Card } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import QueryTab from '@/components/interfaces/AssetManagement/Query/QueryTab';
import Breadcrumb from '@/components/shared/Breadcrumb';
import QueryDetails from '@/components/interfaces/AssetManagement/Query/QueryDetails';
import QueryResults from '@/components/interfaces/AssetManagement/Query/QueryResults';
import { useGetQueryId } from '@/hooks/fleets/queries/useGetQueryId';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';

const QueryById = ({teamFeatures, user}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { queryId, slug } = router.query;
  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam(slug as string);

  const { query, isLoading: isQueryLoading } = useGetQueryId(team?.id!, queryId as string);

  if (isTeamLoading || isQueryLoading) {
    return <Loading />;
  }

  if (isTeamError) {
    return <Error message={'isError.message'} />;
  }

  return (
    <>
      <Breadcrumb
        taskTitle={'Queries'}
        backTo={`/teams/${slug}/asset-management/queries`}
        teamName={slug as string}
        path={queryId as string}
      />
      <h3 className="text-2xl font-bold">{'Queries'}</h3>
      <QueryTab activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Overview' && (
        <Card heading="Details">
          <Card.Body>
            <QueryDetails user={user} fleetTeamId={team?.id!} queryID={queryId as string} />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'Results' && query && (
        <QueryResults teamId={team?.id!} queryName={query.name} />
      )}
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale } = context;

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common', 'fleet']) : {}),
      teamFeatures: env.teamFeatures,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      }
    },
  };
};

export default QueryById;
