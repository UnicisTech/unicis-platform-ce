/*
  Warnings:

  - The primary key for the `Attachment` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Attachment_id_seq";
