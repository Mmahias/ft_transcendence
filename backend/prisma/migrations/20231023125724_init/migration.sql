/*
  Warnings:

  - You are about to drop the column `date` on the `achievements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "achievements" DROP COLUMN "date";

-- AlterTable
ALTER TABLE "user_achievements" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
