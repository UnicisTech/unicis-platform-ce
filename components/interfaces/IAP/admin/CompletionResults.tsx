import * as React from 'react';
import { useTranslation } from 'next-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import type { TeamCourseWithProgress, TeamMemberWithUser } from 'types';
import CompletionResultsChart from './CompletionResultsChart';
import ProgressBadge from '../shared/ProgressBadge';
import { findMemberProgressInTeamCourse } from '../services/helpers';

const getMemberProgress = (
  teamCourse: TeamCourseWithProgress,
  memberId: string
): number =>
  findMemberProgressInTeamCourse(teamCourse, memberId)?.progress || 0;

interface CompletionResultsProps {
  teamCourse: TeamCourseWithProgress;
  members: TeamMemberWithUser[];
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export default function CompletionResults({
  teamCourse,
  members,
  visible,
  setVisible,
}: CompletionResultsProps) {
  const { t } = useTranslation('common');

  const todoCount = members.filter(
    ({ id }) => getMemberProgress(teamCourse, id) === 0
  ).length;
  const inProgressCount = members.filter(({ id }) => {
    const p = getMemberProgress(teamCourse, id);
    return p > 0 && p < 100;
  }).length;
  const completedCount = members.filter(
    ({ id }) => getMemberProgress(teamCourse, id) === 100
  ).length;

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>
            {t('course-completion-results', 'Course Completion Results')} -{' '}
            {teamCourse.course.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="h-72">
            <CompletionResultsChart
              todo={todoCount}
              inprogress={inProgressCount}
              completed={completedCount}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">{t('user', 'User')}</th>
                  <th className="px-4 py-2 text-left">
                    {t('status', 'Status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const progress = getMemberProgress(teamCourse, member.id);
                  return (
                    <tr key={member.id} className="border-t">
                      <td className="px-4 py-2">{member.user?.name}</td>
                      <td className="px-4 py-2">
                        <ProgressBadge progress={progress} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">{t('close', 'Close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
