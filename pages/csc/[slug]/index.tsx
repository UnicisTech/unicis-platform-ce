import type { NextPageWithLayout } from "types";
import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import axios from "axios";
import toast from "react-hot-toast";
import { Loading, Error } from "@/components/ui";
import type { InferGetServerSidePropsType } from "next"
import useTeam from "hooks/useTeam";
import { GetServerSidePropsContext } from "next";
import {
  StatusesTable,
  PieChart,
  RadarChart,
  SectionFilter,
  StatusFilter,
  PerPageSelector
} from "@/components/interfaces/CSC";
import { getSession } from "@/lib/session";
import { getTeamTasks } from "models/task";
import { getCscStatusesBySlug } from "models/team";

interface Option {
  label: string,
  value: number
}

const TeamMembers: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ tasks, csc_statuses }) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { slug } = router.query;

  const [statuses, setStatuses] = useState(csc_statuses)
  const [isSaving, setIsSaving] = useState(false)
  const [sectionFilter, setSectionFilter] = useState<null | [Option]>(null)
  const [statusFilter, setStatusFilter] = useState<null | [Option]>(null)
  const [perPage, setPerPage] = useState(10)


  const { isLoading, isError, team } = useTeam(slug as string);

  const statusHandler = useCallback(async (control: string, value: string) => {
    setIsSaving(true)
    const response = await axios.put(
      `/api/teams/${slug}/csc`,
      {
        control,
        value
      }
    );

    const { data, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    setStatuses(data.statuses)
    setIsSaving(false)
  }, [])

  const issueSelectorHandler = useCallback(async (action: string, dataToRemove: any, control: string) => {
    setIsSaving(true)
    const operation = action === "select-option" ? "add" : "remove"
    // for (const option of dataToRemove) {
    //   const issueId = option.value
    //   console.log('issueSelectorHandler ->', {action, control, operation, issueId})
    //   const response = await axios.put(
    //     `/api/tasks/${issueId}/csc`,
    //     {
    //       control,
    //       operation
    //     }
    //   );

    //   //TODO
    //   }
    setIsSaving(false)
  }, [])

  if (isLoading || !team) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold">{"Cybersecurity Controls Dashboard: "}{team.name}</h3>
      <div style={{ height: '400px', display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
        <PieChart statuses={statuses} />
        <RadarChart statuses={statuses} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SectionFilter setSectionFilter={setSectionFilter} />
        <StatusFilter setStatusFilter={setStatusFilter} />
        <PerPageSelector setPerPage={setPerPage} />
      </div>
      <StatusesTable
        tasks={tasks}
        statuses={statuses}
        sectionFilter={sectionFilter}
        statusFilter={statusFilter}
        perPage={perPage}
        isSaving={isSaving}
        statusHandler={statusHandler}
        issueSelectorHandler={issueSelectorHandler}
      />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      tasks: await getTeamTasks(query.slug as string),
      csc_statuses: await getCscStatusesBySlug(query.slug as string)
    },
  };
};

export default TeamMembers;
