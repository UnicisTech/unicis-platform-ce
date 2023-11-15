import type { NextPageWithLayout } from 'types';
import type { InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Tasks } from '@/components/interfaces/Task';
import { getTeam } from 'models/team';

const AllTasks: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ team }) => {
  return (
    <>
      <Tasks team={team} />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;

  const slug = query.slug as string;

  const team = await getTeam({ slug });

  //Hotfix for not serializable team props
  // team.createdAt = team.createdAt.toString();
  // team.updatedAt = team.updatedAt.toString();

  // team.createdAt = team.createdAt;
  // team.updatedAt = team.updatedAt.toString();

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default AllTasks;
