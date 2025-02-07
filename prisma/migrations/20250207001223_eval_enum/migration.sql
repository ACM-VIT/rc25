/*
  Warnings:

  - Added the required column `evaluationStatus` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EvalEnum" AS ENUM ('ACCEPTED', 'RUNTIME_ERROR', 'COMPILE_ERROR');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "evaluationStatus" "EvalEnum" NOT NULL;
