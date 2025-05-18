import { useRouter } from 'next/router';
import { SimpleTag as Tag } from '@atlaskit/tag';
import { Category } from '@prisma/client';
import { Card } from 'react-daisyui';
import { TeamCourseWithProgress } from 'types';
import ProgressBadge from '../shared/ProgressBadge';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';

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
    <Card
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
      <Card.Body>
        <Card.Title tag="h2">{course.name}</Card.Title>
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
        <Card.Actions className="justify-end">
          <DaisyButton onClick={openCourse}>Open</DaisyButton>
        </Card.Actions>
      </Card.Body>
    </Card>
  );
};

export default CourseCard;
