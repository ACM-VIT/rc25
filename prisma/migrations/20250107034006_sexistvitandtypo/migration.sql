/*
  Warnings:

  - The values [others] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `norml_cases` on the `Problem` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Gender"DROP VALUE 'others';

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "norml_cases";
ALTER TABLE "Problem" ADD COLUMN     "normal_cases" INT4 NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
