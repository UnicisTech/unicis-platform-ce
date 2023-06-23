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
  StatusFilter
} from "@/components/interfaces/CSC";
import { PerPageSelector } from "@/components/ui/atlaskit";
import { perPageOptions } from "data/configs/csc";
import useTeamTasks from "hooks/useTeamTasks";
import { getCscStatusesBySlug } from "models/team";
import type { Option } from "types";

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
    const [isSaving, setIsSaving] = useState(false)
    const [sectionFilter, setSectionFilter] = useState<null | { label: string, value: string }[]>(null)
    const [statusFilter, setStatusFilter] = useState<null | Option[]>(null)
    const [perPage, setPerPage] = useState<number>(10)


    const { isLoading, isError, team } = useTeam(slug as string);
    const { tasks, mutateTasks } = useTeamTasks(slug as string)

    const statusHandler = useCallback(async (control: string, value: string) => {
      setIsSaving(true)
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
      setIsSaving(false)
    }, [])

    const taskSelectorHandler = useCallback(async (action: string, dataToRemove: any, control: string) => {
      setIsSaving(true)
      const operation = action === "select-option" ? "add" : "remove"
      for (const option of dataToRemove) {
        const issueId = option.value
        const response = await axios.put(
          `/api/tasks/${issueId}/csc`,
          {
            controls: [control],
            operation
          }
        );

        const { error } = response.data;

        if (error) {
          toast.error(error.message);
          return;
        }

        mutateTasks()
      }
      setIsSaving(false)
    }, [])

    if (isLoading || !team || !tasks) {
      return <Loading />;
    }

    if (isError) {
      return <Error />;
    }

    return (
      <>
        <h3 className="text-2xl font-bold">{"Cybersecurity Controls Dashboard: "}{team.name}</h3>
        <div style={{ height: '400px', width: '100%', display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
          <div style={{ width: '49%' }}>
            <div className="stats shadow w-full h-full">
              <div className="stat">
                <div className="stat-value">
                  <PieChart statuses={statuses}/>
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: '49%' }}>
          <div className="stats shadow w-full h-full">
              <div className="stat">
                <div className="stat-value">
                  <RadarChart statuses={statuses}/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SectionFilter setSectionFilter={setSectionFilter} />
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
          tasks={tasks}
          statuses={statuses}
          sectionFilter={sectionFilter}
          statusFilter={statusFilter}
          perPage={perPage}
          isSaving={isSaving}
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
