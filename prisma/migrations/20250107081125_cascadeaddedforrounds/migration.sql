-- DropForeignKey
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_roundNumber_fkey";

-- DropForeignKey
ALTER TABLE "TeamRound" DROP CONSTRAINT "TeamRound_roundId_fkey";

-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "roundNumber" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "TeamRound" ADD CONSTRAINT "TeamRound_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("number") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_roundNumber_fkey" FOREIGN KEY ("roundNumber") REFERENCES "Round"("number") ON DELETE SET DEFAULT ON UPDATE CASCADE;
