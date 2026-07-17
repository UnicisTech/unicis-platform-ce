CREATE TYPE "FleetConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'DELETED');

CREATE TABLE "FleetConnection" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "FleetConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "disconnectedAt" TIMESTAMP(3),
    "deleteAfter" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "disconnectedById" TEXT,
    "lastCleanupAttemptAt" TIMESTAMP(3),
    "cleanupError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FleetConnection_teamId_key" ON "FleetConnection"("teamId");

CREATE INDEX "FleetConnection_status_deleteAfter_idx" ON "FleetConnection"("status", "deleteAfter");

CREATE INDEX "FleetConnection_teamId_idx" ON "FleetConnection"("teamId");

ALTER TABLE "FleetConnection" ADD CONSTRAINT "FleetConnection_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
