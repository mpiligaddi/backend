-- AlterTable
ALTER TABLE "Chain" ADD COLUMN     "formatId" TEXT;

-- CreateTable
CREATE TABLE "Format" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Format.name_unique" ON "Format"("name");

-- AddForeignKey
ALTER TABLE "Chain" ADD FOREIGN KEY ("formatId") REFERENCES "Format"("id") ON DELETE SET NULL ON UPDATE CASCADE;
