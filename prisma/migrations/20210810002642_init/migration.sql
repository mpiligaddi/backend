/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Chain` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chain.name_unique" ON "Chain"("name");
