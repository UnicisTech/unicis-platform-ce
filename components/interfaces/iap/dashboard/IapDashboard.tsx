import React from 'react';
import { useTranslation } from 'next-i18next';
import type { Category } from 'types';
import { TeamCourseWithProgress } from 'types';
import CourseCard from './CourseCard';
import { ModuleEmptyState } from '@/components/shared/ModuleEmptyState';

interface IapDashboardProps {
  categories: Category[];
  teamCourses: TeamCourseWithProgress[];
  onAddCourse?: () => void;
}

const IapDashboard = ({ categories, teamCourses, onAddCourse }: IapDashboardProps) => {
  const { t } = useTranslation('common');

  // ── Completion summary (current user's progress across all courses) ─────────
  const total = teamCourses.length;
  const completed = teamCourses.filter(
    (tc) => (tc.progress?.[0]?.progress ?? 0) >= 100
  ).length;
  const inProgress = teamCourses.filter((tc) => {
    const p = tc.progress?.[0]?.progress ?? 0;
    return p > 0 && p < 100;
  }).length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      {teamCourses.length > 0 ? (
        <div className="space-y-5">
          {/* Module heading */}
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{t('iap')}</h1>
            <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{total}</span>
          </div>

          {/* Completion summary banner */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Progress bar + label */}
              <div className="flex-1 min-w-[160px]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                    {t('iap:completion-progress', 'Your completion')}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                    {completionPct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-ub-blue transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="text-center">
                  <div className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 leading-none">
                    {total}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t('iap:total-courses', 'Total')}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <div className="text-[20px] font-semibold text-emerald-600 dark:text-emerald-400 leading-none">
                    {completed}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t('iap:completed', 'Completed')}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <div className="text-[20px] font-semibold text-amber-500 dark:text-amber-400 leading-none">
                    {inProgress}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t('iap:in-progress', 'In progress')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamCourses.map((teamCourse) => (
              <CourseCard
                teamCourse={teamCourse}
                categories={categories}
                key={teamCourse.id}
              />
            ))}
          </div>
        </div>
      ) : (
        <ModuleEmptyState
          icon="/unicis-iap-logo.png"
          title={t('empty-state.iap.title')}
          description={t('empty-state.iap.description')}
          regulatoryContext={t('empty-state.iap.context')}
          ctaLabel={onAddCourse ? t('empty-state.iap.cta') : undefined}
          onCta={onAddCourse}
        />
      )}
    </>
  );
};

export default IapDashboard;
