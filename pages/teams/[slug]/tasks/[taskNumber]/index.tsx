import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Button } from "react-daisyui";
import { Loading, Error } from "@/components/ui";

import { GetServerSidePropsContext } from "next";
import useTask from "hooks/useTask";
import useTeamMembers from "hooks/useTeamMembers";
import statuses from "data/statuses.json";
import { Comments } from "@/components/interfaces/Task";
import { CscAuditLogs, CscPanel } from "@/components/interfaces/CSC";
import { CreateRPA, RpaPanel, RpaAuditLog } from "@/components/interfaces/RPA";

const TaskById: NextPageWithLayout = () => {
  const [rpaVisible, setRpaVisible] = useState(false)
  const router = useRouter();
  const { t } = useTranslation("common");
  const { taskNumber, slug } = router.query;
  const {task, isLoading, isError, mutateTask} = useTask(slug as string, taskNumber as string)
  const {members: members, isLoading: isMembersLoading, isError: isMembersError} = useTeamMembers(slug as string)

  console.log('task ->', task)

  if (isLoading || isMembersLoading || !task) {
    return <Loading />;
  }

  if (isError|| isMembersError) {
    return <Error />;
  }

  return (
    <>
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
            mutateTask={mutateTask}
          />
        }
        <p>title: {task?.title}</p>
        <p>status: {statuses.find(({value}) => task?.status === value)?.label}</p>
        <p>description: {task?.description}</p>
        <p>due date: {task?.duedate}</p>
        <CscPanel task={task} mutateTask={mutateTask}/>
        <RpaPanel task={task} />
        <hr/>
        <CscAuditLogs task={task}/>
        <RpaAuditLog task={task}/>
        <Comments task={task} mutateTask={mutateTask}/>
    </>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default TaskById;
