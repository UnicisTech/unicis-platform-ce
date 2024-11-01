import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, Card } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import PackDetails from '@/components/interfaces/AssetManagement/Pack/PackDetails';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import Breadcrumb from '@/components/shared/Breadcrumb';
import TagsTab from '@/components/interfaces/AssetManagement/Tag/TagsTab';
import TagDetails from '@/components/interfaces/AssetManagement/Tag/TagDetails';

const TagById = ({teamFeatures, user}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { tagId, slug } = router.query;

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
        taskTitle={'Tags'}
        backTo={`/teams/${slug}/asset-management/tags`}
        teamName={slug as string}
        path={tagId as string}
      />
      <h3 className="text-2xl font-bold">{'Pack Details'}</h3>
      <TagsTab activeTab={activeTab} setActiveTab={setActiveTab} />
      <Card heading="Details">
        <Card.Body>
          <TagDetails user={user} fleetTeamId={team?.fleetTeamId!} tagID={tagId as string} />
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

export default TagById;
