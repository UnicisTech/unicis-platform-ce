"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { Loading, Error } from "@/components/shared";
import {
  Attachments,
  Comments,
  CommentsTab,
  TaskDetails,
  TaskTab,
} from "@/components/interfaces/Task";
import {
  CscAuditLogs,
  CscPanel,
} from "@/components/interfaces/CSC";
import {
  RpaPanel,
  RpaAuditLog,
  CreateProcedureTest,
} from "@/components/interfaces/RPA";
import {
  CreateRiskManagementRisk,
  RiskManagementTaskPanel,
  RmAuditLogs,
} from "@/components/interfaces/RiskManagement";
import useTask from "hooks/useTask";
import useTeam from "hooks/useTeam";
import useCanAccess from "hooks/useCanAccess";
import useISO from "hooks/useISO";
import { Team } from "@prisma/client";
import { getCscStatusesBySlug } from "models/team";
import {
  TiaAuditLogs,
  TiaPanel,
  CreateProcedure as CreateTiaProcedure,
} from "@/components/interfaces/TIA";
import {
  CreatePiaRisk,
  PiaPanel,
  PiaAuditLogs,
} from "@/components/interfaces/PIA";
import Breadcrumb from "../../Breadcrumb";
import useRpaCreation from "hooks/useRpaCreation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import type {
  PiaRisk,
  RMProcedureInterface,
  TaskProperties,
  TiaProcedureInterface,
} from "types";

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
  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();
  const { taskNumber, slug } = router.query as { slug: string; taskNumber: string };

  const {
    team,
    isLoading: teamLoading,
    isError: teamError,
  } = useTeam(slug);
  const { task, isLoading, isError, mutateTask } = useTask(slug as string, taskNumber as string);
  const { ISO } = useISO(team);
  const rpaState = useRpaCreation(task);

  if (isLoading || teamLoading || !ISO) return <Loading />;
  if (!task || isError || teamError) return <Error message={(isError || teamError)?.message || ""} />;

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
      {activeTab === "Overview" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("details")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskDetails task={task} team={team as Team} />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{t("attachments")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Attachments task={task} mutateTask={mutateTask} />
            </CardContent>
          </Card>
        </>
      )}
      {activeTab === "Processing Activities" && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between px-4 pt-6">
              <CardTitle>{t("processing-activities-panel")}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rpaState.setIsRpaOpen(!rpaState.isRpaOpen)}
                >
                  {t('create-rpa')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <RpaPanel task={task} />
          </CardContent>
        </Card>
      )}
      {activeTab === "Transfer Impact Assessment" && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between px-4 pt-6">
              <CardTitle>{t("transfer-impact-assessment-panel")}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button variant="outline" size="sm" onClick={() => setTiaVisible(!tiaVisible)}>
                  {t("create-tia")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <TiaPanel task={task} />
          </CardContent>
        </Card>
      )}
      {activeTab === "Cybersecurity Controls" && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between px-4 pt-6">
              <CardTitle>{t("cybersecurity-controls-panel")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CscPanel
              task={task}
              statuses={statuses as { [key: string]: string }}
              setStatuses={setStatuses}
              ISO={ISO}
              mutateTask={mutateTask}
            />
          </CardContent>
        </Card>
      )}
      {activeTab === "Privacy Impact Assessment" && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between px-4 pt-6">
              <CardTitle>{t("privacy-impact-assessment-panel")}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button variant="outline" size="sm" onClick={() => setPiaVisible(!piaVisible)}>
                  {t("create-pia")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <PiaPanel task={task} />
          </CardContent>
        </Card>
      )}
      {activeTab === "Risk Management" && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between px-4 pt-6">
              <CardTitle>{t("risk-management-panel")}</CardTitle>
              {canAccess('task', ['update']) && (
                <Button variant="outline" size="sm" onClick={() => setRmVisible(!rmVisible)}>
                  {t("rm-register-risk-record")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <RiskManagementTaskPanel task={task} />
          </CardContent>
        </Card>
      )}
      {tiaVisible && (
        <CreateTiaProcedure
          open={tiaVisible}
          onOpenChange={setTiaVisible}
          selectedTask={task}
          prevProcedure={(task.properties as TaskProperties)?.tia_procedure as TiaProcedureInterface | undefined}
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
          prevRisk={(task.properties as TaskProperties)?.rm_risk as RMProcedureInterface}
          mutateTasks={mutateTask}
        />
      )}
      <CommentsTab activeTab={activeCommentTab} setActiveTab={setActiveCommentTab} />
      {activeCommentTab === "Comments" ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t("comments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Comments task={task} mutateTask={mutateTask} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{t("rpa-audit-logs")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RpaAuditLog task={task} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{t("tia-audit-logs")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TiaAuditLogs task={task} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{t("csc-audit-logs")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CscAuditLogs task={task} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{t("pia-audit-logs")}</CardTitle>
            </CardHeader>
            <CardContent>
              <PiaAuditLogs task={task} />
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{t("rm-audit-logs")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RmAuditLogs task={task} />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const slug = query.slug as string;
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TaskById;
