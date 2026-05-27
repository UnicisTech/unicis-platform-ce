import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Loading, Error } from '@/components/shared';
import {
  Attachments,
  Comments,
  CommentsTab,
  TaskDetails,
  TaskAuditLogs,
  TaskTab,
} from '@/components/interfaces/Task';
import { CscAuditLogs, CscPanel } from '@/components/interfaces/csc';
import {
  RpaPanel,
  RpaAuditLogs,
  CreateProcedureTest,
} from '@/components/interfaces/rpa';
import {
  CreateRiskManagementRisk,
  RiskManagementTaskPanel,
  RmAuditLogs,
} from '@/components/interfaces/risk-management';
import useTask from 'hooks/useTask';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import useISO from 'hooks/useISO';
import type { Team } from 'types';
import {
  TiaAuditLogs,
  TiaPanel,
  CreateProcedure as CreateTiaProcedure,
} from '@/components/interfaces/tia';
import {
  CreatePiaRisk,
  PiaPanel,
  PiaAuditLogs,
} from '@/components/interfaces/pia';
import Breadcrumb from '../../Breadcrumb';
import useRpaCreation from 'hooks/useRpaCreation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import type {
  PiaRisk,
  RMProcedureInterface,
  TaskProperties,
  TiaProcedureInterface,
} from 'types';

const CardTitleWrapper = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex min-h-8 flex-wrap items-center justify-between gap-2 px-4 uppercase ${className}`.trim()}
  >
    {children}
  </div>
);

const TaskById = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [tiaVisible, setTiaVisible] = useState(false);
  const [piaVisible, setPiaVisible] = useState(false);
  const [rmVisible, setRmVisible] = useState(false);

  const [activeTab, setActiveTab] = useState('Overview');
  const [activeCommentTab, setActiveCommentTab] = useState('Comments');

  const router = useRouter();
  const { t } = useTranslation('common');
  const { taskNumber, slug } = router.query as {
    slug: string;
    taskNumber: string;
  };
  const { canAccess } = useCanAccess(slug);

  const { team, isLoading: teamLoading, isError: teamError } = useTeam(slug);
  const { task, isLoading, isError, mutateTask } = useTask(
    slug as string,
    taskNumber as string
  );

  console.log('task', task);
  const { ISO } = useISO(team);
  const rpaState = useRpaCreation(task);

  if (isLoading || teamLoading || !ISO) return <Loading />;
  if (!task || !team || isError || teamError)
    return <Error message={(isError || teamError)?.message || ''} />;

  return (
    <>
      <Breadcrumb
        taskTitle={task.title}
        backTo={`/teams/${slug}/tasks`}
        teamName={slug}
        taskNumber={taskNumber}
      />
      <h3 className="text-2xl font-bold mb-4">{task.title}</h3>
      <TaskTab activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'Overview' && (
        <>
          <Card>
            <CardHeader>
              <CardTitleWrapper>
                <CardTitle>{t('details')}</CardTitle>
              </CardTitleWrapper>
            </CardHeader>
            <CardContent>
              <TaskDetails task={task} team={team as Team} />
            </CardContent>
          </Card>

        </>
      )}
      {activeTab === 'Processing Activities' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitleWrapper>
              <CardTitle>{t('processing-activities-panel')}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-normal text-center leading-snug"
                  onClick={() => rpaState.setIsRpaOpen(!rpaState.isRpaOpen)}
                >
                  {t('create-rpa')}
                </Button>
              )}
            </CardTitleWrapper>
          </CardHeader>
          <CardContent>
            <RpaPanel task={task} slug={slug} />
          </CardContent>
        </Card>
      )}
      {activeTab === 'Transfer Impact Assessment' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitleWrapper>
              <CardTitle>{t('transfer-impact-assessment-panel')}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-normal text-center leading-snug"
                  onClick={() => setTiaVisible(!tiaVisible)}
                >
                  {t('create-tia')}
                </Button>
              )}
            </CardTitleWrapper>
          </CardHeader>
          <CardContent>
            <TiaPanel task={task} />
          </CardContent>
        </Card>
      )}
      {activeTab === 'Cybersecurity Controls' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitleWrapper>
              <CardTitle>{t('cybersecurity-controls-panel')}</CardTitle>
            </CardTitleWrapper>
          </CardHeader>
          <CardContent>
            <CscPanel task={task} team={team} mutateTask={mutateTask} />
          </CardContent>
        </Card>
      )}
      {activeTab === 'Privacy Impact Assessment' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitleWrapper>
              <CardTitle>{t('privacy-impact-assessment-panel')}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-normal text-center leading-snug"
                  onClick={() => setPiaVisible(!piaVisible)}
                >
                  {t('create-pia')}
                </Button>
              )}
            </CardTitleWrapper>
          </CardHeader>
          <CardContent>
            <PiaPanel task={task} />
          </CardContent>
        </Card>
      )}
      {activeTab === 'Risk Management' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitleWrapper>
              <CardTitle>{t('risk-management-panel')}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRmVisible(!rmVisible)}
                  className="whitespace-normal text-center leading-snug"
                >
                  {t('rm-register-risk-record')}
                </Button>
              )}
            </CardTitleWrapper>
          </CardHeader>
          <CardContent>
            <RiskManagementTaskPanel task={task} slug={slug} />
          </CardContent>
        </Card>
      )}
      {tiaVisible && (
        <CreateTiaProcedure
          open={tiaVisible}
          onOpenChange={setTiaVisible}
          selectedTask={task}
          prevProcedure={
            (task.properties as TaskProperties)?.tia_procedure as
              | TiaProcedureInterface
              | undefined
          }
          mutateTasks={mutateTask}
        />
      )}
      <CreateProcedureTest mutateTasks={mutateTask} {...rpaState} />
      {piaVisible && (
        <CreatePiaRisk
          open={piaVisible}
          onOpenChange={setPiaVisible}
          selectedTask={task}
          prevRisk={(task.properties as TaskProperties)?.pia_risk as PiaRisk}
          mutateTasks={mutateTask}
        />
      )}
      {rmVisible && (
        <CreateRiskManagementRisk
          open={rmVisible}
          onOpenChange={setRmVisible}
          selectedTask={task}
          prevRisk={
            (task.properties as TaskProperties)?.rm_risk as RMProcedureInterface
          }
          mutateTasks={mutateTask}
        />
      )}
      <Card className="mt-4">
        <CardHeader>
          <CardTitleWrapper>
            <CardTitle>{t('attachments')}</CardTitle>
          </CardTitleWrapper>
        </CardHeader>
        <CardContent>
          <Attachments task={task} mutateTask={mutateTask} />
        </CardContent>
      </Card>
      <CommentsTab
        activeTab={activeCommentTab}
        setActiveTab={setActiveCommentTab}
      />
      {activeCommentTab === 'Comments' ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitleWrapper>
              <CardTitle>{t('comments')}</CardTitle>
            </CardTitleWrapper>
          </CardHeader>
          <CardContent>
            <Comments task={task} mutateTask={mutateTask} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mt-4">
            <CardHeader>
              <CardTitleWrapper>
                <CardTitle>{t('task-activity')}</CardTitle>
              </CardTitleWrapper>
            </CardHeader>
            <CardContent>
              <TaskAuditLogs task={task} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitleWrapper>
                <CardTitle>{t('rpa-audit-logs')}</CardTitle>
              </CardTitleWrapper>
            </CardHeader>
            <CardContent>
              <RpaAuditLogs task={task} slug={slug} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitleWrapper>
                <CardTitle>{t('tia-audit-logs')}</CardTitle>
              </CardTitleWrapper>
            </CardHeader>
            <CardContent>
              <TiaAuditLogs task={task} slug={slug} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitleWrapper>
                <CardTitle>{t('csc-audit-logs')}</CardTitle>
              </CardTitleWrapper>
            </CardHeader>
            <CardContent>
              <CscAuditLogs task={task} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitleWrapper>
                <CardTitle>{t('pia-audit-logs')}</CardTitle>
              </CardTitleWrapper>
            </CardHeader>
            <CardContent>
              <PiaAuditLogs task={task} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitleWrapper>
                <CardTitle>{t('rm-audit-logs')}</CardTitle>
              </CardTitleWrapper>
            </CardHeader>
            <CardContent>
              <RmAuditLogs task={task} slug={slug} />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  const cscTranslations = [
    'csc/2013',
    'csc/2022',
    'csc/mvps',
    'csc/nistcsfv2',
    'csc/eunis2',
    'csc/gdpr',
    'csc/cisv81',
    'csc/soc2v2',
    'csc/c5_2020',
  ];

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, [
            'common',
            'rpa',
            'tia',
            'pia',
            'rm',
            ...cscTranslations,
          ])
        : {}),
    },
  };
}

export default TaskById;
 