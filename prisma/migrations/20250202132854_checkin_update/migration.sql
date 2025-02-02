/*
  Warnings:

  - You are about to drop the column `requires_checkin` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the column `checkedIn` on the `TeamRound` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Round" DROP COLUMN "requires_checkin";

-- AlterTable
ALTER TABLE "TeamRound" DROP COLUMN "checkedIn";
