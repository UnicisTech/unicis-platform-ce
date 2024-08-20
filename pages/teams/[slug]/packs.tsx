import type { NextPageWithLayout } from 'types';
import type { InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Packs } from '@/components/interfaces/Pack';
import { getTeam } from 'models/team';
import { FleetTab } from '@/components/fleet';
import env from '@/lib/env';

const AllPacks: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ team, teamFeatures }) => {
  return (
    <>
      <FleetTab activeTab="packs" team={team} teamFeatures={teamFeatures} />
      <Packs team={team} />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;

  const slug = query.slug as string;

  const team = await getTeam({ slug });

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      team: JSON.parse(JSON.stringify(team)),
      teamFeatures: env.teamFeatures,
    },
  };
};

export default AllPacks;
