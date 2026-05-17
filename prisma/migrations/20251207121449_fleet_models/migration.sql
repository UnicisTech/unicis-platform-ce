-- Add optional field "fleetAccess" to Account table
ALTER TABLE "Account"
ADD COLUMN "fleetAccess" TEXT;