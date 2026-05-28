/*
  Warnings:

  - A unique constraint covering the columns `[recurrenceScheduleId,recurrenceOccurrenceDate]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TaskRecurrenceUnit" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "TaskRecurrenceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "recurrenceOccurrenceDate" TIMESTAMPTZ,
ADD COLUMN     "recurrenceScheduleId" TEXT;

-- CreateTable
CREATE TABLE "TaskRecurrence" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "taskStatus" TEXT NOT NULL DEFAULT 'todo',
    "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
    "unit" "TaskRecurrenceUnit" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "startAt" TIMESTAMPTZ NOT NULL,
    "nextRunAt" TIMESTAMPTZ NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "dueDateOffsetDays" INTEGER,
    "status" "TaskRecurrenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskRecurrence_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TaskRecurrence_interval_check" CHECK ("interval" >= 1),
    CONSTRAINT "TaskRecurrence_nextRunAt_check" CHECK ("nextRunAt" >= "startAt"),
    CONSTRAINT "TaskRecurrence_dueDateOffsetDays_check" CHECK ("dueDateOffsetDays" IS NULL OR "dueDateOffsetDays" >= 0),
    CONSTRAINT "TaskRecurrence_timezone_check" CHECK (length(trim("timezone")) > 0)
);

-- AddCheckConstraint
ALTER TABLE "Task" ADD CONSTRAINT "Task_recurrenceScheduleId_requires_occurrenceDate_check"
CHECK ("recurrenceScheduleId" IS NULL OR "recurrenceOccurrenceDate" IS NOT NULL);

-- CreateIndex
CREATE INDEX "TaskRecurrence_teamId_status_idx" ON "TaskRecurrence"("teamId", "status");

-- CreateIndex
CREATE INDEX "TaskRecurrence_status_nextRunAt_idx" ON "TaskRecurrence"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "Task_recurrenceScheduleId_idx" ON "Task"("recurrenceScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_recurrenceScheduleId_recurrenceOccurrenceDate_key" ON "Task"("recurrenceScheduleId", "recurrenceOccurrenceDate");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recurrenceScheduleId_fkey" FOREIGN KEY ("recurrenceScheduleId") REFERENCES "TaskRecurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRecurrence" ADD CONSTRAINT "TaskRecurrence_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRecurrence" ADD CONSTRAINT "TaskRecurrence_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
