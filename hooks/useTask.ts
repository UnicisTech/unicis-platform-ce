import useSWR, { mutate } from "swr";
import type { ApiResponse } from "types";
import type { TaskWithComments } from "types";
import fetcher from "@/lib/fetcher";

const useTask = (slug: string, taskNumber: string) => {
  const url = `/api/teams/${slug}/tasks/${taskNumber}`;
  const { data, error } = useSWR<ApiResponse<TaskWithComments>>(url, fetcher);

  const mutateTask = async () => {
    mutate(url);
  };

  return {
    isLoading: !error && !data,
    isError: error,
    task: data?.data,
    mutateTask,
  };
};

export default useTask;
