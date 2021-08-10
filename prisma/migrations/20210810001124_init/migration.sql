/*
  Warnings:

  - You are about to drop the column `photoReportId` on the `ImageReport` table. All the data in the column will be lost.
  - You are about to drop the column `breakevenReportId` on the `ProductBreakevenReport` table. All the data in the column will be lost.
  - You are about to drop the column `pricingReportId` on the `ProductPricingReport` table. All the data in the column will be lost.
  - The `createdAt` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BreakevenReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhotoReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingReport` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `formatId` on table `Chain` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BreakevenReport" DROP CONSTRAINT "BreakevenReport_categoryReportId_fkey";

-- DropForeignKey
ALTER TABLE "ImageReport" DROP CONSTRAINT "ImageReport_photoReportId_fkey";

-- DropForeignKey
ALTER TABLE "PhotoReport" DROP CONSTRAINT "PhotoReport_categoryReportId_fkey";

-- DropForeignKey
ALTER TABLE "PricingReport" DROP CONSTRAINT "PricingReport_categoryReportId_fkey";

-- DropForeignKey
ALTER TABLE "ProductBreakevenReport" DROP CONSTRAINT "ProductBreakevenReport_breakevenReportId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPricingReport" DROP CONSTRAINT "ProductPricingReport_pricingReportId_fkey";

-- DropIndex
DROP INDEX "Branch.name_unique";

-- DropIndex
DROP INDEX "Chain.name_unique";

-- AlterTable
ALTER TABLE "Chain" ALTER COLUMN "formatId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ImageReport" DROP COLUMN "photoReportId",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "ProductBreakevenReport" DROP COLUMN "breakevenReportId",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "ProductPricingReport" DROP COLUMN "pricingReportId",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "BreakevenReport";

-- DropTable
DROP TABLE "PhotoReport";

-- DropTable
DROP TABLE "PricingReport";

-- AddForeignKey
ALTER TABLE "ProductPricingReport" ADD FOREIGN KEY ("categoryId") REFERENCES "CategoryReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBreakevenReport" ADD FOREIGN KEY ("categoryId") REFERENCES "CategoryReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageReport" ADD FOREIGN KEY ("categoryId") REFERENCES "CategoryReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
