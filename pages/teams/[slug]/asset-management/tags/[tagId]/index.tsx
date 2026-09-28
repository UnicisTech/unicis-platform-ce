import { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import TagsTab from '@/components/interfaces/AssetManagement/Tag/TagsTab';
import TagDetails from '@/components/interfaces/AssetManagement/Tag/TagDetails';
import { getTeam } from '@/models/team';
import { hasAssetManagementPlan } from '@/lib/asset-management';
import AssetTab from '@/components/interfaces/AssetManagement/AssetTab';
import { TeamTab } from '@/components/team';
import FleetConnectRequired from '@/components/interfaces/AssetManagement/FleetConnectRequired';

const TagContent = ({ fleetTeamId, tagId, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <>
      <TagsTab activeTab={activeTab} setActiveTab={setActiveTab} />
      <TagDetails user={user} fleetTeamId={fleetTeamId} tagID={tagId} />
    </>
  );
};

const TagById = ({ teamFeatures, team: pageTeam, user }) => {
  const router = useRouter();
  const { tagId } = router.query;

  return (
    <>
      <TeamTab
        activeTab="asset-management"
        team={pageTeam}
        teamFeatures={teamFeatures}
      />
      <AssetTab activeTab="tags" team={pageTeam} teamFeatures={teamFeatures} />
      <FleetConnectRequired user={user} teamId={pageTeam.id}>
        {() => (
          <TagContent
            fleetTeamId={pageTeam.id}
            tagId={tagId as string}
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

export default TagById;
