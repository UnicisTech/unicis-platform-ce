-- CreateTable
CREATE TABLE "FleetAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FleetAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FleetAccount_userId_fleetId_key" ON "FleetAccount"("userId", "fleetId");

-- AddForeignKey
ALTER TABLE "FleetAccount" ADD CONSTRAINT "FleetAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
