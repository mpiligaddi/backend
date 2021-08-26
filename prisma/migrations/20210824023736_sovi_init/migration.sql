-- CreateTable
CREATE TABLE "SoviReport" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSoviReport" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "faces" INTEGER NOT NULL,
    "soviId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RivalsSoviReport" (
    "id" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,
    "faces" INTEGER NOT NULL,
    "soviId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rival" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRivals" (
    "clientId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,

    PRIMARY KEY ("clientId","competenceId")
);

-- CreateTable
CREATE TABLE "Additional" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoviAdditional" (
    "id" TEXT NOT NULL,
    "additionalId" TEXT NOT NULL,
    "faces" INTEGER NOT NULL,
    "soviId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rival.name_unique" ON "Rival"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Additional.name_unique" ON "Additional"("name");

-- AddForeignKey
ALTER TABLE "SoviReport" ADD FOREIGN KEY ("categoryId") REFERENCES "CategoryReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSoviReport" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSoviReport" ADD FOREIGN KEY ("soviId") REFERENCES "SoviReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RivalsSoviReport" ADD FOREIGN KEY ("competenceId") REFERENCES "Rival"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RivalsSoviReport" ADD FOREIGN KEY ("soviId") REFERENCES "SoviReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRivals" ADD FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRivals" ADD FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRivals" ADD FOREIGN KEY ("competenceId") REFERENCES "Rival"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoviAdditional" ADD FOREIGN KEY ("additionalId") REFERENCES "Additional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoviAdditional" ADD FOREIGN KEY ("soviId") REFERENCES "SoviReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
