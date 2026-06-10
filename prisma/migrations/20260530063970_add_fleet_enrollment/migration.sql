CREATE TYPE "FleetEnrollmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

CREATE TABLE "FleetEnrollment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "FleetEnrollmentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "FleetEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FleetEnrollment_token_key" ON "FleetEnrollment"("token");

CREATE INDEX "FleetEnrollment_teamId_idx" ON "FleetEnrollment"("teamId");

CREATE INDEX "FleetEnrollment_userId_idx" ON "FleetEnrollment"("userId");

CREATE UNIQUE INDEX "FleetEnrollment_teamId_userId_key" ON "FleetEnrollment"("teamId", "userId");

ALTER TABLE "FleetEnrollment" ADD CONSTRAINT "FleetEnrollment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FleetEnrollment" ADD CONSTRAINT "FleetEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
