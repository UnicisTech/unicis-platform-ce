import React, { useCallback, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import type { TeamCourseWithProgress, TeamMemberWithUser } from "types";
import { countCourseAnswers } from "@/lib/iap";
import { StatusBadge } from "@/components/shared";
import StatusResultsChart from "./StatusResultsChart";
import { findMemberProgressInTeamCourse } from "../services/helpers";

interface StatusResultsProps {
  teamCourse: TeamCourseWithProgress;
  members: TeamMemberWithUser[];
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const StatusResults: React.FC<StatusResultsProps> = ({
  teamCourse,
  members,
  visible,
  setVisible,
}) => {
  const { t } = useTranslation("common");

  const closeHandler = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const { passedCount, failedCount } = useMemo(() => {
    let passed = 0;
    let failed = 0;

    members.forEach((member) => {
      const progress = findMemberProgressInTeamCourse(teamCourse, member.id);
      if (progress?.progress === 100) {
        const { wrong } = countCourseAnswers(
          progress.answers as any[],
          teamCourse.course.questions
        );
        if (wrong === 0) {
          passed += 1;
        } else {
          failed += 1;
        }
      }
    });

    return { passedCount: passed, failedCount: failed };
  }, [members, teamCourse]);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="w-10/12 max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {`Course Status Results - ${teamCourse.course.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="h-[300px]">
            <StatusResultsChart passed={passedCount} failed={failedCount} />
          </div>

          <div>
            <table className="w-full text-sm divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Right</th>
                  <th className="px-4 py-2 text-left">Wrong</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => {
                  const progress = findMemberProgressInTeamCourse(
                    teamCourse,
                    member.id
                  );
                  if (progress?.progress !== 100) return null;

                  const { right, wrong } = countCourseAnswers(
                    progress.answers as any[],
                    teamCourse.course.questions
                  );

                  return (
                    <tr key={member.id}>
                      <td className="px-4 py-2">{member.user?.name}</td>
                      <td className="px-4 py-2">{right}</td>
                      <td className="px-4 py-2">{wrong}</td>
                      <td className="px-4 py-2">
                        {!wrong ? (
                          <StatusBadge label="Passed" value="done" />
                        ) : (
                          <StatusBadge label="Failed" value="failed" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={closeHandler}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusResults;
