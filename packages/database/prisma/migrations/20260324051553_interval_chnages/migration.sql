/*
  Warnings:

  - You are about to drop the column `status` on the `Monitor` table. All the data in the column will be lost.
  - Changed the type of `status` on the `Check` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MONITOR_STATUS" AS ENUM ('UP', 'DOWN', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Check" DROP COLUMN "status",
ADD COLUMN     "status" "MONITOR_STATUS" NOT NULL;

-- AlterTable
ALTER TABLE "Monitor" DROP COLUMN "status",
ADD COLUMN     "performance" BOOLEAN NOT NULL DEFAULT false;
