import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Loading, Error, TaskRecurrenceBadge } from '@/components/shared';
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
import { Button } from '@/components/shadcn/ui/button';
import type {
  PiaRisk,
  RMProcedureInterface,
  TaskProperties,
  TiaProcedureInterface,
} from 'types';

// ── Direction B panel card ─────────────────────────────────────────────────────
const Panel = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-4">
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
      <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
        {title}
      </span>
      {action}
    </div>
    <div className="p-0">{children}</div>
  </div>
);

const TaskById = () => {
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

      {/* Task title */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{task.title}</h3>
        {task.recurrenceScheduleId && <TaskRecurrenceBadge />}
      </div>

      {/* Module tabs */}
      <TaskTab activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Overview ─────────────────────────────────────────────────── */}
      {activeTab === 'Overview' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <TaskDetails task={task} team={team as Team} />
        </div>
      )}

      {/* ── Processing Activities ────────────────────────────────────── */}
      {activeTab === 'Processing Activities' && (
        <Panel
          title={t('processing-activities-panel')}
          action={
            canAccess('task', ['update']) ? (
              <Button
                variant="outline"
                size="sm"
                className="text-[12px] h-7"
                onClick={() => rpaState.setIsRpaOpen(!rpaState.isRpaOpen)}
              >
                {t('create-rpa')}
              </Button>
            ) : undefined
          }
        >
          <div className="p-4">
            <RpaPanel task={task} slug={slug} />
          </div>
        </Panel>
      )}

      {/* ── Transfer Impact Assessment ───────────────────────────────── */}
      {activeTab === 'Transfer Impact Assessment' && (
        <Panel
          title={t('transfer-impact-assessment-panel')}
          action={
            canAccess('task', ['update']) ? (
              <Button
                variant="outline"
                size="sm"
                className="text-[12px] h-7"
                onClick={() => setTiaVisible(!tiaVisible)}
              >
                {t('create-tia')}
              </Button>
            ) : undefined
          }
        >
          <div className="p-4">
            <TiaPanel task={task} />
          </div>
        </Panel>
      )}

      {/* ── Cybersecurity Controls ───────────────────────────────────── */}
      {activeTab === 'Cybersecurity Controls' && (
        <Panel title={t('cybersecurity-controls-panel')}>
          <div className="p-4">
            <CscPanel task={task} team={team} mutateTask={mutateTask} />
          </div>
        </Panel>
      )}

      {/* ── Privacy Impact Assessment ────────────────────────────────── */}
      {activeTab === 'Privacy Impact Assessment' && (
        <Panel
          title={t('privacy-impact-assessment-panel')}
          action={
            canAccess('task', ['update']) ? (
              <Button
                variant="outline"
                size="sm"
                className="text-[12px] h-7"
                onClick={() => setPiaVisible(!piaVisible)}
              >
                {t('create-pia')}
              </Button>
            ) : undefined
          }
        >
          <div className="p-4">
            <PiaPanel task={task} />
          </div>
        </Panel>
      )}

      {/* ── Risk Management ─────────────────────────────────────────── */}
      {activeTab === 'Risk Management' && (
        <Panel
          title={t('risk-management-panel')}
          action={
            canAccess('task', ['update']) ? (
              <Button
                variant="outline"
                size="sm"
                className="text-[12px] h-7"
                onClick={() => setRmVisible(!rmVisible)}
              >
                {t('rm-register-risk-record')}
              </Button>
            ) : undefined
          }
        >
          <div className="p-4">
            <RiskManagementTaskPanel task={task} slug={slug} />
          </div>
        </Panel>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
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

      {/* ── Attachments ─────────────────────────────────────────────── */}
      <Panel title={t('attachments')}>
        <div className="p-4">
          <Attachments task={task} mutateTask={mutateTask} />
        </div>
      </Panel>

      {/* ── Comments / Activity ─────────────────────────────────────── */}
      <div className="mt-4 mb-1">
        <CommentsTab
          activeTab={activeCommentTab}
          setActiveTab={setActiveCommentTab}
        />
      </div>

      {activeCommentTab === 'Comments' ? (
        <Panel title={t('comments')}>
          <div className="p-4">
            <Comments task={task} mutateTask={mutateTask} />
          </div>
        </Panel>
      ) : (
        <>
          <Panel title={t('task-activity')}>
            <div className="p-4">
              <TaskAuditLogs task={task} />
            </div>
          </Panel>
          <Panel title={t('rpa-audit-logs')}>
            <div className="p-4">
              <RpaAuditLogs task={task} slug={slug} />
            </div>
          </Panel>
          <Panel title={t('tia-audit-logs')}>
            <div className="p-4">
              <TiaAuditLogs task={task} slug={slug} />
            </div>
          </Panel>
          <Panel title={t('csc-audit-logs')}>
            <div className="p-4">
              <CscAuditLogs task={task} />
            </div>
          </Panel>
          <Panel title={t('pia-audit-logs')}>
            <div className="p-4">
              <PiaAuditLogs task={task} />
            </div>
          </Panel>
          <Panel title={t('rm-audit-logs')}>
            <div className="p-4">
              <RmAuditLogs task={task} slug={slug} />
            </div>
          </Panel>
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
