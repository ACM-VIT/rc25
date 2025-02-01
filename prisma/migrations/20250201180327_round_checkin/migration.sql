-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "requires_checkin" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TeamRound" ADD COLUMN     "checkedIn" BOOL NOT NULL DEFAULT false;
