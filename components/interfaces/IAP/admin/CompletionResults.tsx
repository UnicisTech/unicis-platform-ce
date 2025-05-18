import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import AtlaskitButton from '@atlaskit/button';
import type { TeamCourseWithProgress, TeamMemberWithUser } from 'types';
import CompletionResultsChart from './CompletionResultsChart';
import ProgressBadge from '../shared/ProgressBadge';
import { findMemberProgressInTeamCourse } from '../services/helpers';
import DaisyModal from '@/components/shared/daisyUI/DaisyModal';

const getMemberProgress = (
  teamCourse: TeamCourseWithProgress,
  memberId: string
): number =>
  findMemberProgressInTeamCourse(teamCourse, memberId)?.progress || 0;

const CompletionResults = ({
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
    <DaisyModal open={visible} className="w-10/12 max-w-5xl">
      <DaisyModal.Header className="font-bold">
        {`Course Completion Results - ${teamCourse.course.name}`}
      </DaisyModal.Header>
      <DaisyModal.Body>
        <div className="grid grid-cols-2 gap-1">
          <div className="col-span-1 h-[300px]">
            <CompletionResultsChart
              todo={
                members.filter(
                  ({ id }) => getMemberProgress(teamCourse, id) === 0
                ).length
              }
              inprogress={
                members.filter(({ id }) => {
                  const progress = getMemberProgress(teamCourse, id);
                  return progress > 0 && progress < 100;
                }).length
              }
              completed={
                members.filter(
                  ({ id }) => getMemberProgress(teamCourse, id) === 100
                ).length
              }
            />
          </div>
          <div className="col-span-1">
            <table className="text-sm table w-full border-b dark:border-base-200">
              <thead className="bg-base-200">
                <tr>
                  <th>User</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  return (
                    <tr key={member.id}>
                      <td>{member?.user?.name}</td>
                      <td>
                        <ProgressBadge
                          progress={getMemberProgress(teamCourse, member.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DaisyModal.Body>
      <DaisyModal.Actions>
        <AtlaskitButton appearance="default" onClick={() => closeHandler()}>
          {t('close')}
        </AtlaskitButton>
      </DaisyModal.Actions>
    </DaisyModal>
  );
};

export default CompletionResults;
