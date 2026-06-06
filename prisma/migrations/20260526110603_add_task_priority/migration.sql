CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');

ALTER TABLE "Task" ADD COLUMN "priority" "TaskPriority";

ALTER TABLE "Task" ALTER COLUMN "priority" SET DEFAULT 'medium';

UPDATE "Task"
SET "priority" = 'medium'
WHERE "priority" IS NULL;

ALTER TABLE "Task" ALTER COLUMN "priority" SET NOT NULL;