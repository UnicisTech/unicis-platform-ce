import React from 'react';
import { useTranslation } from 'next-i18next';
import { Category } from '@prisma/client';
import { TeamCourseWithProgress } from 'types';
import CourseCard from './CourseCard';

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
      <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(350px,1fr))] p-6">
        {teamCourses.map((teamCourse) => (
          <CourseCard
            teamCourse={teamCourse}
            categories={categories}
            key={teamCourse.id}
          />
        ))}
      </div>
    </>
  );
};

export default IapDashboard;
