import React from "react";
import Link from "next/link";
import Lozenge from '@atlaskit/lozenge';
import { SimpleTag as Tag } from '@atlaskit/tag';
import statuses from "@/components/defaultLanding/data/statuses.json"
import type { TaskWithRpaProcedure, TaskWithTiaProcedure } from "types";
import { Button } from "react-daisyui";
import { useTranslation } from "next-i18next";
import usePagination from "hooks/usePagination";
import { TailwindTableWrapper } from "sharedStyles";
import { config, headers, fieldPropsMapping, questions } from '@/components/defaultLanding/data/configs/tia';

const TiaTable = ({
  slug,
  tasks,
  perPage,
  editHandler,
  deleteHandler,
}: {
  slug: string;
  tasks: Array<TaskWithTiaProcedure>;
  perPage: number;
  editHandler: (task: TaskWithTiaProcedure) => void
  deleteHandler: (task: TaskWithTiaProcedure) => void
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
  } = usePagination<TaskWithTiaProcedure>(tasks, perPage);

  return (
    <>
      <TailwindTableWrapper>
        <div
          className="overflow-x-auto"
        >
          <table className="w-full table-fixed text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("tia")}
                </th>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("tia-data-exporter")}
                </th>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("tia-data-importer")}
                </th>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("tia-assessment-date")}
                </th>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("tia-ending-date")}
                </th>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("tia-egal-analysis")}
                </th>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("tia-transfer-is")}
                </th>
                <th scope="col" className="px-1.5 py-1.5">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((task, index) =>
                <tr key={index} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                  <td className="px-1.5 py-1.5">
                    <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                      <div className="flex items-center justify-start space-x-2">
                        <span className="underline">{task.title}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <span>{task.properties.tia_procedure[0].DataExporter}</span>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <span>{task.properties.tia_procedure[0].DataImporter}</span>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <Tag text={task.properties.tia_procedure[0].StartDateAssessment}/>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <Tag text={task.properties.tia_procedure[0].StartDateAssessment}/>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <span>{task.properties.tia_procedure[0].DataExporter}</span>
                  </td>
                  <td className="px-1.5 py-1.5">
                    <span>{task.properties.tia_procedure[0].LawImporterCountry.label}</span>
                  </td>
                  <td className="px-1.5 py-1.5">
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

export default TiaTable