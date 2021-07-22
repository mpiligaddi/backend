-- AlterTable
ALTER TABLE "ChainPeriodReport" ADD COLUMN     "clientId" TEXT;

-- CreateTable
CREATE TABLE "Coverage" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "branchId" TEXT,
    "frecuency" INTEGER NOT NULL DEFAULT 1,
    "intensity" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChainPeriodReport" ADD FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coverage" ADD FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coverage" ADD FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
