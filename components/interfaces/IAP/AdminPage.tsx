import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import useCanAccess from 'hooks/useCanAccess';
import { Category, Course, Team } from '@prisma/client';
import { IapCourse, TeamProperties, IapCourseWithProgress, TeamCourseWithProgress } from 'types';
import { CompletionResults, CoursesTable, DeleteCourse, CreateCourse, CreateCategory } from "@/components/interfaces/IAP"
import StatusResults from './StatusResults';

interface IapDashboardProps {
  categories: Category[];
  teamCourses: TeamCourseWithProgress[];
  team: Team;
  teams: Team[];
  mutateIap: () => Promise<void>;
}

const AdminPage = ({ categories, teamCourses, team, teams, mutateIap }: IapDashboardProps) => {
  console.log('team', team)
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  // const teamProperties = team.properties as TeamProperties

  // const [categories, setCategories] = useState(teamProperties.iap_categories || defaultCategories)
  // const [courses, setCourses] = useState(teamProperties.iap_courses || [])

  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false)
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false)
  const [isCompletionResultsOpen, setIsCompletionResultsOpen] = useState(false)
  const [isStatusResultsOpen, setIsStatusResultsOpen] = useState(false)


  const [courseToEdit, setCourseToEdit] = useState<TeamCourseWithProgress | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<TeamCourseWithProgress | null>(null)
  const [courseToCompletionResults, setCourseToCompletionResults] = useState<TeamCourseWithProgress | null>(null)
  const [courseToStatusResults, setCourseToStatusResults] = useState<TeamCourseWithProgress | null>(null)

  console.log('courseToEdit', courseToEdit)

  const editCourseClickHandler = useCallback((teamCourse: TeamCourseWithProgress) => {
    setCourseToEdit(teamCourse)
    setIsCreateCourseOpen(true)
  }, [])

  const deleteCourseClickHandler = useCallback((teamCourse: TeamCourseWithProgress) => {
    setCourseToDelete(teamCourse)
    setIsDeleteCourseOpen(true)
  }, [])

  const completionResultsClickHandler = useCallback((teamCourse: TeamCourseWithProgress) => {
    setCourseToCompletionResults(teamCourse)
    setIsCompletionResultsOpen(true)
  }, [])

  const statusResultsClickHandler = useCallback((teamCourse: TeamCourseWithProgress) => {
    setCourseToStatusResults(teamCourse)
    setIsStatusResultsOpen(true)
  }, [])

  console.log('Admin page', {isCreateCourseOpen})


  console.log('categories and courses', { categories, teamCourses })
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('iap-dashboard')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage courses and categories.
          </p>
        </div>
        <div className="flex justify-end items-center my-1">

          {canAccess('iap', ['create']) && (
            <>
              <div className="mx-1.5 my-0">
                <Button
                  size="sm"
                  color="primary"
                  variant="outline"
                  onClick={() => {
                    setIsCreateCategoryOpen(true);
                  }}
                >
                  {t('create-category')}
                </Button>
              </div>
              <div className="mx-1.5 my-0">
                <Button
                  size="sm"
                  color="primary"
                  variant="outline"
                  onClick={() => {
                    setIsCreateCourseOpen(true);
                  }}
                >
                  {t('create-course')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <CoursesTable
        teamCourses={teamCourses}
        categories={categories}
        editHandler={editCourseClickHandler}
        deleteHandler={deleteCourseClickHandler}
        completionHandler={completionResultsClickHandler}
        statusHandler={statusResultsClickHandler}
      />

      {isCreateCategoryOpen &&
        <CreateCategory
          teamSlug={team.slug}
          visible={isCreateCategoryOpen}
          setVisible={setIsCreateCategoryOpen}
          mutate={mutateIap}
        />
      }
      {isCreateCourseOpen &&
        <CreateCourse
          teams={teams}
          categories={categories}
          teamSlug={team.slug}
          visible={isCreateCourseOpen}
          setIsVisible={setIsCreateCourseOpen}
          setCourseToEdit={setCourseToEdit}
          mutate={mutateIap}
          selectedTeamCourse={courseToEdit || null}
        />
      }
      {isDeleteCourseOpen && courseToDelete &&
        <DeleteCourse
          visible={isDeleteCourseOpen}
          setVisible={setIsDeleteCourseOpen}
          teamCourse={courseToDelete}
          mutate={mutateIap}
        />
      }
      {isCompletionResultsOpen && courseToCompletionResults &&
        <CompletionResults
          teamCourse={courseToCompletionResults}
          visible={isCompletionResultsOpen}
          setVisible={setIsCompletionResultsOpen}
        />
      }
      {isStatusResultsOpen && courseToStatusResults &&
        <StatusResults
          teamCourse={courseToStatusResults}
          visible={isStatusResultsOpen}
          setVisible={setIsStatusResultsOpen}
        />
      }
    </>
  )
}

export default AdminPage
