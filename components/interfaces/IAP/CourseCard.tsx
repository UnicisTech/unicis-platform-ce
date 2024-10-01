
import { useRouter } from 'next/router';
import { StatusBadge } from '@/components/shared';
import { SimpleTag as Tag } from '@atlaskit/tag';
import { Category, Course } from '@prisma/client';
import { Card } from 'react-daisyui';
import { Button } from 'react-daisyui';
import { IapCourseWithProgress, TeamCourseWithProgress } from 'types';

const CourseCard = ({ teamCourse, categories }: { teamCourse: TeamCourseWithProgress, categories: Category[] }) => {
    const router = useRouter();

    const openCourse = () => {
        router.push(`${router.asPath}/${teamCourse.id}`);
    };

    const course = teamCourse.course

    return (
        <Card className="w-[350px] m-4 hover:shadow-lg hover:shadow-black/25 dark:bg-gray-800" bordered>
            <div className="relative pt-[70%]">
                <img
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={course?.thumbnail ? course.thumbnail : "/unicis-iap-logo.png"}
                    alt="Course Thumbnail"
                />
            </div>
            <Card.Body>
                <Card.Title tag="h2">{course.name}</Card.Title>
                <div className='flex justify-start'>
                    <Tag text={categories.find(({ id }) => id === course.categoryId)?.name || ''} color="blueLight" />
                </div>
                <div className="mt-[5px]">
                    {teamCourse.progress?.[0]?.progress === 100
                        ? <StatusBadge label='Passed' value='done' />
                        : teamCourse.progress?.[0]?.progress > 0
                            ? <StatusBadge label='In progress' value='inprogress' />
                            : <StatusBadge label='To do' value='todo' />
                    }

                    {course?.estimatedTime ? <p>Estimated: {course.estimatedTime} minutes</p> : null}
                </div>
                <Card.Actions className="justify-end">
                    <Button
                        onClick={openCourse}
                    >
                        Open
                    </Button>
                </Card.Actions>
            </Card.Body>
        </Card>
    )
}

export default CourseCard