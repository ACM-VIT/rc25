-- CreateEnum
CREATE TYPE "Venue" AS ENUM ('CS', 'CHANNA');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "venue" "Venue";
