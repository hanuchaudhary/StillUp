/*
  Warnings:

  - Added the required column `region` to the `Check` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusCode` to the `Check` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Check" ADD COLUMN     "error" TEXT,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "statusCode" INTEGER NOT NULL;
