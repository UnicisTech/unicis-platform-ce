/*
  Warnings:

  - A unique constraint covering the columns `[taskNumber,teamId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Task_taskNumber_teamId_key" ON "Task"("taskNumber", "teamId");
