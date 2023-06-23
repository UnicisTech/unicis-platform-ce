import React, { useState, useEffect } from "react";
import StatusHeader from "./StatusHeader";
import TaskSelector from "./TaskSelector";
import { controlOptions } from "data/configs/csc";
import StatusSelector from "./StatusSelector"
import type { CscOption } from "types";
import type { Task } from "@prisma/client";
import usePagination from "hooks/usePagination";
import { ControlOption } from "types";

const StatusesTable = ({
  tasks,
  statuses,
  sectionFilter,
  statusFilter,
  perPage,
  isSaving,
  statusHandler,
  taskSelectorHandler
}: {
  tasks: Array<Task>;
  statuses: any;
  sectionFilter: null | Array<{ label: string, value: string }>;
  statusFilter: null | Array<CscOption>;
  perPage: number;
  isSaving: boolean;
  statusHandler: (control: string, value: string) => Promise<void>;
  taskSelectorHandler: (action: string, dataToRemove: any, control: string) => Promise<void>
}) => {
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
      <div
        className="overflow-x-auto"
      >
        <table className="table table-xs min-w-full">
          <thead>
            <tr>
              <th className="w-1/10">Code</th>
              <th className="w-1/10">Section</th>
              <th className="w-1/10">Control</th>
              <th className="w-2/10">Requirements</th>
              <th className="w-3/10"><StatusHeader /></th>
              <th className="w-1.5/10">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((option, index) =>
              <tr className="hover" key={option.value.control}>
                <td>
                  {option.value.code}
                </td>
                <td>
                  {option.value.section}
                </td>
                <td>
                  {option.value.control}
                </td>
                <td>
                  <span style={{ whiteSpace: "pre-line" }}>{option.value.requirements}</span>
                </td>
                <td>
                  <div className="w-60 min-w-max">
                    <StatusSelector statusValue={statuses[option.value.control]} control={option.value.control} handler={statusHandler} />
                  </div>
                </td>
                <td>
                  <TaskSelector tasks={tasks} control={option.value.control} handler={taskSelectorHandler} />
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
    </>
  )
}

export default StatusesTable