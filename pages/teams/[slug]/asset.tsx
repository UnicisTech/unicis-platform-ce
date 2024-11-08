import { Assets } from '@/components/interfaces/AssetDashboard';
import env from '@/lib/env';
import { getUserBySession } from '@/models/user';
import { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getTeam } from '@/models/team';


const TeamAssetDashboard = ({
  slug,
  user,
  team,
  teamFeatures,
  }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t('asset-management-dashboard')} ({team?.name})
        </h2>
      </div>
      <div className="space-y-6">
        <Assets user={user} team={team} />
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context.req, context.res);
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;
  const user = await getUserBySession(session);
  const team = await getTeam({ slug });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
      team: JSON.parse(JSON.stringify(team)),
      slug: slug,
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
}

export default TeamAssetDashboard;
