/*
  Warnings:

  - Added the required column `accessPhrase` to the `FleetAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FleetAccount" ADD COLUMN     "accessPhrase" TEXT NOT NULL;
