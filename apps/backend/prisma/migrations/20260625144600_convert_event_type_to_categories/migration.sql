-- CreateTable
CREATE TABLE "EventCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_name_key" ON "EventCategory"("name");

-- Insert default categories
INSERT INTO "EventCategory" ("name", "label", "color") VALUES ('KIR_DEV', 'Kir-Dev', '#f15a29');
INSERT INTO "EventCategory" ("name", "label", "color") VALUES ('SIMONYI', 'Simonyi', '#10b981');

-- AddTemporarilyNullableColumn
ALTER TABLE "Event" ADD COLUMN "categoryId" INTEGER;

-- Map data from enum to new table
UPDATE "Event" SET "categoryId" = (SELECT id FROM "EventCategory" WHERE name = 'KIR_DEV') WHERE type = 'KIR_DEV';
UPDATE "Event" SET "categoryId" = (SELECT id FROM "EventCategory" WHERE name = 'SIMONYI') WHERE type = 'SIMONYI';

-- Set default categoryId to first one if any events had invalid/empty type (fallback)
UPDATE "Event" SET "categoryId" = (SELECT id FROM "EventCategory" LIMIT 1) WHERE "categoryId" IS NULL;

-- MakeColumnRequired
ALTER TABLE "Event" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKeyConstraint
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnumColumnAndEnum
ALTER TABLE "Event" DROP COLUMN "type";
DROP TYPE "EventType";
