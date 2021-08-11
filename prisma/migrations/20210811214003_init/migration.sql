/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "accountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_accountId_unique" ON "Client"("accountId");

-- AddForeignKey
ALTER TABLE "Client" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
