import useSWR, { mutate } from "swr";
import type { ApiResponse } from "types";
import type { TaskWithComments } from "types";
import fetcher from "@/lib/fetcher";

//TODO: remade to two param slug and taskNumber
const useTask = (url: string) => {
  const { data, error } = useSWR<ApiResponse<TaskWithComments>>(
    url ? url : null,
    fetcher
  );

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
