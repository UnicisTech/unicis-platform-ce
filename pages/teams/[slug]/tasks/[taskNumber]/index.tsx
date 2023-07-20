import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Loading, Error, Card } from "@/components/shared";
import { Button } from "react-daisyui";
import { GetServerSidePropsContext } from "next";
import useTask from "hooks/useTask";
import { Attachments, Comments, CommentsTab, TaskDetails, TaskTab } from "@/components/interfaces/Task";
import { CscAuditLogs, CscPanel } from "@/components/interfaces/CSC";
import { CreateRPA, RpaPanel, RpaAuditLog } from "@/components/interfaces/RPA";
import useTeam from "hooks/useTeam";
import { Team } from "@prisma/client";
import useTeamMembers from "hooks/useTeamMembers";
import { getCscStatusesBySlug } from "models/team";
import { InferGetServerSidePropsType } from "next";
import { CreateTIA, TiaAuditLogs, TiaPanel } from "@/components/interfaces/TIA";

const TaskById: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
  csc_statuses
}: {
  csc_statuses: { [key: string]: string; }
}) => {
    const [rpaVisible, setRpaVisible] = useState(false)
    const [tiaVisible, setTiaVisible] = useState(false)
    const [activeTab, setActiveTab] = useState("Overview")
    const [statuses, setStatuses] = useState(csc_statuses)
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

    console.log('taks:', task)

    return (
      <>
        <h3 className="text-2xl font-bold">{task.title}</h3>
        <TaskTab activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "Overview" && (
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
        {activeTab === "Processing Activities" && (
          <div>
            <Card
              heading="RPA panel"
              button={
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
              }
            >
              <Card.Body>
                <RpaPanel task={task} />
              </Card.Body>
            </Card>
          </div>
        )}
        {activeTab === "Transfer Impact Assessment" && (
          <div>
            <Card
              heading="TIA panel"
              button={
                <Button
                  size="sm"
                  color="primary"
                  className="text-white"
                  onClick={() => {
                    setTiaVisible(!tiaVisible);
                  }}
                >
                  {t("create-tia")}
                </Button>
              }
            >
              <Card.Body>
                <TiaPanel task={task} />
              </Card.Body>
            </Card>
          </div>
        )}
        {activeTab === "Cybersecurity Controls" && (
          <Card heading="CSC panel">
            <Card.Body>
              <CscPanel task={task} mutateTask={mutateTask} statuses={statuses} setStatuses={setStatuses} />
            </Card.Body>
          </Card>
        )}
        {tiaVisible &&
          <CreateTIA
            visible={tiaVisible}
            setVisible={setTiaVisible}
            task={task}
            mutate={mutateTask}
          />
        }
        {/* <Button
          size="sm"
          color="primary"
          className="text-white"
          onClick={() => {
            setTiaVisible(!rpaVisible);
          }}
        >
          {t("create-rpa")}
        </Button> */}
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
            <Card.Body>
              <Comments task={task} mutateTask={mutateTask} />
            </Card.Body>
          </Card>
        )}
        {activeCommentTab === "Audit logs" && (
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

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const slug = query.slug as string

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TaskById;
