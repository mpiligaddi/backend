/*
  Warnings:

  - You are about to drop the column `clientId` on the `Branch` table. All the data in the column will be lost.
  - Added the required column `chainId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_clientId_fkey";

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "clientId";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "chainId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Report" ADD FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
