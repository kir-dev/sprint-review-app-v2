/*
  Warnings:

  - The values [OPERATIONS] on the enum `LogCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogCategory_new" AS ENUM ('RESPONSIBILITY', 'PROJECT', 'EVENT', 'MAINTENANCE', 'SIMONYI', 'OTHER');
ALTER TABLE "Log" ALTER COLUMN "category" TYPE "LogCategory_new" USING ("category"::text::"LogCategory_new");
ALTER TYPE "LogCategory" RENAME TO "LogCategory_old";
ALTER TYPE "LogCategory_new" RENAME TO "LogCategory";
DROP TYPE "public"."LogCategory_old";
COMMIT;
