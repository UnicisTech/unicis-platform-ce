import React from 'react';
import Link from 'next/link';
import type { TaskWithRmRisk } from 'types';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import usePagination from 'hooks/usePagination';
import { TailwindTableWrapper } from 'sharedStyles';
import useCanAccess from 'hooks/useCanAccess';

const verticalTextStyles =
    "px-1.5 py-1.5 whitespace-nowrap align-middle text-center [writing-mode:vertical-rl] rotate-180";

const calculateRiskRating = (probability: number, impact: number) => {
    const result = (probability / 100) * (impact / 100);
    return Math.floor(result * 100);
}

const calculateCurrentRiskRating = (rawRiskRating: number, targetRiskRating: number, treatmentStatus: number) => {
    const decimalTreatmentStatus = treatmentStatus / 100 // 50% -> 0.5
    const result = rawRiskRating - (decimalTreatmentStatus * (rawRiskRating - targetRiskRating))
    return Math.floor(result)
}

const getGradientColor = (value: number): string => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));

    // Interpolate between green (0, 255, 0) and red (255, 0, 0)
    const red = Math.floor((clampedValue / 100) * 255);
    const green = 255 - red;

    return `rgb(${red}, ${green}, 0)`;
};

const getInitials = (name: string) => {
    const words = name.trim().split(" ");

    const initials = words
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase())
        .join("");

    return initials;
}

const RisksTable = ({
    slug,
    tasks,
    perPage,
    editHandler,
    deleteHandler,
}: {
    slug: string;
    tasks: Array<TaskWithRmRisk>;
    perPage: number;
    editHandler: (task: TaskWithRmRisk) => void;
    deleteHandler: (task: TaskWithRmRisk) => void;
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
    } = usePagination<TaskWithRmRisk>(tasks, perPage);

    return (
        <>
            <TailwindTableWrapper>
                <div className="overflow-x-auto">
                    <table className="text-sm table w-full border-b dark:border-base-200">
                        <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-1.5 py-1.5">
                                    Risk ID
                                </th>
                                <th>
                                    Risk
                                </th>
                                <th className={verticalTextStyles}>
                                    Asset Owner
                                </th>
                                <th>
                                    Impact
                                </th>
                                <th className={verticalTextStyles}>
                                    Raw probabiltity
                                </th>
                                <th className={verticalTextStyles}>
                                    Raw impact
                                </th>
                                <th className={verticalTextStyles}>
                                    Raw risk rating
                                </th>
                                <th>
                                    Treatment
                                </th>
                                <th className={verticalTextStyles}>
                                    Treatment cost
                                </th>
                                <th className={verticalTextStyles}>
                                    Treatment status
                                </th>
                                <th className={verticalTextStyles}>
                                    Treated probability
                                </th>
                                <th className={verticalTextStyles}>
                                    Treated impact
                                </th>
                                <th className={verticalTextStyles}>
                                    Targer risk rating
                                </th>
                                <th className={verticalTextStyles}>
                                    Current risk rating
                                </th>
                                {canAccess('task', ['update']) && (
                                    <th scope="col" className="px-1.5 py-1.5">
                                        {t('actions')}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map((task, index) => {
                                const risk = task.properties.rm_risk
                                const rawRiskRating = calculateRiskRating(risk[0].RawProbability, risk[0].RawImpact)
                                const targetRiskRating = calculateRiskRating(risk[1].TreatedProbability, risk[1].TreatedImpact)
                                const currentRiskRating = calculateCurrentRiskRating(rawRiskRating, targetRiskRating, risk[1].TreatmentStatus)
                                
                                return (
                                    <tr
                                        key={index}
                                        className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                                    >
                                        <td>
                                            <Link href={`/teams/${slug}/tasks/${task.taskNumber}`}>
                                                <div className="flex items-center justify-start space-x-2">
                                                    <span className="underline">{task.title}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td>
                                            <span>{risk[0].Risk}</span>
                                        </td>
                                        <td>
                                            <span>{getInitials(risk[0].AssetOwner.label)}</span>
                                        </td>
                                        <td>
                                            <span>{risk[0].Impact}</span>
                                        </td>
                                        <td>
                                            <span>{risk[0].RawProbability}%</span>
                                        </td>
                                        <td>
                                            <span>{risk[0].RawImpact}%</span>
                                        </td>
                                        <td style={{backgroundColor: getGradientColor(rawRiskRating)}}>
                                            {rawRiskRating}%
                                        </td>
                                        <td>
                                            {risk[1].RiskTreatment}
                                        </td>
                                        <td>
                                            {risk[1].TreatmentCost}
                                        </td>
                                        <td>
                                            {risk[1].TreatmentStatus}%
                                        </td>
                                        <td>
                                            {risk[1].TreatedProbability}%
                                        </td>
                                        <td>
                                            {risk[1].TreatedImpact}%
                                        </td>
                                        <td style={{ backgroundColor: getGradientColor(targetRiskRating)}}>
                                            {targetRiskRating}%
                                        </td>
                                        <td style={{ backgroundColor: getGradientColor(currentRiskRating)}}>
                                            {currentRiskRating}%
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
                                )
                            })}
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