import YouTube from 'react-youtube';
import { extractYouTubeVideoId } from '../services/passCourseService';
import { MarkdownPreview } from '@/components/shared/uiw/Markdown';
import { CourseContentType } from '@prisma/client';
import { IapCourse } from 'types';
import { Card, CardContent } from '@/components/shadcn/ui/card';

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
        <div className="container my-4">
          <Card className="bg-background text-foreground shadow-sm">
            <CardContent className="p-6">
              <MarkdownPreview
                source={course.description as string}
                className="prose dark:prose-invert max-w-none"
              />
            </CardContent>
          </Card>
        </div>
      );
    default:
      return <p>Unkown course type</p>;
  }
};

export default ContentPreview;
