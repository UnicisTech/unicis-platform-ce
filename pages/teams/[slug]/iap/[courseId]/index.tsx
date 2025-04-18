import { useRouter } from 'next/router';
import { Loading, Error } from '@/components/shared';
import useIapCourse from 'hooks/useIapCourse';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import { CoursePage } from '@/components/interfaces/IAP';
import useTeam from 'hooks/useTeam';

const IapCourse = () => {
  const router = useRouter();
  const { courseId, slug } = router.query;

  const { teamCourse, isError, isLoading } = useIapCourse(
    slug as string,
    courseId as string
  );
  const {
    team,
    isError: isTeamError,
    isLoading: isTeamLoading,
  } = useTeam(slug as string);

  if (isLoading || isTeamLoading || !team) {
    return <Loading />;
  }

  if (isError || isTeamError || !teamCourse) {
    return <Error message={isError.message} />;
  }

  return <CoursePage teamCourse={teamCourse} />;
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default IapCourse;
