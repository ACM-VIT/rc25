/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "token" DROP NOT NULL;
ALTER TABLE "Submission" ALTER COLUMN "token" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_token_key" ON "Submission"("token");
