import { Button } from "@/components/shadcn/ui/button";
import { Edit2, Trash2, BarChart2, Table as TableIcon } from "lucide-react";
import useCanAccess from "hooks/useCanAccess";
import { TeamCourseWithProgress, TeamMemberWithUser } from "types";
import { getCourseStatus } from "../services/helpers";
import { StatusBadge } from "@/components/shared";

const statusBadges = {
  todo: <StatusBadge label="To do" value="todo" />,
  inprogress: <StatusBadge label="In progress" value="inprogress" />,
  done: <StatusBadge label="Completed" value="done" />,
};

interface CoursesTableProps {
  teamCourses: TeamCourseWithProgress[];
  members: TeamMemberWithUser[];
  categories: { id: string; name: string }[];
  editHandler: (course: TeamCourseWithProgress) => void;
  deleteHandler: (course: TeamCourseWithProgress) => void;
  completionHandler: (course: TeamCourseWithProgress) => void;
  statusHandler: (teamCourse: TeamCourseWithProgress) => void;
}

const CoursesTable: React.FC<CoursesTableProps> = ({
  teamCourses,
  members,
  categories,
  editHandler,
  deleteHandler,
  completionHandler,
  statusHandler,
}) => {
  const { canAccess } = useCanAccess();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="w-1/5 px-4 py-2 text-left">Name</th>
            <th className="w-2/5 px-4 py-2 text-left">Category</th>
            <th className="w-[15%] px-4 py-2 text-left">Status</th>
            <th className="w-1/4 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {teamCourses.map((teamCourse, idx) => {
            const status = getCourseStatus(teamCourse, members);
            const categoryName = categories.find(
              (c) => c.id === teamCourse.course.categoryId
            )?.name;

            return (
              <tr key={`${teamCourse.course.name}-${idx}`}>
                <td className="px-4 py-2">{teamCourse.course.name}</td>
                <td className="px-4 py-2">{categoryName || "-"}</td>
                <td className="px-4 py-2">{statusBadges[status]}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {canAccess("iap_course", ["create"]) && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => editHandler(teamCourse)}
                        disabled={teamCourse.progress.length > 0}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {canAccess("iap_course", ["delete"]) && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteHandler(teamCourse)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => completionHandler(teamCourse)}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => statusHandler(teamCourse)}
                    >
                      <TableIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesTable;
