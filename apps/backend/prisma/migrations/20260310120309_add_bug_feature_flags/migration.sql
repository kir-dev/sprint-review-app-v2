-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "isBug" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeature" BOOLEAN NOT NULL DEFAULT false;
