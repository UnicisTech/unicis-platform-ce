import React from "react";
import Link from "next/link";
import Lozenge from '@atlaskit/lozenge';
import { SimpleTag as Tag } from '@atlaskit/tag';
import statuses from "data/statuses.json";
import type { TaskWithRpaProcedure } from "types";
import { Button } from "react-daisyui";
import { useTranslation } from "next-i18next";
import usePagination from "hooks/usePagination";

const RpaTable = ({
  slug,
  tasks,
  perPage,
  editHandler,
  deleteHandler,
}: {
  slug: string;
  tasks: Array<TaskWithRpaProcedure>;
  perPage: number;
  editHandler: (task: TaskWithRpaProcedure) => void
  deleteHandler: (task: TaskWithRpaProcedure) => void
}) => {
  const { t } = useTranslation("common");
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<TaskWithRpaProcedure>(tasks, perPage);

  return (
    <>
      <div
        className="overflow-x-auto"
      >
        <table className="table table-xs min-w-full">
          <thead>
            <tr>
              <th className="w-1/10"></th>
              <th className="w-1/10">Register of Procedures</th>
              <th className="w-1/10">Status</th>
              <th className="w-1/10">Data Protection Officer (DPO)</th>
              <th className="w-1/10">Review of the process</th>
              <th className="w-1/10">Data transfer</th>
              <th className="w-3/10">Special Category of Personal Data</th>
              <th className="w-1/10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((task, index) =>
              <tr key={index} className="hover">
                <td className="w-1/10">
                  {index + 1}
                </td>
                <th className="w-1/10">
                  <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                    <a>
                      <div className="flex items-center justify-start space-x-2">
                        <span className="underline">{task.title}</span>
                      </div>
                    </a>
                  </Link>
                </th>
                <td className="w-1/10">
                  <Lozenge>{statuses.find(({ value }) => value === task.status)?.label}</Lozenge>
                </td>
                <td className="w-1/10">
                  <span>{task.properties.rpa_procedure[0].dpo.label}</span>
                </td>
                <td className="w-1/10">
                  <Tag text={task.properties.rpa_procedure[0].reviewDate} />
                </td>
                <td className="w-1/10">
                  <>
                    {task.properties.rpa_procedure[3].datatransfer
                      ? <Lozenge appearance="success">Enabled</Lozenge>
                      : <Lozenge appearance="removed">Disabled</Lozenge>
                    }
                  </>
                </td>
                <td className="w-3/10">
                  <div className="flex flex-col">
                    {task.properties.rpa_procedure[1].specialcategory.map((category, index) => <Tag key={index} text={category.label} />)}
                  </div>
                </td>
                <td className="w-1/10">
                  <div className="btn-group">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        editHandler(task)
                      }}
                    >
                      {t("edit-task")}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        deleteHandler(task)
                      }}
                    >
                      {t("delete-task")}
                    </Button>
                  </div>
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

export default RpaTable