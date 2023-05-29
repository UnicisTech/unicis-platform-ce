import React, { useState, useEffect } from "react";
import Link from "next/link";
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import { SimpleTag as Tag } from '@atlaskit/tag';
import statuses from "data/statuses.json";
import { v4 as uuidv4 } from 'uuid';
import type { TaskWithRpaProcedure } from "types";
import Button from "@atlaskit/button";

const head = {
  cells: [
    {
      key: 'task',
      content: 'Register of Procedures',
      width: 10,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Status',
      width: 10,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Data Protection Officer (DPO)',
      width: 20,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Review of the process',
      width: 10
    },
    {
      key: uuidv4(),
      content: 'Data transfer',
      width: 10,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Special Category of Personal Data',
      width: 30,
      isSortable: true
    },
    {
      key: uuidv4(),
      content: 'Actions',
      width: 15
    }
  ],
};

const RpaTable = ({
  slug,
  tasks,
  perPage,
  isSaving,
  editHandler,
  deleteHandler,
}: {
  slug: string;
  tasks: Array<TaskWithRpaProcedure>;
  perPage: number;
  isSaving: boolean;
  editHandler: (task: TaskWithRpaProcedure) => void
  deleteHandler: (task: TaskWithRpaProcedure) => void
}) => {
  const [rows, setRows] = useState(Array<any>)

  useEffect(() => {
    const rows: Array<any> = []
    tasks.forEach((task, index) => {
      rows.push({
        key: uuidv4(),
        cells: [
          {
            key: task.title,
            content: <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
              <a>
                <div className="flex items-center justify-start space-x-2">
                  <span className="underline">{task.title}</span>
                </div>
              </a>
            </Link>
          },
          {
            key: task.status,
            content: <Lozenge>{statuses.find(({ value }) => value === task.status)?.label}</Lozenge>
          },
          {
            key: task.properties.rpa_procedure[0].dpo.label,
            content: <span>{task.properties.rpa_procedure[0].dpo.label}</span>
          },
          {
            key: task.properties.rpa_procedure[0].reviewDate,
            content: <Tag text={task.properties.rpa_procedure[0].reviewDate} />
          },
          {
            key: task.properties.rpa_procedure[3].datatransfer.toString(),
            content: <>
              {task.properties.rpa_procedure[3].datatransfer
                ? <Lozenge appearance="success">Enabled</Lozenge>
                : <Lozenge appearance="removed">Disabled</Lozenge>
              }
            </>
          },
          {
            key: task.properties.rpa_procedure[1].specialcategory.join(','),
            content: task.properties.rpa_procedure[1].specialcategory.map((category, index) => <Tag key={index} text={category.label} />)
          },
          {
            key: 'actions',
            content: (
              <div>
                <Button onClick={() => editHandler(task)} iconBefore={<EditFilledIcon label="edit"/>}></Button>
                <Button onClick={() => deleteHandler(task)} appearance="danger" iconBefore={<TrashIcon label="delete"/>}></Button>
              </div>
            )
          },
        ]
      })
    })
    setRows(rows)
  }, [tasks])

  return (
    <>
      <DynamicTable
        head={head}
        rows={rows}
        rowsPerPage={perPage}
        defaultPage={1}
        loadingSpinnerSize="large"
        defaultSortKey="task"
        defaultSortOrder="ASC"
        isLoading={false}
      />
    </>
  )
}

export default RpaTable