-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- Update existing positions order
UPDATE "Position" SET "order" = 7 WHERE "name" = 'UJONC';
UPDATE "Position" SET "order" = 6 WHERE "name" = 'TAG';
UPDATE "Position" SET "order" = 5 WHERE "name" = 'HR_FELELOS';
UPDATE "Position" SET "order" = 4 WHERE "name" = 'PR_FELELOS';
UPDATE "Position" SET "order" = 3 WHERE "name" = 'TANFOLYAMFELELOS';
UPDATE "Position" SET "order" = 2 WHERE "name" = 'GAZDASAGIS';
UPDATE "Position" SET "order" = 1 WHERE "name" = 'KORVEZETO_HELYETTES';
UPDATE "Position" SET "order" = 0 WHERE "name" = 'KORVEZETO';
UPDATE "Position" SET "order" = 8 WHERE "name" = 'OREGTAG';
UPDATE "Position" SET "order" = 9 WHERE "name" = 'ARCHIVALT';
