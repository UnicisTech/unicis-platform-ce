import type { NextPageWithLayout } from 'types';
import type { InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { getTeam } from 'models/team';
import env from '@/lib/env';
import { getUserBySession } from '@/models/user';
import { getSession } from '@/lib/session';
import { Querys } from '@/components/interfaces/AssetManagement/Query';
import AssetTab from '@/components/interfaces/AssetManagement/AssetTab';
import { TeamTab } from '@/components/team';


const AllQueries: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ team, teamFeatures, user }) => {
  return (
    <>
      <TeamTab activeTab="asset-management" team={team} teamFeatures={teamFeatures} />
      <AssetTab activeTab="queries" team={team} teamFeatures={teamFeatures} />
      <Querys user={user} team={team} />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;
  const team = await getTeam({ slug });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
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

export default AllQueries;
