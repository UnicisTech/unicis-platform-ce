import React, { useCallback } from 'react';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import AtlaskitButton from '@atlaskit/button';
import type { TeamCourseWithProgress, TeamMemberWithUser } from 'types';
import { countCourseAnswers } from '@/lib/iap';
import { StatusBadge } from '@/components/shared';
import StatusResultsChart from './StatusResultsChart';
import { findMemberProgressInTeamCourse } from '../services/helpers';

const StatusResults = ({
    teamCourse,
    members,
    visible,
    setVisible,
}: {
    teamCourse: TeamCourseWithProgress;
    members: TeamMemberWithUser[];
    visible: boolean;
    setVisible: (visible: boolean) => void;
}) => {
    const { t } = useTranslation('common');

    const closeHandler = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <Modal open={visible} className='w-10/12 max-w-5xl'>
            <Modal.Header className="font-bold">
                {`Course Completion Results - ${teamCourse.course.name}`}
            </Modal.Header>
            <Modal.Body>
                <div className='grid grid-cols-2 gap-1'>
                    <div className='col-span-1 h-[300px]'>
                        <StatusResultsChart
                            passed={members.filter(member => {
                                const progress = findMemberProgressInTeamCourse(teamCourse, member.id)
                                if (!progress || progress?.progress !== 100) return false

                                return countCourseAnswers(
                                    progress.answers as any[],
                                    teamCourse.course.questions
                                )?.wrong === 0
                            }).length}
                            failed={members.filter(member => {
                                const progress = findMemberProgressInTeamCourse(teamCourse, member.id)
                                if (!progress || progress?.progress !== 100) return false

                                return countCourseAnswers(
                                    progress.answers as any[],
                                    teamCourse.course.questions
                                )?.wrong !== 0
                            }).length}
                        />
                    </div>
                    <div className='col-span-1'>
                        <table className="text-sm table w-full border-b dark:border-base-200">
                            <thead className="bg-base-200">
                                <tr>
                                    <th>User</th>
                                    <th>Right</th>
                                    <th>Wrong</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => {
                                    const progress = findMemberProgressInTeamCourse(teamCourse, member.id)

                                    if (progress?.progress !== 100) return null

                                    const { right, wrong } = countCourseAnswers(progress.answers as any[], teamCourse.course.questions)
                                    
                                    return (
                                        <tr key={member.id}>
                                            <td>{member?.user?.name}</td>
                                            <td>{right}</td>
                                            <td>{wrong}</td>
                                            <td>
                                                {!wrong
                                                    ? <StatusBadge label='Passed' value='done' />
                                                    : <StatusBadge label='Failed' value='failed' />
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Actions>
                <AtlaskitButton
                    appearance="default"
                    onClick={() => closeHandler()}
                >
                    {t('close')}
                </AtlaskitButton>
            </Modal.Actions>
        </Modal>
    );
};

export default StatusResults;
