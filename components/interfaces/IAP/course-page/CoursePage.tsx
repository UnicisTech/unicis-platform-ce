import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useIapProgress from 'hooks/useIapProgress';
import ResultPage from './ResultPage';
import ContentPreview from './ContentPreview';
import QuestionRenderer from './QuestionRenderer';
import { Loading, Error } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { validateAnswer } from '../services/passCourseService';
import { TeamCourseWithProgress, ApiResponse } from 'types';
import { Button } from '@/components/shadcn/ui/button';

const CoursePage = ({ teamCourse }: { teamCourse: TeamCourseWithProgress }) => {
  const course = teamCourse.course;
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug, courseId } = router.query as { slug: string; courseId: string };
  const { data } = useSession();

  const { userProgress, isError, isLoading, mutateProgress } = useIapProgress(slug, courseId);

  const [answers, setAnswers] = useState<any>(Array(course.questions.length).fill(null));
  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const isLastQuestion = currentQuestionIndex === course.questions.length - 1;

  const handleAnswerUpdate = (answer: any) => {
    const currentQuestion = course.questions[currentQuestionIndex];
    const isValid = validateAnswer(currentQuestion?.type, answer);

    if (isValid) {
      setAnswers((prev) => {
        const updated = [...prev];
        updated[currentQuestionIndex] = answer;
        return updated;
      });
    }
  };

  const nextHandler = () => {
    for (let i = currentQuestionIndex; i < course.questions.length; i++) {
      if (i === course.questions.length - 1) return saveHandler();
      if (!answers[i + 1]) return setCurrentQuestionIndex(i + 1);
    }
  };

  const saveHandler = async () => {
    try {
      const response = await fetch(
        `/api/teams/${slug}/iap/course/${teamCourse.id}/progress`,
        {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify(answers),
        }
      );

      const json = (await response.json()) as ApiResponse<any>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('iap-course-saved'));
      mutateProgress();
    } catch (e) {
      toast.error('Something went wrong.');
    }
  };

  useEffect(() => {
    if (!userProgress) return;

    const { progress, answers } = userProgress as { progress: number; answers: any };
    setStarted(true);
    setAnswers(answers);
    setFinished(progress === 100);

    const nextIndex = answers.findIndex((item) => !item);
    if (nextIndex !== -1) setCurrentQuestionIndex(nextIndex);
  }, [userProgress]);

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;

  if (finished) {
    return (
      <ResultPage
        course={course}
        answers={answers}
        userName={data?.user?.name || ''}
      />
    );
  }

  return (
    <div className="min-h-[50%]">
      <div className="mb-5 flex justify-center">
        <ContentPreview course={course} />
      </div>
      {!started ? (
        <div className="flex justify-center">
          <Button onClick={() => setStarted(true)}>Start</Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex flex-col w-full max-w-xl gap-4">
            <div className="text-center font-medium">
              {currentQuestionIndex + 1}/{course.questions.length}
            </div>
            <QuestionRenderer
              question={course.questions[currentQuestionIndex]}
              onAnswerUpdate={handleAnswerUpdate}
            />
            <div className="flex justify-end">
              {isLastQuestion ? (
                <Button onClick={saveHandler}>{t('save')}</Button>
              ) : (
                <Button onClick={nextHandler}>{t('next')}</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
