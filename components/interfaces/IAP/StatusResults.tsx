import React, { useState, useCallback, useEffect } from 'react';
import { getAxiosError } from '@/lib/common';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Modal } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AtlaskitButton, { LoadingButton } from '@atlaskit/button';
import Form from '@atlaskit/form';
import type { ApiResponse, IapCourse, TaskWithRpaProcedure, TeamCourseWithProgress } from 'types';
import type { Task } from '@prisma/client';
import { defaultHeaders } from '@/lib/common';
import CompletionResultsChart from './CompletionResultsChart';
import ProgressBadge from './ProgressBadge';
import { countCourseAnswers } from '@/lib/iap';
import { StatusBadge } from '@/components/shared';
import StatusResultsChart from './StatusREsultsChart';

const StatusResults = ({
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

                console.log('completion-results', json)

                if (!response.ok) {
                    toast.error(json.error.message);
                    return;
                }

                //TODO: rename state, we filter only completed, or change api enpoint

                setTeamMembersWithProgress(json.data.teamMembersWithProgress.filter(member => member?.progress?.progress === 100))



                // toast.success(t('iap-course-saved'));
                // mutateProgress();
            } catch (e) {
                //TODO: catch error
            } finally {
                // setIsSaving(false)

            }
        }

        fetchCompletionResults()
    }, [])

    //const { right, wrong } = countCourseAnswers(answers, course.questions)

    console.log('teamMembersWithProgress complted', teamMembersWithProgress)
    return (
        <Modal open={visible} className='w-10/12 max-w-5xl'>
            <Modal.Header className="font-bold">
                {`Course Completion Results - ${teamCourse.course.name}`}
            </Modal.Header>
            <Modal.Body>
                <div className='grid grid-cols-2 gap-1'>
                    <div className='col-span-1 h-[300px]'>
                        {/* //TODO: use different endpoint */}
                        {teamMembersWithProgress &&
                            <StatusResultsChart
                                passed={teamMembersWithProgress.filter(member => countCourseAnswers(member.progress.answers, teamCourse.course.questions)?.wrong === 0)?.length}
                                failed={teamMembersWithProgress.filter(member => countCourseAnswers(member.progress.answers, teamCourse.course.questions)?.wrong !== 0)?.length}
                            />
                        }
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
                                {teamMembersWithProgress?.map((member: any) => {
                                    const { right, wrong } = countCourseAnswers(member.progress.answers, teamCourse.course.questions)
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
                {/* <div style={{ margin: '1.5rem 0' }}>
                                
                            </div> */}
            </Modal.Body>
            <Modal.Actions>
                <AtlaskitButton
                    appearance="default"
                    onClick={() => closeHandler()}
                >
                    {t('close')}
                </AtlaskitButton>
                {/* <LoadingButton
                onClick={deleteCourse}
                appearance="primary"
                isLoading={isDeleting}
              >
                {t('delete')}
              </LoadingButton> */}
            </Modal.Actions>

        </Modal>
    );
};

export default StatusResults;
