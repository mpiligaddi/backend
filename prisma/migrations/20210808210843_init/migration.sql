/*
  Warnings:

  - You are about to drop the column `clientId` on the `ProductChain` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductChain" DROP CONSTRAINT "ProductChain_clientId_fkey";

-- AlterTable
ALTER TABLE "ProductChain" DROP COLUMN "clientId";

-- CreateTable
CREATE TABLE "ProductClient" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductClient" ADD FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductClient" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
