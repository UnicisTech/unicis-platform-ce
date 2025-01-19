import React from 'react';
import Link from 'next/link';
import { SimpleTag as Tag } from '@atlaskit/tag';
import statuses from '@/components/defaultLanding/data/statuses.json';
import type { TaskWithPiaRisk } from 'types';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import { TailwindTableWrapper } from 'sharedStyles';
import { StatusBadge } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import Badge from '@/components/shared/Badge';
import { riskProbabilityPoints, riskSecurityPoints } from '@/components/defaultLanding/data/configs/pia';

const toPercentage = (input: number): string => {
    const percentage = (input / 25) * 100;
    return `${percentage.toFixed(0)}%`;
}

const RisksTable = ({
    slug,
    tasks,
    perPage,
    editHandler,
    deleteHandler,
}: {
    slug: string;
    tasks: Array<TaskWithPiaRisk>;
    perPage: number;
    editHandler: (task: TaskWithPiaRisk) => void;
    deleteHandler: (task: TaskWithPiaRisk) => void;
}) => {
    const { canAccess } = useCanAccess();
    const { t } = useTranslation('common');
    const {
        currentPage,
        totalPages,
        pageData,
        goToPreviousPage,
        goToNextPage,
        prevButtonDisabled,
        nextButtonDisabled,
    } = usePagination<TaskWithPiaRisk>(tasks, perPage);

    return (
        <>
            <TailwindTableWrapper>
                <div className="overflow-x-auto">
                    <table className="text-sm table w-full border-b dark:border-base-200">
                        <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-1.5 py-1.5">
                                    {t('rpa')}
                                </th>
                                <th scope="col" className="px-1.5 py-1.5">
                                    {t('status')}
                                </th>
                                <th scope="col" className="px-1.5 py-1.5">
                                    Confidentiality and Integrity
                                </th>
                                <th scope="col" className="px-1.5 py-1.5">
                                    Availability
                                </th>
                                <th scope="col" className="px-1.5 py-1.5">
                                    Transparency and data minimization
                                </th>
                                {canAccess('task', ['update']) && (
                                    <th scope="col" className="px-1.5 py-1.5">
                                        {t('actions')}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map((task, index) => (
                                <tr
                                    key={index}
                                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                                >
                                    <td className="px-1.5 py-1.5">
                                        <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                                            <div className="flex items-center justify-start space-x-2">
                                                <span className="underline">{task.title}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                        <StatusBadge
                                            label={
                                                statuses.find(({ value }) => value === task.status)
                                                    ?.label as string
                                            }
                                            value={task.status}
                                        />
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                        {toPercentage(
                                            riskProbabilityPoints[task.properties.pia_risk[1].confidentialityRiskProbability] *
                                            riskSecurityPoints[task.properties.pia_risk[1].confidentialityRiskSecurity]
                                        )}
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                        {toPercentage(
                                            riskProbabilityPoints[task.properties.pia_risk[2].availabilityRiskProbability] *
                                            riskSecurityPoints[task.properties.pia_risk[2].availabilityRiskSecurity]
                                        )}
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                        {toPercentage(
                                            riskProbabilityPoints[task.properties.pia_risk[3].transparencyRiskProbability] *
                                            riskSecurityPoints[task.properties.pia_risk[3].transparencyRiskSecurity]
                                        )}
                                    </td>
                                    {canAccess('task', ['update']) && (
                                        <td className="px-1.5 py-1.5">
                                            <div className="btn-group">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        editHandler(task);
                                                    }}
                                                >
                                                    {t('edit-task')}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        deleteHandler(task);
                                                    }}
                                                >
                                                    {t('delete')}
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pageData.length ? (
                    <div className="flex justify-center w-30">
                        <div className="btn-group join grid grid-cols-10">
                            <button
                                className="join-item btn btn-outline col-span-4"
                                onClick={goToPreviousPage}
                                disabled={prevButtonDisabled}
                            >
                                Previous page
                            </button>
                            <button className="join-item btn btn-outline col-span-2">{`${currentPage}/${totalPages}`}</button>
                            <button
                                className="join-item btn btn-outline col-span-4"
                                onClick={goToNextPage}
                                disabled={nextButtonDisabled}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                ) : null}
            </TailwindTableWrapper>
        </>
    );
};

export default RisksTable;