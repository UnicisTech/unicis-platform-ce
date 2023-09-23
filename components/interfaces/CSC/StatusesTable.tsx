import React, { useState, useEffect } from "react";
import StatusHeader from "./StatusHeader";
import TaskSelector from "./TaskSelector";
import { controlOptions } from "@/components/defaultLanding/data/configs/csc";
import StatusSelector from "./StatusSelector"
import type { CscOption } from "types";
import type { Task } from "@prisma/client";
import usePagination from "hooks/usePagination";
import useCanAccess from 'hooks/useCanAccess';
import { ControlOption } from "types";
import { TailwindTableWrapper } from "sharedStyles";
import TasksList from "./TasksList";

const StatusesTable = ({
  tasks,
  statuses,
  sectionFilter,
  statusFilter,
  perPage,
  statusHandler,
  taskSelectorHandler
}: {
  tasks: Array<Task>;
  statuses: any;
  sectionFilter: null | Array<{ label: string, value: string }>;
  statusFilter: null | Array<CscOption>;
  perPage: number;
  statusHandler: (control: string, value: string) => Promise<void>;
  taskSelectorHandler: (action: string, dataToRemove: any, control: string) => Promise<void>
}) => {
  const { canAccess } = useCanAccess();
  const [filteredControls, setFilteredControls] = useState<Array<ControlOption>>(controlOptions)
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<ControlOption>(filteredControls, perPage);

  useEffect(() => {
    let filteredControls = [...controlOptions]
    if ((sectionFilter === null || sectionFilter?.length === 0) && (statusFilter === null || statusFilter?.length === 0)) {
      setFilteredControls(controlOptions)
      return
    }
    if (sectionFilter?.length) {
      filteredControls = filteredControls.filter(control => (sectionFilter.map(option => option.label)).includes(control.value.section))
    }
    if (statusFilter?.length) {
      filteredControls = filteredControls.filter(control => (statusFilter.map(option => option.label)).includes(statuses[control.value.control]))
    }
    setFilteredControls(filteredControls)
  }, [sectionFilter, statusFilter])

  return (
    <>
      <TailwindTableWrapper>
        <div
          className="overflow-x-auto"
        >
          <table className="w-full table-fixed text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Code</th>
                <th scope="col" className="px-6 py-3">Section</th>
                <th scope="col" className="px-6 py-3">Control</th>
                <th scope="col" className="px-6 py-3">Requirements</th>
                <th scope="col" className="px-6 py-3"><StatusHeader /></th>
                <th scope="col" className="px-6 py-3">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((option, index) =>
                <tr key={option.value.control} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                  <td className="px-6 py-3">
                    {option.value.code}
                  </td>
                  <td className="px-6 py-3">
                    {option.value.section}
                  </td>
                  <td className="px-6 py-3">
                    {option.value.control}
                  </td>
                  <td className="px-6 py-3">
                    <span style={{ whiteSpace: "pre-line" }}>{option.value.requirements}</span>
                  </td>
                  <td className="px-6 py-3">
                      {canAccess('task', ['update'])
                        ? <div className="w-40">
                            <StatusSelector statusValue={statuses[option.value.control]} control={option.value.control} handler={statusHandler} />
                          </div>
                        : <span style={{ whiteSpace: "pre-line" }}>{statuses[option.value.control]}</span>
                      }
                  </td>
                  <td className="px-6 py-3 w-40">
                    {canAccess('task', ['update'])
                      ? <TaskSelector tasks={tasks} control={option.value.control} handler={taskSelectorHandler} />
                      : <TasksList tasks={tasks} control={option.value.control}/>
                    }
                    
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pageData.length
          ? <div className="flex justify-center w-30">
            <div className="btn-group join grid grid-cols-10">
              <button className="join-item btn btn-outline col-span-4" onClick={goToPreviousPage} disabled={prevButtonDisabled}>Previous page</button>
              <button className="join-item btn btn-outline col-span-2">{`${currentPage}/${totalPages}`}</button>
              <button className="join-item btn btn-outline col-span-4" onClick={goToNextPage} disabled={nextButtonDisabled}>Next</button>
            </div>
          </div>
          : null
        }
      </TailwindTableWrapper>
    </>
  )
}

export default StatusesTable