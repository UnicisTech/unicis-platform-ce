-- CreateEnum
CREATE TYPE "Subscription" AS ENUM ('COMMUNITY', 'PREMIUM', 'ULTIMATE');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "subscription" "Subscription" NOT NULL DEFAULT 'COMMUNITY';
