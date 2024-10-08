import React, { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AtlaskitButton from '@atlaskit/button';
import type { ApiResponse, TeamCourseWithProgress } from 'types';
import { defaultHeaders } from '@/lib/common';
import CompletionResultsChart from './CompletionResultsChart';
import ProgressBadge from '../shared/ProgressBadge';

const CompletionResults = ({
    teamCourse,
    visible,
    setVisible,
}: {
    teamCourse: TeamCourseWithProgress
    visible: boolean;
    setVisible: (visible: boolean) => void;
}) => {
    const { t } = useTranslation('common');

    const router = useRouter();
    const { slug } = router.query;
    const [teamMembersWithProgress, setTeamMembersWithProgress] = useState<any | null>(null)

    const closeHandler = useCallback(() => {
        setVisible(false);
    }, []);

    useEffect(() => {
        const fetchCompletionResults = async () => {
            try {
                const response = await fetch(`/api/teams/${slug}/iap/course/${teamCourse.id}/completion-results`, {
                    method: 'GET',
                    headers: defaultHeaders,
                });

                const json = (await response.json()) as ApiResponse<any>;

                if (!response.ok) {
                    toast.error(json.error.message);
                    return;
                }

                setTeamMembersWithProgress(json.data.teamMembersWithProgress)
            } catch (e) {
                toast.error(t('iap-completion-results-failed'));
            }
        }

        fetchCompletionResults()
    }, [])

    return (
        <Modal open={visible} className='w-10/12 max-w-5xl'>
            <Modal.Header className="font-bold">
                {`Course Completion Results - ${teamCourse.course.name}`}
            </Modal.Header>
            <Modal.Body>
                <div className='grid grid-cols-2 gap-1'>
                    <div className='col-span-1 h-[300px]'>
                        {teamMembersWithProgress &&
                            <CompletionResultsChart
                                todo={teamMembersWithProgress.filter(({ progress }) => !progress || progress?.progress === 0).length}
                                inprogress={teamMembersWithProgress.filter(({ progress }) => progress && (progress.progress > 0 && progress.progress < 100)).length}
                                completed={teamMembersWithProgress.filter(({ progress }) => progress && progress.progress === 100).length}
                            />
                        }
                    </div>
                    <div className='col-span-1'>
                        <table className="text-sm table w-full border-b dark:border-base-200">
                            <thead className="bg-base-200">
                                <tr>
                                    <th>User</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembersWithProgress?.map((member: any) => {
                                    return (
                                        <tr key={member.id}>
                                            <td>{member?.user?.name}</td>
                                            <td>
                                                <ProgressBadge progress={member?.progress?.progress} />
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

export default CompletionResults;
