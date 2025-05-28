import { CourseContentType, CourseProgress, TeamCourse } from '@prisma/client';
import { Course } from '@prisma/client';
import type { Option } from './base';

export type TeamIapProperties = {
  iap_categories?: string[];
  iap_courses?: any[];
};

export enum QuestionType {
  SINGLE_CHOICE = 'checkboxsingle',
  MULTIPLE_CHOICE = 'checkboxmulti',
  ORDER = 'order',
  TEXT = 'text',
}

export type CourseFormData = {
  name: string;
  category: Option;
  type: {
    label: string;
    value: CourseContentType;
  };
  programContent: string;
  teams: Option[];
  estimatedTime: string;
  thumbnailLink: string;
  description: string;
  url: string;
  questions: any;
};

export type QuestionBase = {
  question: string;
};

export type SingleChoiceQuestion = QuestionBase & {
  type: QuestionType.SINGLE_CHOICE;
  answers: { answer: string; isCorrect: boolean }[];
};

export type MultipleChoiceQuestion = QuestionBase & {
  type: QuestionType.MULTIPLE_CHOICE;
  answers: { answer: string; isCorrect: boolean }[];
};

export type OrderQuestion = QuestionBase & {
  type: QuestionType.ORDER;
  answers: { first: string; second: string }[];
};

export type TextQuestion = QuestionBase & {
  type: QuestionType.TEXT;
  answer: string;
};

export type Question = {
  question: string;
} & (
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | OrderQuestion
  | TextQuestion
);

export type IapCourse = Course & {
  questions: Question[];
};

export type IapCourseWithProgress = IapCourse & {
  progress: CourseProgress[];
};

export type TeamCourseWithProgress = TeamCourse & {
  course: IapCourse;
  progress: CourseProgress[];
};
