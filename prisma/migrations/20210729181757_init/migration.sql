/*
  Warnings:

  - You are about to drop the column `chainId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_chainId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "chainId";

-- CreateTable
CREATE TABLE "ProductChain" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductChain" ADD FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductChain" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
