-- AlterTable
ALTER TABLE "ImageReport" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleteReason" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "uri" DROP NOT NULL;
