-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "kanbanOrder" INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "teamId", status
      ORDER BY "taskNumber" ASC, id ASC
    ) - 1 AS order_index
  FROM "Task"
)
UPDATE "Task"
SET "kanbanOrder" = ordered.order_index
FROM ordered
WHERE "Task".id = ordered.id;

-- CreateIndex
CREATE INDEX "Task_teamId_status_kanbanOrder_idx" ON "Task"("teamId", "status", "kanbanOrder");
