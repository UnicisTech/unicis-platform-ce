import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, Card } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import PackTab from '@/components/interfaces/AssetManagement/Pack/PackTab';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import Breadcrumb from '@/components/shared/Breadcrumb';
import NodeDetails from '@/components/interfaces/AssetManagement/Node/NodeDetails';


const NodeById = ({teamFeatures, user}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { nodeId, slug } = router.query;

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
        taskTitle={'Nodes'}
        backTo={`/teams/${slug}/asset-management/nodes`}
        teamName={slug as string}
        path={nodeId as string}
      />
      <h3 className="text-2xl font-bold">{'Node Details'}</h3>
      <PackTab activeTab={activeTab} setActiveTab={setActiveTab} />
      <Card heading="Node Details">
        <Card.Body>
          <NodeDetails user={user} fleetTeamId={team?.fleetTeamId!} nodeID={nodeId as string} />
        </Card.Body>
      </Card>
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
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        fleetId: user.fleetId,
        fleetAccessPhrase: user.fleetAccessPhrase
      },
    },
  };
};

export default NodeById;
