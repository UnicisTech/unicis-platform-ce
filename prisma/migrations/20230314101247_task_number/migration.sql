/*
  Warnings:

  - Added the required column `properties` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "properties" JSONB NOT NULL,
ADD COLUMN     "taskNumber" INTEGER NOT NULL DEFAULT 1;
