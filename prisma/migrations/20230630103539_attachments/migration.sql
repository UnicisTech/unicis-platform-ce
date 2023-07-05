-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
