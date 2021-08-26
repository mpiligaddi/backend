/*
  Warnings:

  - You are about to drop the column `categoryId` on the `ClientRivals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClientRivals" DROP CONSTRAINT "ClientRivals_categoryId_fkey";

-- AlterTable
ALTER TABLE "ClientRivals" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "RivalCategories" (
    "rivalId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    PRIMARY KEY ("rivalId","categoryId")
);

-- AddForeignKey
ALTER TABLE "RivalCategories" ADD FOREIGN KEY ("rivalId") REFERENCES "Rival"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RivalCategories" ADD FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
