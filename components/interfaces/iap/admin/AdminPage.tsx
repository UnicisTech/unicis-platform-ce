import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import useCanAccess from 'hooks/useCanAccess';
import type {
  Category,
  Team,
  TeamCourseWithProgress,
  TeamMemberWithUserDto,
} from 'types';
import {
  CompletionResults,
  CoursesTable,
  CreateCourse,
  CreateCategory,
} from '@/components/interfaces/iap';
import StatusResults from './StatusResults';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Button } from '@/components/shadcn/ui/button';

interface IapDashboardProps {
  categories: Category[];
  teamCourses: TeamCourseWithProgress[];
  team: Team;
  teams: Team[];
  members: TeamMemberWithUserDto[];
  mutateIap: () => Promise<void>;
}

const AdminPage = ({
  categories,
  teamCourses,
  team,
  teams,
  members,
  mutateIap,
}: IapDashboardProps) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [isCompletionResultsOpen, setIsCompletionResultsOpen] = useState(false);
  const [isStatusResultsOpen, setIsStatusResultsOpen] = useState(false);

  const [courseToEdit, setCourseToEdit] =
    useState<TeamCourseWithProgress | null>(null);
  const [courseToDelete, setCourseToDelete] =
    useState<TeamCourseWithProgress | null>(null);
  const [courseToCompletionResults, setCourseToCompletionResults] =
    useState<TeamCourseWithProgress | null>(null);
  const [courseToStatusResults, setCourseToStatusResults] =
    useState<TeamCourseWithProgress | null>(null);

  const editCourseClickHandler = useCallback(
    (teamCourse: TeamCourseWithProgress) => {
      setCourseToEdit(teamCourse);
      setIsCreateCourseOpen(true);
    },
    []
  );

  const deleteCourseClickHandler = useCallback(
    (teamCourse: TeamCourseWithProgress) => {
      setCourseToDelete(teamCourse);
      setIsDeleteCourseOpen(true);
    },
    []
  );

  const completionResultsClickHandler = useCallback(
    (teamCourse: TeamCourseWithProgress) => {
      setCourseToCompletionResults(teamCourse);
      setIsCompletionResultsOpen(true);
    },
    []
  );

  const statusResultsClickHandler = useCallback(
    (teamCourse: TeamCourseWithProgress) => {
      setCourseToStatusResults(teamCourse);
      setIsStatusResultsOpen(true);
    },
    []
  );

  const deleteCourse = useCallback(async () => {
    if (!courseToDelete) return;

    try {
      const res = await fetch(
        `/api/teams/${team.slug}/iap/course/${courseToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      const { error } = await res.json();
      if (!res.ok || error)
        return toast.error(error?.message || t('errors.requestFailed'));

      toast.success(t('iap-course-deleted'));
      mutateIap();
    } catch {
      toast.error(t('errors.somethingWentWrong'));
    }
  }, [team.slug, courseToDelete, mutateIap, t]);

  return (
    <>
      <div className="flex justify-end items-center gap-2 mb-4 flex-wrap">
          {canAccess('iap_category', ['create']) && (
            <Button
              variant="default"
              onClick={() => {
                setIsCreateCategoryOpen(true);
              }}
            >
              {t('create-category')}
            </Button>
          )}
          {canAccess('iap_course', ['create']) && (
            <Button
              variant="default"
              onClick={() => {
                setIsCreateCourseOpen(true);
              }}
            >
              {t('create-course')}
            </Button>
          )}
      </div>
      <CoursesTable
        slug={team.slug}
        teamCourses={teamCourses}
        members={members}
        categories={categories}
        editHandler={editCourseClickHandler}
        deleteHandler={deleteCourseClickHandler}
        completionHandler={completionResultsClickHandler}
        statusHandler={statusResultsClickHandler}
      />

      {isCreateCategoryOpen && (
        <CreateCategory
          teamSlug={team.slug}
          visible={isCreateCategoryOpen}
          setVisible={setIsCreateCategoryOpen}
          mutate={mutateIap}
        />
      )}
      {isCreateCourseOpen && (
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
      )}
      <ConfirmationDialog
        visible={isDeleteCourseOpen}
        title={t('delete-course')}
        onCancel={() => setIsDeleteCourseOpen(false)}
        onConfirm={deleteCourse}
      >
        {t('delete-course-confirmation')}
      </ConfirmationDialog>
      {isCompletionResultsOpen && courseToCompletionResults && (
        <CompletionResults
          teamCourse={courseToCompletionResults}
          members={members}
          visible={isCompletionResultsOpen}
          setVisible={setIsCompletionResultsOpen}
        />
      )}
      {isStatusResultsOpen && courseToStatusResults && (
        <StatusResults
          teamCourse={courseToStatusResults}
          members={members}
          visible={isStatusResultsOpen}
          setVisible={setIsStatusResultsOpen}
        />
      )}
    </>
  );
};

export default AdminPage;
