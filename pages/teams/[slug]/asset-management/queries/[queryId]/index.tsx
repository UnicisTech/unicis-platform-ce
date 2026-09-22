import { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Card } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import QueryTab from '@/components/interfaces/AssetManagement/Query/QueryTab';
import QueryDetails from '@/components/interfaces/AssetManagement/Query/QueryDetails';
import QueryResults from '@/components/interfaces/AssetManagement/Query/QueryResults';
import { useGetQueryId } from '@/hooks/fleets/queries/useGetQueryId';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import { getTeam } from '@/models/team';
import { hasAssetManagementPlan } from '@/lib/asset-management';
import AssetTab from '@/components/interfaces/AssetManagement/AssetTab';
import { TeamTab } from '@/components/team';
import FleetConnectRequired from '@/components/interfaces/AssetManagement/FleetConnectRequired';

const QueryResultsContent = ({ fleetTeamId, queryId }) => {
  const { query, isLoading: isQueryLoading } = useGetQueryId(
    fleetTeamId,
    queryId
  );

  if (isQueryLoading) {
    return <Loading />;
  }

  if (!query) return null;

  return (
    <QueryResults
      teamId={fleetTeamId}
      queryId={queryId}
      queryName={query.name}
    />
  );
};

const QueryContent = ({ fleetTeamId, queryId, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <>
      <QueryTab activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Overview' && (
        <Card heading="Details">
          <Card.Body>
            <QueryDetails
              user={user}
              fleetTeamId={fleetTeamId}
              queryID={queryId}
            />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'Results' && (
        <QueryResultsContent fleetTeamId={fleetTeamId} queryId={queryId} />
      )}
    </>
  );
};

const QueryById = ({ teamFeatures, team: pageTeam, user }) => {
  const router = useRouter();
  const { queryId } = router.query;

  return (
    <>
      <TeamTab
        activeTab="asset-management"
        team={pageTeam}
        teamFeatures={teamFeatures}
      />
      <AssetTab
        activeTab="queries"
        team={pageTeam}
        teamFeatures={teamFeatures}
      />
      <FleetConnectRequired user={user} teamId={pageTeam.id}>
        {() => (
          <QueryContent
            fleetTeamId={pageTeam.id}
            queryId={queryId as string}
            user={user}
          />
        )}
      </FleetConnectRequired>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale, query } = context;
  const slug = query.slug as string;

  if (!user) {
    return {
      notFound: true,
    };
  }

  const team = await getTeam({ slug });

  if (!hasAssetManagementPlan(team.subscription)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ['common', 'fleet'])
        : {}),
      team: JSON.parse(JSON.stringify(team)),
      teamFeatures: env.teamFeatures,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      },
    },
  };
};

export default QueryById;
