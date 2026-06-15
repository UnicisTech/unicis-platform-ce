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
import type { TeamCourseWithProgress, TeamMemberWithUserDto } from 'types';
import { getCourseStatus } from '../services/helpers';
import { StatusBadge } from '@/components/shared';
import { useTranslation } from 'next-i18next';

interface CoursesTableProps {
  slug: string;
  teamCourses: TeamCourseWithProgress[];
  members: TeamMemberWithUserDto[];
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
          <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
            <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 w-1/5">
              {t('name')}
            </TableHead>
            <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 w-2/5">
              {t('category')}
            </TableHead>
            <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 w-[15%]">
              {t('status')}
            </TableHead>
            <TableHead className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 w-1/4">
              {t('actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamCourses.map((teamCourse, idx) => {
            const status = getCourseStatus(teamCourse, members);
            const categoryName =
              categories.find((c) => c.id === teamCourse.course.categoryId)
                ?.name || '-';

            return (
              <TableRow
                key={`${teamCourse.course.name}-${idx}`}
                className="border-slate-100 dark:border-slate-700"
              >
                <TableCell className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {teamCourse.course.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {categoryName}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge
                    value={status}
                    label={t(`task-statuses.${status}`)}
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {canAccess('iap_course', ['create']) && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => editHandler(teamCourse)}
                        disabled={teamCourse.progress.length > 0}
                        aria-label={`${t('edit')} ${teamCourse.course.name}`}
                      >
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                    {canAccess('iap_course', ['delete']) && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteHandler(teamCourse)}
                        aria-label={`${t('delete')} ${teamCourse.course.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => completionHandler(teamCourse)}
                      aria-label={`${t('completion-results')} – ${teamCourse.course.name}`}
                    >
                      <BarChart2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => statusHandler(teamCourse)}
                      aria-label={`${t('status-results')} – ${teamCourse.course.name}`}
                    >
                      <TableIcon className="h-4 w-4" aria-hidden="true" />
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
