import YouTube from 'react-youtube';
import { extractYouTubeVideoId } from '../services/passCourseService';
import { MarkdownPreview } from '@/components/shared/uiw/Markdown';
import { CourseContentType } from '@/generated/browser';
import { IapCourse } from 'types';
import { Card, CardContent } from '@/components/shadcn/ui/card';
import { useTranslation } from 'next-i18next';

const ContentPreview = ({ course }: { course: IapCourse }) => {
  const { t } = useTranslation('common');

  switch (course.contentType) {
    case CourseContentType.EMBEDDED_VIDEO:
      return <YouTube videoId={extractYouTubeVideoId(course.url as string)} />;

    case CourseContentType.PRESENTATION_PDF:
      return (
        <iframe
          src={course.url as string}
          className="block my-[10px] mx-auto"
          width="960"
          height="569"
          title={t('course-presentation')}
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
      return <p>{t('unknown-course-type')}</p>;
  }
};

export default ContentPreview;
