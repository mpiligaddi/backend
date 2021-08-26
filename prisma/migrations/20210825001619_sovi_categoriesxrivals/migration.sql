/*
  Warnings:

  - The primary key for the `ClientRivals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RivalCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `ClientRivals` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `RivalCategories` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "ClientRivals" DROP CONSTRAINT "ClientRivals_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "clientId" DROP NOT NULL,
ALTER COLUMN "competenceId" DROP NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RivalCategories" DROP CONSTRAINT "RivalCategories_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "rivalId" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL,
ADD PRIMARY KEY ("id");
