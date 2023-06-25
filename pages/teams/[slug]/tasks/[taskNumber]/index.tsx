import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Loading, Error, Card } from "@/components/ui";
import { Button } from "react-daisyui";
import { GetServerSidePropsContext } from "next";
import useTask from "hooks/useTask";
import { Comments, CommentsTab, TaskDetails, TaskTab } from "@/components/interfaces/Task";
import { CscAuditLogs, CscPanel } from "@/components/interfaces/CSC";
import { RpaPanel, RpaAuditLog } from "@/components/interfaces/RPA";
import useTeam from "hooks/useTeam";
import { Team } from "@prisma/client";
import useTeamMembers from "hooks/useTeamMembers";
import { CreateRPA } from "@/components/interfaces/RPA";
import { getCscStatusesBySlug } from "models/team";
import { InferGetServerSidePropsType } from "next";

const TaskById: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
  csc_statuses
}: {
  csc_statuses: { [key: string]: string; }
}) => {
    const [rpaVisible, setRpaVisible] = useState(false)
    const [activeTab, setActiveTab] = useState("Overview")
    const [activeCommentTab, setActiveCommentTab] = useState("Comments")
    const router = useRouter();
    const { t } = useTranslation("common");
    const { taskNumber, slug } = router.query;
    const { team, isLoading: isTeamLoading, isError: isTeamError } = useTeam(slug as string)
    const { task, isLoading, isError, mutateTask } = useTask(slug as string, taskNumber as string)
    const { members: members, isLoading: isMembersLoading, isError: isMembersError } = useTeamMembers(slug as string)

    if (isLoading || !task || isTeamLoading) {
      return <Loading />;
    }

    if (isError || isTeamError) {
      return <Error />;
    }

    return (
      <>
        <h3 className="text-2xl font-bold">{task.title}</h3>
        <TaskTab activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "Overview" && (
          <Card heading="Details">
            <Card.Body className="p-2 rounded-3xl m-2.5	">
              <TaskDetails task={task} team={team as Team} />
            </Card.Body>
          </Card>
        )}
        {activeTab === "Processing Activities" && (
          <Card heading="RPA panel">
            <Card.Body className="p-2 rounded-3xl m-2.5	">
              <RpaPanel task={task} />
            </Card.Body>
          </Card>
        )}
        {activeTab === "Cybersecurity Controls" && (
          <Card heading="CSC panel">
            <Card.Body className="p-2 rounded-3xl m-2.5	">
              <CscPanel task={task} mutateTask={mutateTask} statuses={csc_statuses}/>
            </Card.Body>
          </Card>
        )}
        <div>
          <Button
            size="sm"
            color="primary"
            className="text-white"
            onClick={() => {
              setRpaVisible(!rpaVisible);
            }}
          >
            {t("create-rpa")}
          </Button>
        </div>

        {rpaVisible &&
          <CreateRPA
            visible={rpaVisible}
            setVisible={setRpaVisible}
            task={task}
            members={members}
            mutate={mutateTask}
          />
        }

        <CommentsTab activeTab={activeCommentTab} setActiveTab={setActiveCommentTab} />
        {activeCommentTab === "Comments" && (
          <Card heading="Comments">
            <Card.Body className="p-2 rounded-3xl m-2.5	">
              <Comments task={task} mutateTask={mutateTask} />
            </Card.Body>
          </Card>
        )}
        {activeCommentTab === "Audit logs" && (
          <>
            <Card heading="CSC Audit logs">
              <Card.Body className="p-2 rounded-3xl m-2.5	">
                <CscAuditLogs task={task} />
              </Card.Body>
            </Card>
            <Card heading="RPA Audit logs">
              <Card.Body className="p-2 rounded-3xl m-2.5	">
                <RpaAuditLog task={task} />
              </Card.Body>
            </Card>
          </>
        )}
      </>
    );
  };

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const slug = query.slug as string
  // const { locale, query }: GetServerSidePropsContext = context;
  // const slug = query.slug as string

  // return {
  //   props: {
  //     ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
  //     csc_statuses: await getCscStatusesBySlug(slug),
  //   },
  // };
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TaskById;
