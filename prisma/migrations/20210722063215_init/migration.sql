/*
  Warnings:

  - Added the required column `displayName` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "displayName" TEXT NOT NULL;
