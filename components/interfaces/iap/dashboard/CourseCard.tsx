import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import type { Category } from 'types';
import { TeamCourseWithProgress } from 'types';
import ProgressBadge from '../shared/ProgressBadge';
import { cn } from '@/components/shadcn/lib/utils';
import { Clock } from 'lucide-react';

const CourseCard = ({
  teamCourse,
  categories,
}: {
  teamCourse: TeamCourseWithProgress;
  categories: Category[];
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const openCourse = () => {
    router.push(`${router.asPath}/${teamCourse.id}`);
  };

  const course = teamCourse.course;
  const progress = teamCourse.progress?.[0]?.progress ?? 0;
  const categoryName =
    categories.find(({ id }) => id === course.categoryId)?.name || '';

  return (
    <div
      onClick={openCourse}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openCourse()}
      className={cn(
        'bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer',
        'hover:border-ub-blue-border hover:shadow-sm transition-all'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-slate-100">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src={course?.thumbnail || '/unicis-iap-logo.png'}
          alt={t('course-thumbnail')}
        />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Category chip */}
        {categoryName && (
          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-ub-blue-bg text-ub-blue-text border border-ub-blue-border">
            {categoryName}
          </span>
        )}

        {/* Title */}
        <h3 className="text-[13px] font-medium text-slate-900 leading-snug line-clamp-2">
          {course.name}
        </h3>

        {/* Progress + time row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <ProgressBadge progress={progress} />
          {course?.estimatedTime && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock size={10} aria-hidden />
              {t('estimated-minutes', { time: course.estimatedTime })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
