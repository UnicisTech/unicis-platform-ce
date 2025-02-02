import { QuestionType } from 'types';

export const extractYouTubeVideoId = (url: string) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|embed|e)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : undefined;
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
