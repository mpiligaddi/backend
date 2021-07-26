-- CreateEnum
CREATE TYPE "report_types" AS ENUM ('pricing', 'breakeven', 'photographic');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "type" "report_types" NOT NULL DEFAULT E'photographic';
