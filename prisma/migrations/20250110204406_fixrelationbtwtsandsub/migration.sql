/*
  Warnings:

  - You are about to drop the column `submissionId` on the `Testcase` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "Testcase" DROP CONSTRAINT "Testcase_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Testcase" DROP CONSTRAINT "Testcase_submissionId_fkey";

-- AlterTable
ALTER TABLE "Testcase" DROP COLUMN "submissionId";

-- CreateTable
CREATE TABLE "TestcaseSubmission" (
    "testcaseId" STRING NOT NULL,
    "submissionId" STRING NOT NULL,

    CONSTRAINT "TestcaseSubmission_pkey" PRIMARY KEY ("testcaseId","submissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestcaseSubmission_testcaseId_submissionId_key" ON "TestcaseSubmission"("testcaseId", "submissionId");

-- AddForeignKey
ALTER TABLE "Testcase" ADD CONSTRAINT "Testcase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestcaseSubmission" ADD CONSTRAINT "TestcaseSubmission_testcaseId_fkey" FOREIGN KEY ("testcaseId") REFERENCES "Testcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestcaseSubmission" ADD CONSTRAINT "TestcaseSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
