import YouTube from 'react-youtube';
import { extractYouTubeVideoId } from '../services/passCourseService';
import { MarkdownPreview } from '@/components/shared/uiw/Markdown';
import { CourseContentType } from '@/generated/browser';
import { IapCourse } from 'types';
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <MarkdownPreview
              source={course.description as string}
              className="prose max-w-none"
            />
          </div>
        </div>
      );

    default:
      return <p>{t('unknown-course-type')}</p>;
  }
};

export default ContentPreview;
