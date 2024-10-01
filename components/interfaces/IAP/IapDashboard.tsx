import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import useCanAccess from 'hooks/useCanAccess';
import CreateIapCategory from './CreateCategory';
import { Category, Course, Team } from '@prisma/client';
import { IapCourse, TeamProperties, IapCourseWithProgress, TeamCourseWithProgress } from 'types';
import { defaultCategories } from '@/lib/iap';
import CreateCourse from './CreateCourse';
import CourseCard from './CourseCard';
import CoursesTable from './CoursesTable';
import DeleteCourse from './DeleteCourse';


interface IapDashboardProps {
  categories: Category[];
  teamCourses: TeamCourseWithProgress[];
  team: Team;
} 

const IapDashboard = ({ categories, teamCourses, team }: IapDashboardProps) => {
  console.log('team', team)
  const { t } = useTranslation('common');

  console.log('categories and courses', { categories, teamCourses })
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('iap-dashboard')}
          </h2>
        </div>
      </div>
      <div className="grid gap-5 grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] p-6">
        {teamCourses.map(teamCourse => <CourseCard teamCourse={teamCourse} categories={categories} />)}
      </div>
    </>
  )
}

export default IapDashboard
