import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Loading, Error } from "@/components/ui";

import { GetServerSidePropsContext } from "next";
import useTask from "hooks/useTask";
import statuses from "data/statuses.json";
import { Comments } from "@/components/interfaces/Task";
import { IssuePanel } from "@/components/interfaces/CSC";

const TaskById: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { taskNumber, slug } = router.query;
  const {task, isLoading, isError, mutateTask} = useTask(slug as string, taskNumber as string)

  if (isLoading || !task) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
        <p>title: {task?.title}</p>
        <p>status: {statuses.find(({value}) => task?.status === value)?.label}</p>
        <p>description: {task?.description}</p>
        <p>due date: {task?.duedate}</p>
        <IssuePanel task={task} mutateTask={mutateTask}/>
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
