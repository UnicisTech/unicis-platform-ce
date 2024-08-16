/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `FleetAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FleetAccount_userId_fleetId_key";

-- CreateIndex
CREATE UNIQUE INDEX "FleetAccount_userId_key" ON "FleetAccount"("userId");
