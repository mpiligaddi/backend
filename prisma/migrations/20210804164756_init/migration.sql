/*
  Warnings:

  - Added the required column `clientId` to the `ProductChain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductChain" ADD COLUMN     "clientId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductChain" ADD FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
