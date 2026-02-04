import { Card } from '@/components/shared';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { getViewerToken } from '@/lib/retraced';
import { getTeamAccess } from '@/lib/teams';
import useCanAccess from 'hooks/useCanAccess';
import useTeam from 'hooks/useTeam';
import { isAllowed } from 'models/user';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import type { NextPageWithLayout } from 'types';

interface RetracedEventsBrowserProps {
  host: string;
  auditLogToken: string;
  header: string;
}

const RetracedEventsBrowser = dynamic<RetracedEventsBrowserProps>(
  () => import('@retracedhq/logs-viewer'),
  {
    ssr: false,
  }
);

const Events: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  auditLogToken,
  retracedHost,
  error,
  teamFeatures,
}) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError || error) {
    return <Error message={isError?.message || error?.message} />;
  }

  if (!team) {
    return <Error message={t('errors.teamNotFound')} />;
  }

  return (
    <>
      <TeamTab activeTab="audit-logs" team={team} teamFeatures={teamFeatures} />
      <Card>
        <Card.Body>
          {canAccess('team_audit_log', ['read']) && auditLogToken && (
            <RetracedEventsBrowser
              host={`${retracedHost}/viewer/v1`}
              auditLogToken={auditLogToken}
              header={t('audit-logs')}
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const access = await getTeamAccess(req, res, query);

  if (!access || !access.teamFeatures.auditLog) {
    return {
      notFound: true,
    };
  }

  const { session, teamMember, teamFeatures } = access;
  const baseProps = {
    ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    teamFeatures,
  };

  if (!isAllowed(teamMember.role, 'team_audit_log', 'read')) {
    return {
      props: {
        ...baseProps,
        error: {
          message: 'You are not allowed to perform read on team_audit_log',
        },
        auditLogToken: null,
        retracedHost: null,
      },
    };
  }

  try {
    const auditLogToken = await getViewerToken(
      teamMember.team.id,
      session.user.id as string
    );

    return {
      props: {
        ...baseProps,
        error: null,
        auditLogToken: auditLogToken ?? '',
        retracedHost: env.retraced.url ?? '',
      },
    };
  } catch (error: unknown) {
    const { message } = error as { message: string };
    return {
      props: {
        ...baseProps,
        error: {
          message,
        },
        auditLogToken: null,
        retracedHost: null,
      },
    };
  }
}

export default Events;
