/*
  Warnings:

  - You are about to drop the column `courseId` on the `CourseProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CourseProgress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teamCourseId,teamMemberId]` on the table `CourseProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamCourseId` to the `CourseProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamMemberId` to the `CourseProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_userId_fkey";

-- DropIndex
DROP INDEX "CourseProgress_courseId_userId_key";

-- AlterTable
ALTER TABLE "CourseProgress" DROP COLUMN "courseId",
DROP COLUMN "userId",
ADD COLUMN     "teamCourseId" TEXT NOT NULL,
ADD COLUMN     "teamMemberId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CourseProgress_teamCourseId_teamMemberId_key" ON "CourseProgress"("teamCourseId", "teamMemberId");

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_teamCourseId_fkey" FOREIGN KEY ("teamCourseId") REFERENCES "TeamCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
