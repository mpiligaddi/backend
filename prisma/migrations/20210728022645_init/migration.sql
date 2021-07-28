/*
  Warnings:

  - Changed the type of `createAt` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CategoryReport" ADD COLUMN     "badCategory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "withoutStock" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "createAt",
ADD COLUMN     "createAt" INTEGER NOT NULL;
