import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, Card } from '@/components/shared';
import { Button } from 'react-daisyui';
import { GetServerSidePropsContext } from 'next';
import useTask from 'hooks/useTask';
import {
  Attachments,
  Comments,
  CommentsTab,
  TaskDetails,
  TaskTab,
} from '@/components/interfaces/Task';
import { CscAuditLogs, CscPanel } from '@/components/interfaces/CSC';
import { CreateRPA, RpaPanel, RpaAuditLog } from '@/components/interfaces/RPA';
import { CreateRiskManagementRisk, RiskManagementTaskPanel } from '@/components/interfaces/RiskManagement';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import useISO from 'hooks/useISO';
import { Team } from '@prisma/client';
import { getCscStatusesBySlug } from 'models/team';
import { CreateTIA, TiaAuditLogs, TiaPanel } from '@/components/interfaces/TIA';
import Breadcrumb from '../../Breadcrumb';

const TaskById = ({
  csc_statuses,
}: {
  csc_statuses: { [key: string]: string };
}) => {
  const [rpaVisible, setRpaVisible] = useState(false);
  const [tiaVisible, setTiaVisible] = useState(false);
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
            heading="RPA panel"
            button={
              canAccess('task', ['update']) ? (
                <Button
                  size="sm"
                  color="primary"
                  variant="outline"
                  onClick={() => {
                    setRpaVisible(!rpaVisible);
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
            heading="TIA panel"
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
        <Card heading="CSC panel">
          <Card.Body>
            <CscPanel
              task={task}
              mutateTask={mutateTask}
              statuses={statuses}
              setStatuses={setStatuses}
              ISO={ISO}
            />
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
        <CreateTIA
          visible={tiaVisible}
          setVisible={setTiaVisible}
          task={task}
          mutate={mutateTask}
        />
      )}
      {rpaVisible && (
        <CreateRPA
          visible={rpaVisible}
          setVisible={setRpaVisible}
          task={task}
          mutate={mutateTask}
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
          <Card heading="RPA Audit logs">
            <Card.Body>
              <RpaAuditLog task={task} />
            </Card.Body>
          </Card>
          <Card heading="Tia Audit logs">
            <Card.Body>
              <TiaAuditLogs task={task} />
            </Card.Body>
          </Card>
          <Card heading="CSC Audit logs">
            <Card.Body>
              <CscAuditLogs task={task} />
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
