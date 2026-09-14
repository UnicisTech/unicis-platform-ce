import type {
  ApiKey as PrismaApiKey,
  Category as PrismaCategory,
  Course as PrismaCourse,
  CourseProgress as PrismaCourseProgress,
  Invitation as PrismaInvitation,
  Payment as PrismaPayment,
  Subscription as PrismaSubscription,
  Task as PrismaTask,
  TaskRecurrence as PrismaTaskRecurrence,
  Team as PrismaTeam,
  TeamCourse as PrismaTeamCourse,
  TeamMember as PrismaTeamMember,
  User as PrismaUser,
} from '@/generated/browser';
import type {
  CommentsPage,
  ExtendedComment,
  SubscriptionWithPayments,
  TaskComment,
  TaskDetail,
  TaskExtended,
  TeamMemberWithUser,
  TeamWithMemberCount,
  TeamWithSubscription,
} from './base';

export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

// Client-facing DTOs (JSON-serialized)
export type Task = Serialized<PrismaTask>;
export type TaskRecurrence = Serialized<PrismaTaskRecurrence>;
export type TaskDetailDto = Serialized<TaskDetail>;
export type TaskCommentDto = Serialized<TaskComment>;
export type CommentsPageDto = Serialized<CommentsPage>;
/** @deprecated Use TaskDetailDto instead. */
export type TaskExtendedDto = Serialized<TaskExtended>;
/** @deprecated Use TaskCommentDto instead. */
export type ExtendedCommentDto = Serialized<ExtendedComment>;
export type Team = Serialized<PrismaTeam>;
export type User = Serialized<PrismaUser>;
export type Invitation = Serialized<PrismaInvitation>;
export type TeamMember = Serialized<PrismaTeamMember>;
export type Subscription = Serialized<PrismaSubscription>;
export type Payment = Serialized<PrismaPayment>;
export type ApiKey = Serialized<PrismaApiKey>;
export type Course = Serialized<PrismaCourse>;
export type CourseProgress = Serialized<PrismaCourseProgress>;
export type TeamCourse = Serialized<PrismaTeamCourse>;
export type Category = Serialized<PrismaCategory>;

export type TeamWithMemberCountDto = Serialized<TeamWithMemberCount>;
export type TeamWithSubscriptionDto = Serialized<TeamWithSubscription>;
export type TeamMemberWithUserDto = Serialized<TeamMemberWithUser>;
export type SubscriptionWithPaymentsDto = Serialized<SubscriptionWithPayments>;
