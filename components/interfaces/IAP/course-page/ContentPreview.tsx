import YouTube from 'react-youtube';
import { extractYouTubeVideoId } from '../services/passCourseService';
import { MarkdownPreview } from '@/components/shared/uiw/Markdown';
import { CourseContentType } from '@prisma/client';
import { IapCourse } from 'types';

const ContentPreview = ({ course }: { course: IapCourse }) => {
  switch (course.contentType) {
    case CourseContentType.EMBEDDED_VIDEO:
      return <YouTube videoId={extractYouTubeVideoId(course.url as string)} />;
    case CourseContentType.PRESENTATION_PDF:
      return (
        <iframe
          src={course.url as string}
          style={{ display: 'block', margin: '10px auto' }}
          width="960"
          height="569"
          allowFullScreen={true}
        />
      );
    case CourseContentType.OPEN_TEXT:
      return (
        <div className="container">
          <div className="artboard artboard-demo bg-white dark:bg-gray-800">
            <div className="p-4">
              <MarkdownPreview
                source={course.description as string}
                className="mt-30"
              />
            </div>
          </div>
        </div>
      );
    default:
      return <p>Unkown course type</p>;
  }
};

export default ContentPreview;
