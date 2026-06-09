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

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('iap-dashboard')}
          </h2>
        </div>
      </div>
      {teamCourses.length > 0 ? (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] p-6">
          {teamCourses.map((teamCourse) => (
            <CourseCard
              teamCourse={teamCourse}
              categories={categories}
              key={teamCourse.id}
            />
          ))}
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
