/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `PeriodReport` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[alias]` on the table `PeriodReport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PeriodReport.name_unique" ON "PeriodReport"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodReport.alias_unique" ON "PeriodReport"("alias");
