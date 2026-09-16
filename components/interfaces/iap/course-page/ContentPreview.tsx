import YouTube from 'react-youtube';
import { resolveEmbeddedVideo } from '../services/passCourseService';
import { MarkdownPreview } from '@/components/shared/uiw/Markdown';
import { CourseContentType } from '@/generated/browser';
import { IapCourse } from 'types';
import { useTranslation } from 'next-i18next';

const ContentPreview = ({ course }: { course: IapCourse }) => {
  const { t } = useTranslation('common');

  switch (course.contentType) {
    case CourseContentType.EMBEDDED_VIDEO: {
      const video = resolveEmbeddedVideo(course.url);
      if (video?.provider === 'youtube') {
        return <YouTube videoId={video.videoId} />;
      }
      if (video?.provider === 'peertube') {
        return (
          <div className="w-full max-w-[960px] my-[10px] mx-auto aspect-video">
            <iframe
              src={video.embedUrl}
              className="w-full h-full rounded-lg"
              title={course.name}
              sandbox="allow-scripts allow-same-origin allow-popups allow-fullscreen"
              allow="fullscreen"
              allowFullScreen={true}
            />
          </div>
        );
      }
      return <p>{t('unsupported-video-url')}</p>;
    }

    case CourseContentType.PRESENTATION_PDF:
      return (
        <iframe
          src={course.url as string}
          className="block my-[10px] mx-auto"
          width="960"
          height="569"
          title={t('course-presentation')}
          sandbox="allow-scripts allow-same-origin allow-fullscreen"
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
