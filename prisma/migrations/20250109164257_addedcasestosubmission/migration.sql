-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "score" DROP NOT NULL;
ALTER TABLE "Submission" ALTER COLUMN "score" SET DEFAULT 0;
ALTER TABLE "Submission" ALTER COLUMN "testcasespassed" SET DEFAULT ARRAY[]::BOOL[];

-- AlterTable
ALTER TABLE "Testcase" ADD COLUMN     "submissionId" STRING;

-- AddForeignKey
ALTER TABLE "Testcase" ADD CONSTRAINT "Testcase_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
