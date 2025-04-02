import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, Card } from '@/components/shared';
import { Button } from 'react-daisyui';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import useTask from 'hooks/useTask';
import {
  Attachments,
  Comments,
  CommentsTab,
  TaskDetails,
  TaskTab,
} from '@/components/interfaces/Task';
import { CscAuditLogs, CscPanel } from '@/components/interfaces/CSC';
import {
  RpaPanel,
  RpaAuditLog,
  CreateProcedureTest,
} from '@/components/interfaces/RPA';
import {
  CreateRiskManagementRisk,
  RiskManagementTaskPanel,
  RmAuditLogs,
} from '@/components/interfaces/RiskManagement';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import useISO from 'hooks/useISO';
import { Team } from '@prisma/client';
import { getCscStatusesBySlug } from 'models/team';
import {
  TiaAuditLogs,
  TiaPanel,
  CreateProcedure as CreateTiaProcedure,
} from '@/components/interfaces/TIA';
import {
  CreatePiaRisk,
  PiaPanel,
  PiaAuditLogs,
} from '@/components/interfaces/PIA';
import Breadcrumb from '../../Breadcrumb';
import useRpaCreation from 'hooks/useRpaCreation';

const TaskById = ({
  csc_statuses,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [tiaVisible, setTiaVisible] = useState(false);
  const [piaVisible, setPiaVisible] = useState(false);
  const [rmVisible, setRmVisible] = useState(false);

  const [activeTab, setActiveTab] = useState('Overview');
  const [statuses, setStatuses] = useState(csc_statuses);
  const [activeCommentTab, setActiveCommentTab] = useState('Comments');
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { taskNumber, slug } = router.query;
  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam(slug as string);
  const { task, isLoading, isError, mutateTask } = useTask(
    slug as string,
    taskNumber as string
  );
  const { ISO } = useISO(team);

  const rpaState = useRpaCreation(task);

  if (isLoading || isTeamLoading || !ISO) {
    return <Loading />;
  }

  if (!task || isError || isTeamError) {
    return <Error message={isError.message} />;
  }

  return (
    <>
      <Breadcrumb
        taskTitle={task.title}
        backTo={`/teams/${slug}/tasks`}
        teamName={slug as string}
        taskNumber={taskNumber as string}
      />
      <h3 className="text-2xl font-bold">{task.title}</h3>
      <TaskTab activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'Overview' && (
        <>
          <Card heading="Details">
            <Card.Body>
              <TaskDetails task={task} team={team as Team} />
            </Card.Body>
          </Card>
          <Card heading="Attachments">
            <Card.Body>
              <Attachments task={task} mutateTask={mutateTask} />
            </Card.Body>
          </Card>
        </>
      )}
      {activeTab === 'Processing Activities' && (
        <div>
          <Card
            heading="Processing Activities panel"
            button={
              canAccess('task', ['update']) ? (
                <Button
                  size="sm"
                  color="primary"
                  variant="outline"
                  onClick={() => {
                    rpaState.setIsRpaOpen(!rpaState.isRpaOpen);
                  }}
                >
                  {t('create-rpa')}
                </Button>
              ) : null
            }
          >
            <Card.Body>
              <RpaPanel task={task} />
            </Card.Body>
          </Card>
        </div>
      )}
      {activeTab === 'Transfer Impact Assessment' && (
        <div>
          <Card
            heading="Transfer Impact Assessment panel"
            button={
              canAccess('task', ['update']) ? (
                <Button
                  size="sm"
                  color="primary"
                  variant="outline"
                  onClick={() => {
                    setTiaVisible(!tiaVisible);
                  }}
                >
                  {t('create-tia')}
                </Button>
              ) : null
            }
          >
            <Card.Body>
              <TiaPanel task={task} />
            </Card.Body>
          </Card>
        </div>
      )}
      {activeTab === 'Cybersecurity Controls' && (
        <Card heading="Cybersecurity Controls panel">
          <Card.Body>
            <CscPanel
              task={task}
              mutateTask={mutateTask}
              // {/* TODO: { [key: string]: string; } is temporary solution */}
              statuses={statuses as { [key: string]: string }}
              setStatuses={setStatuses}
              ISO={ISO}
            />
          </Card.Body>
        </Card>
      )}
      {activeTab === 'Privacy Impact Assessment' && (
        <Card
          heading="Privacy Impact Assessment panel"
          button={
            canAccess('task', ['update']) ? (
              <Button
                size="sm"
                color="primary"
                variant="outline"
                onClick={() => {
                  setPiaVisible(!piaVisible);
                }}
              >
                {t('create-pia')}
              </Button>
            ) : null
          }
        >
          <Card.Body>
            <PiaPanel task={task} />
          </Card.Body>
        </Card>
      )}
      {activeTab === 'Risk Management' && (
        <Card
          heading="RM panel"
          button={
            canAccess('task', ['update']) ? (
              <Button
                size="sm"
                color="primary"
                variant="outline"
                onClick={() => {
                  setRmVisible(!rmVisible);
                }}
              >
                {t('rm-register-risk-record')}
              </Button>
            ) : null
          }
        >
          <Card.Body>
            <RiskManagementTaskPanel task={task} />
          </Card.Body>
        </Card>
      )}
      {tiaVisible && (
        <CreateTiaProcedure
          visible={tiaVisible}
          setVisible={setTiaVisible}
          selectedTask={task}
          mutate={mutateTask}
        />
      )}
      <CreateProcedureTest mutateTasks={mutateTask} {...rpaState} />
      {piaVisible && (
        <CreatePiaRisk
          visible={piaVisible}
          setVisible={setPiaVisible}
          selectedTask={task}
          mutateTasks={mutateTask}
        />
      )}
      {rmVisible && (
        <CreateRiskManagementRisk
          visible={rmVisible}
          setVisible={setRmVisible}
          selectedTask={task}
          mutateTasks={mutateTask}
        />
      )}
      <CommentsTab
        activeTab={activeCommentTab}
        setActiveTab={setActiveCommentTab}
      />
      {activeCommentTab === 'Comments' && (
        <Card heading="Comments">
          <Card.Body>
            <Comments task={task} mutateTask={mutateTask} />
          </Card.Body>
        </Card>
      )}
      {activeCommentTab === 'Audit logs' && (
        <>
          <Card heading="Record of Processing Activities Audit logs">
            <Card.Body>
              <RpaAuditLog task={task} />
            </Card.Body>
          </Card>
          <Card heading="Transfer Impact Assessment Audit logs">
            <Card.Body>
              <TiaAuditLogs task={task} />
            </Card.Body>
          </Card>
          <Card heading="Cybersecurity Controls Audit logs">
            <Card.Body>
              <CscAuditLogs task={task} />
            </Card.Body>
          </Card>
          <Card heading="Privacy Impact Assessment Audit logs">
            <Card.Body>
              <PiaAuditLogs task={task} />
            </Card.Body>
          </Card>
          <Card heading="Risk Management Audit logs">
            <Card.Body>
              <RmAuditLogs task={task} />
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
};

export async function getServerSideProps({
  locale,
  query,
}: GetServerSidePropsContext) {
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TaskById;
