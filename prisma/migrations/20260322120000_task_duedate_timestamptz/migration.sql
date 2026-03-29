BEGIN;

ALTER TABLE "Task"
  ALTER COLUMN "duedate" DROP NOT NULL;

UPDATE "Task"
SET "duedate" = NULL
WHERE "duedate" IS NOT NULL AND "duedate" = '';

UPDATE "Task"
SET "duedate" = NULL
WHERE "duedate" IS NOT NULL
  AND "duedate" !~ '^\d{4}-\d{2}-\d{2}$';

ALTER TABLE "Task"
  ALTER COLUMN "duedate" TYPE TIMESTAMPTZ
  USING (
    CASE
      WHEN "duedate" IS NULL THEN NULL
      ELSE (("duedate"::date + time '23:59:59') AT TIME ZONE 'Europe/Paris')
    END
  );

CREATE INDEX IF NOT EXISTS "Task_duedate_idx"
  ON "Task" ("duedate");

COMMIT;
