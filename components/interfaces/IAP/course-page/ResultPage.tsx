import Certificate from './Certificate';
import UserResultPieChart from './UserResultPieChart';
import { IapCourse } from 'types';
import { countCourseAnswers } from '@/lib/iap';

const ResultPage = ({
  course,
  answers,
  userName,
}: {
  course: IapCourse;
  answers: any;
  userName: string;
}) => {
  const { right, wrong } = countCourseAnswers(answers, course.questions);
  console.log('answers', answers);
  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-1/2">
        <div className="h-[300px] mb-2">
          <UserResultPieChart right={right} wrong={wrong} />
        </div>
        {/* //TODO: results table to discuss */}
        <div className="flex justify-center">
          <Certificate course={course} userName={userName} />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
