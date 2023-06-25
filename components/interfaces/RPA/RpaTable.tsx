import React from "react";
import Link from "next/link";
import Lozenge from '@atlaskit/lozenge';
import { SimpleTag as Tag } from '@atlaskit/tag';
import statuses from "data/statuses.json";
import type { TaskWithRpaProcedure } from "types";
import { Button } from "react-daisyui";
import { useTranslation } from "next-i18next";
import usePagination from "hooks/usePagination";
import { TailwindTableWrapper } from "sharedStyles";

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
      <TailwindTableWrapper>
        <div
          className="overflow-x-auto"
        >
          <table className="table min-w-full">
            <thead>
              <tr>
                <th>Register of Procedures</th>
                <th>Status</th>
                <th>Data Protection Officer (DPO)</th>
                <th>Review of the process</th>
                <th>Data transfer</th>
                <th>Special Category of Personal Data</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((task, index) =>
                <tr key={index} className="hover">
                  <th>
                    <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                      <a>
                        <div className="flex items-center justify-start space-x-2">
                          <span className="underline">{task.title}</span>
                        </div>
                      </a>
                    </Link>
                  </th>
                  <td>
                    <Lozenge>{statuses.find(({ value }) => value === task.status)?.label}</Lozenge>
                  </td>
                  <td>
                    <span>{task.properties.rpa_procedure[0].dpo.label}</span>
                  </td>
                  <td>
                    <Tag text={task.properties.rpa_procedure[0].reviewDate} />
                  </td>
                  <td>
                    <>
                      {task.properties.rpa_procedure[3].datatransfer
                        ? <Lozenge appearance="success">Enabled</Lozenge>
                        : <Lozenge appearance="removed">Disabled</Lozenge>
                      }
                    </>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      {task.properties.rpa_procedure[1].specialcategory.map((category, index) => <Tag key={index} text={category.label} />)}
                    </div>
                  </td>
                  <td>
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
      </TailwindTableWrapper>
    </>
  )
}

export default RpaTable