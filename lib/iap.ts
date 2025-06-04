import { Question, QuestionType, TextQuestion } from 'types';
import { CourseContentType } from '@prisma/client';

export const defaultCategories = ['IT Security', 'Data Privacy', 'Compliance'];

export const courseTypes = Object.values(CourseContentType).map((type) => {
  switch (type) {
    case CourseContentType.EMBEDDED_VIDEO:
      return { label: 'Embedded video', value: type };
    case CourseContentType.PRESENTATION_PDF:
      return { label: 'Presentation/PDF', value: type };
    case CourseContentType.OPEN_TEXT:
      return { label: 'Open text', value: type };
    default:
      return { label: type, value: type }; // Fallback in case enum is extended
  }
});

export const questionTypes = Object.values(QuestionType).map((type) => {
  switch (type) {
    case QuestionType.SINGLE_CHOICE:
      return { label: 'Checkbox single answer', value: type };
    case QuestionType.MULTIPLE_CHOICE:
      return { label: 'Checkbox multiple answers', value: type };
    case QuestionType.ORDER:
      return { label: 'Dropdown order number', value: type };
    case QuestionType.TEXT:
      return { label: 'Free text answer', value: type };
  }
});

export const countCourseProgress = (answers: any) => {
  if (!Array.isArray(answers) || answers.length === 0) return 0;

  const definedCount = answers.filter((item) => Boolean(item)).length;
  const percentage = (definedCount / answers.length) * 100;

  return Math.round(percentage); // Keeping it to 1 digit after decimal
};

export const countCourseAnswers = (answers: any[], questions: Question[]) => {
  let right = 0;
  let wrong = 0;

  answers.forEach((answer, index) => {
    const question = questions[index];

    switch (question.type) {
      case QuestionType.SINGLE_CHOICE: {
        const correctAnswer = question.answers.find(
          (item) => item.isCorrect
        )?.answer;
        correctAnswer === answer ? right++ : wrong++;
        break;
      }
      case QuestionType.MULTIPLE_CHOICE: {
        const correctAnswers = question.answers
          .filter((item) => item.isCorrect)
          .map(({ answer }) => answer);
        haveSameElements(correctAnswers, answer) ? right++ : wrong++;
        break;
      }
      case QuestionType.ORDER: {
        const correctSequence = question.answers.map(({ second }) => second);
        const userSequence = answer.map(({ second }) => second);
        haveSameElementsInOrder(correctSequence, userSequence)
          ? right++
          : wrong++;
        break;
      }
      case QuestionType.TEXT: {
        (question as TextQuestion).answer === answer ? right++ : wrong++;
        break;
      }
    }
  });

  return { right, wrong };
};


const haveSameElements = (arr1: any[], arr2: any[]) => {
  return (
    arr1.length === arr2.length &&
    arr1.sort().every((val, index) => val === arr2.sort()[index])
  );
};

const haveSameElementsInOrder = (arr1: any[], arr2: any[]) => {
  return (
    arr1.length === arr2.length &&
    arr1.every((val, index) => val === arr2[index])
  );
};
