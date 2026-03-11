import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Edit2, Trash2, BarChart2, Table as TableIcon } from 'lucide-react';
import useCanAccess from 'hooks/useCanAccess';
import { TeamCourseWithProgress, TeamMemberWithUser } from 'types';
import { getCourseStatus } from '../services/helpers';
import { StatusBadge } from '@/components/shared';
import { useTranslation } from 'next-i18next';

interface CoursesTableProps {
  slug: string;
  teamCourses: TeamCourseWithProgress[];
  members: TeamMemberWithUser[];
  categories: { id: string; name: string }[];
  editHandler: (course: TeamCourseWithProgress) => void;
  deleteHandler: (course: TeamCourseWithProgress) => void;
  completionHandler: (course: TeamCourseWithProgress) => void;
  statusHandler: (teamCourse: TeamCourseWithProgress) => void;
}

const CoursesTable: React.FC<CoursesTableProps> = ({
  slug,
  teamCourses,
  members,
  categories,
  editHandler,
  deleteHandler,
  completionHandler,
  statusHandler,
}) => {
  const { canAccess } = useCanAccess(slug);
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">{t('name')}</TableHead>
            <TableHead className="w-2/5">{t('category')}</TableHead>
            <TableHead className="w-[15%]">{t('status')}</TableHead>
            <TableHead className="w-1/4">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamCourses.map((teamCourse, idx) => {
            const status = getCourseStatus(teamCourse, members);
            const categoryName =
              categories.find((c) => c.id === teamCourse.course.categoryId)
                ?.name || '-';

            return (
              <TableRow key={`${teamCourse.course.name}-${idx}`}>
                <TableCell>{teamCourse.course.name}</TableCell>
                <TableCell>{categoryName}</TableCell>
                <TableCell>
                  <StatusBadge
                    value={status}
                    label={t(`task-statuses.${status}`)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    {canAccess('iap_course', ['create']) && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => editHandler(teamCourse)}
                        disabled={teamCourse.progress.length > 0}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {canAccess('iap_course', ['delete']) && (
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CoursesTable;
