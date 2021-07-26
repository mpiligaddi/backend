/*
  Warnings:

  - You are about to drop the `ProductPReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "user_role" ADD VALUE 'superadmin';

-- DropForeignKey
ALTER TABLE "ProductPReport" DROP CONSTRAINT "ProductPReport_pricingReportId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPReport" DROP CONSTRAINT "ProductPReport_productId_fkey";

-- DropTable
DROP TABLE "ProductPReport";

-- CreateTable
CREATE TABLE "BreakevenReport" (
    "id" TEXT NOT NULL,
    "categoryReportId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPricingReport" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "pricing" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pricingReportId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBreakevenReport" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "breakevenReportId" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BreakevenReport" ADD FOREIGN KEY ("categoryReportId") REFERENCES "CategoryReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPricingReport" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPricingReport" ADD FOREIGN KEY ("pricingReportId") REFERENCES "PricingReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBreakevenReport" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBreakevenReport" ADD FOREIGN KEY ("breakevenReportId") REFERENCES "BreakevenReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
