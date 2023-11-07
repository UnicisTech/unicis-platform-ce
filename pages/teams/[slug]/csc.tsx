import type { NextPageWithLayout } from "types";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import axios from "axios";
import toast from "react-hot-toast";
import { Loading, Error } from "@/components/shared";
//import { Loading, Error } from "@/components/ui";
import type { InferGetServerSidePropsType } from "next"
import useTeam from "hooks/useTeam";
import { GetServerSidePropsContext } from "next";
import {
  StatusesTable,
  PieChart,
  RadarChart,
  SectionFilter,
  StatusFilter
} from "@/components/interfaces/CSC";
import { PerPageSelector } from "@/components/shared/atlaskit";
import { perPageOptions } from "@/components/defaultLanding/data/configs/csc";
import useTeamTasks from "hooks/useTeamTasks";
import { getCscStatusesBySlug } from "models/team";
import type { Option } from "types";
import useISO from "hooks/useISO";

const CscDashboard: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
  csc_statuses
}: {
  csc_statuses: { [key: string]: string; }
}) => {
    const router = useRouter();
    const { t } = useTranslation("common");
    const { slug } = router.query;

    const [statuses, setStatuses] = useState(csc_statuses)
    const [sectionFilter, setSectionFilter] = useState<null | { label: string, value: string }[]>(null)
    const [statusFilter, setStatusFilter] = useState<null | Option[]>(null)
    const [perPage, setPerPage] = useState<number>(10)


    const { isLoading, isError, team } = useTeam(slug as string);
    const { tasks, mutateTasks } = useTeamTasks(slug as string)
    const { ISO } = useISO(team)

    const statusHandler = useCallback(async (control: string, value: string) => {
      const response = await axios.put(
        `/api/teams/${slug}/csc`,
        {
          control,
          value,
        }
      );

      const { data, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      setStatuses(data.statuses)
    }, [])

    const taskSelectorHandler = useCallback(async (action: string, dataToRemove: any, control: string) => {
      const operation = action === "select-option" ? "add" : "remove"
      for (const option of dataToRemove) {
        const taskNumber = option.value
        const response = await axios.put(
          `/api/teams/${slug}/tasks/${taskNumber}/csc`,
          {
            controls: [control],
            operation,
            ISO
          }
        );

        const { error } = response.data;

        if (error) {
          toast.error(error.message);
          return;
        }

        mutateTasks()
      }
    }, [ISO])

    useEffect(() => {
      console.log('CSC ISO', ISO)
    }, [ISO])

    if (isLoading || !team || !tasks || !ISO) {
      return <Loading />;
    }

    if (isError) {
      return <Error />;
    }

    return (
      <>
        <h2 className="text-xl font-medium leading-none tracking-tight">
          {"Cybersecurity Controls Dashboard: "}{team.name}
        </h2>
        {/* <h2 className="text-2xl font-bold">{"Cybersecurity Controls Dashboard: "}{team.name}</h2> */}
        <div style={{ height: '400px', width: '100%', display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
          <div style={{ width: '49%' }} className="stats stat-value shadow pl-4 py-4">
            <PieChart statuses={statuses} />
          </div>
          <div style={{ width: '49%' }} className="stats stat-value shadow">
            <RadarChart 
              statuses={statuses} 
              ISO={ISO}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SectionFilter 
            ISO={ISO}
            setSectionFilter={setSectionFilter} 
          />
          <StatusFilter setStatusFilter={setStatusFilter} />
          <PerPageSelector
            setPerPage={setPerPage}
            options={perPageOptions}
            placeholder="Controls per page"
            defaultValue={{
              label: "10",
              value: 10,
            }}
          />
        </div>
        <StatusesTable
          ISO={ISO}
          tasks={tasks}
          statuses={statuses}
          sectionFilter={sectionFilter}
          statusFilter={statusFilter}
          perPage={perPage}
          statusHandler={statusHandler}
          taskSelectorHandler={taskSelectorHandler}
        />
      </>
    );
  };

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      csc_statuses: await getCscStatusesBySlug(slug),

    },
  };
};

export default CscDashboard;
