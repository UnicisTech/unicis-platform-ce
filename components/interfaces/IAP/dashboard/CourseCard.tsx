import { useRouter } from 'next/router';
import { SimpleTag as Tag } from '@atlaskit/tag';
import { Category } from '@prisma/client';
import { TeamCourseWithProgress } from 'types';
import ProgressBadge from '../shared/ProgressBadge';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import DaisyCard from '@/components/shared/daisyUI/DaisyCard';

const CourseCard = ({
  teamCourse,
  categories,
}: {
  teamCourse: TeamCourseWithProgress;
  categories: Category[];
}) => {
  const router = useRouter();

  const openCourse = () => {
    router.push(`${router.asPath}/${teamCourse.id}`);
  };

  const course = teamCourse.course;

  return (
    <DaisyCard
      className="w-[350px] m-4 hover:shadow-lg hover:shadow-black/25 dark:bg-gray-800"
      bordered
    >
      <div className="relative pt-[70%]">
        <img
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={course?.thumbnail ? course.thumbnail : '/unicis-iap-logo.png'}
          alt="Course Thumbnail"
        />
      </div>
      <DaisyCard.Body>
        <DaisyCard.Title tag="h2">{course.name}</DaisyCard.Title>
        <div className="flex justify-start">
          <Tag
            text={
              categories.find(({ id }) => id === course.categoryId)?.name || ''
            }
            color="blueLight"
          />
        </div>
        <div className="mt-[5px]">
          <ProgressBadge progress={teamCourse.progress?.[0]?.progress} />
          {course?.estimatedTime ? (
            <p>Estimated: {course.estimatedTime} minutes</p>
          ) : null}
        </div>
        <DaisyCard.Actions className="justify-end">
          <DaisyButton onClick={openCourse}>Open</DaisyButton>
        </DaisyCard.Actions>
      </DaisyCard.Body>
    </DaisyCard>
  );
};

export default CourseCard;
