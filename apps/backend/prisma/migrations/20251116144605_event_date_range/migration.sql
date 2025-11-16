-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "startDate" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN     "endDate" TIMESTAMP(3);

-- Copy data from date to startDate and endDate
UPDATE "Event" SET "startDate" = "date", "endDate" = "date";

-- Now that columns are populated, make them NOT NULL
ALTER TABLE "Event" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "endDate" SET NOT NULL;

-- Finally, drop the old date column
ALTER TABLE "Event" DROP COLUMN "date";
