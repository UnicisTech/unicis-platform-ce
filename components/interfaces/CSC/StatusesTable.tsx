import React, { useState, useEffect } from "react";
import DynamicTable from '@atlaskit/dynamic-table';
import { v4 as uuidv4 } from 'uuid';
import StatusHeader from "./StatusHeader";
import TaskSelector from "./TaskSelector";
import { controlOptions } from "data/configs/csc";
import StatusSelector from "./StatusSelector"
import type { CscOption } from "types";
import type { Task } from "@prisma/client";

const head = {
  cells: [
    {
      key: 'code',
      content: 'Code',
      width: 10,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Section',
      width: 10,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Control',
      width: 20,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Requirements',
      width: 25
    },
    {
      key: uuidv4(),
      content: <StatusHeader />,
      width: 20
    },
    {
      key: uuidv4(),
      content: 'Tickets',
      width: 15
    }
  ],
};



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
  sectionFilter: null | Array<{label: string, value: string}>;
  statusFilter: null | Array<CscOption>;
  perPage: number;
  isSaving: boolean;
  statusHandler: (control: string, value: string) => Promise<void>;
  taskSelectorHandler: (action: string, dataToRemove: any, control: string) => Promise<void>
}) => {
  const [rows, setRows] = useState(Array<any>)
  const [filteredRows, setFilteredRows] = useState(Array<any>)

  useEffect(() => {
    const rows: Array<any> = []
    controlOptions.forEach((option, index) => {
      rows.push({
        key: uuidv4(),
        cells: [
          {
            key: index,
            content: <span>{option.value.code}</span>
          },
          {
            key: option.value.section + index,
            content: <span>{option.value.section}</span>
          },
          {
            key: option.value.control,
            content: <span>{option.value.control}</span>
          },
          {
            key: option.value.requirements,
            content: <span style={{ whiteSpace: "pre-line" }}>{option.value.requirements}</span>
          },
          {
            key: uuidv4(),
            content: <StatusSelector statusValue={statuses[option.value.control]} control={option.value.control} handler={statusHandler} />
          },
          {
            key: uuidv4(),
            content: <TaskSelector tasks={tasks} control={option.value.control} handler={taskSelectorHandler} />
          }
        ]
      })
    })
    setRows(rows)
  }, [])

  useEffect(() => {
    if ((sectionFilter === null || sectionFilter?.length === 0) && (statusFilter === null || statusFilter?.length === 0)) {
      setFilteredRows(rows)
      return
    }
    let filteredRows = [...rows]
    if (sectionFilter?.length) {
      filteredRows = filteredRows.filter(item => (sectionFilter.map(option => option.label)).includes(item.cells[1].content.props.children))
    }
    if (statusFilter?.length) {
      filteredRows = filteredRows.filter(item => (statusFilter.map(option => option.label)).includes(item.cells[4].content.props.statusValue))
    }
    setFilteredRows(filteredRows)
  }, [sectionFilter, statusFilter, rows])

  return (
    <>
      <DynamicTable
        head={head}
        rows={filteredRows}
        rowsPerPage={perPage}
        defaultPage={1}
        loadingSpinnerSize="large"
        defaultSortKey="code"
        defaultSortOrder="ASC"
        isLoading={isSaving}
      />
    </>
  )
}

export default StatusesTable