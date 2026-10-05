import { QuestionType } from 'types';

export const extractYouTubeVideoId = (url: string) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|embed|e)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : undefined;
};

const PEERTUBE_PATH_REGEX =
  /^\/(?:w|videos\/watch|videos\/embed)\/([a-zA-Z0-9-]{8,36})\/?$/;

/**
 * Resolves a PeerTube video URL (e.g. https://videos.enisa.europa.eu/w/<id>,
 * /videos/watch/<uuid> or /videos/embed/<id>) into its embed URL.
 */
export const extractPeerTubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return undefined;
    const match = parsed.pathname.match(PEERTUBE_PATH_REGEX);
    if (!match) return undefined;
    const embed = new URL(`/videos/embed/${match[1]}`, parsed.origin);
    const start = parsed.searchParams.get('start');
    if (start) embed.searchParams.set('start', start);
    return embed.toString();
  } catch {
    return undefined;
  }
};

export type EmbeddedVideoSource =
  | { provider: 'youtube'; videoId: string }
  | { provider: 'peertube'; embedUrl: string };

export const resolveEmbeddedVideo = (
  url: string | null | undefined
): EmbeddedVideoSource | undefined => {
  if (!url) return undefined;
  const videoId = extractYouTubeVideoId(url);
  if (videoId) return { provider: 'youtube', videoId };
  const embedUrl = extractPeerTubeEmbedUrl(url);
  if (embedUrl) return { provider: 'peertube', embedUrl };
  return undefined;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array]; // Create a copy of the array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
};

export const validateAnswer = (
  questionType: QuestionType,
  answer: any
): boolean => {
  try {
    switch (questionType) {
      case QuestionType.SINGLE_CHOICE:
        return typeof answer === 'string';

      case QuestionType.MULTIPLE_CHOICE:
        return Array.isArray(answer) && answer.length > 0;

      case QuestionType.ORDER:
        return Array.isArray(answer) && answer.every(({ second }) => second);

      case QuestionType.TEXT:
        return typeof answer === 'string';

      default:
        return false;
    }
  } catch (e) {
    console.error('Error in validateAnswer:', e);
    return false;
  }
};
