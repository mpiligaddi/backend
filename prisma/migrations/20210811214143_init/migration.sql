/*
  Warnings:

  - You are about to drop the column `clientId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Client` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_accountId_fkey";

-- DropIndex
DROP INDEX "Client_accountId_unique";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "clientId";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "accountId";
