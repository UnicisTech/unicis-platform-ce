import React from 'react';
import { useTranslation } from 'next-i18next';
import { Category } from '@prisma/client';
import { TeamCourseWithProgress } from 'types';
import CourseCard from './CourseCard';
import EmptyState from '@/components/shared/EmptyState';

interface IapDashboardProps {
  categories: Category[];
  teamCourses: TeamCourseWithProgress[];
}

const IapDashboard = ({ categories, teamCourses }: IapDashboardProps) => {
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
        <div className="p-6">
          <EmptyState title={t('iap-dashboard')} description="No records" />
        </div>
      )}
    </>
  );
};

export default IapDashboard;
