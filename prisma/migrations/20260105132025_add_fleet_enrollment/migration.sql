-- CreateEnum
CREATE TYPE "FleetEnrollmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "FleetEnrollment_token_key" ON "FleetEnrollment"("token");

-- CreateIndex
CREATE INDEX "FleetEnrollment_teamId_idx" ON "FleetEnrollment"("teamId");

-- CreateIndex
CREATE INDEX "FleetEnrollment_userId_idx" ON "FleetEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FleetEnrollment_teamId_userId_key" ON "FleetEnrollment"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "FleetEnrollment" ADD CONSTRAINT "FleetEnrollment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetEnrollment" ADD CONSTRAINT "FleetEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
