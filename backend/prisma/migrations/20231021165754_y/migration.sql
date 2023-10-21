/*
  Warnings:

  - You are about to drop the column `loserUsername` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `winnerUsername` on the `matches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "matches" DROP COLUMN "loserUsername",
DROP COLUMN "winnerUsername";
