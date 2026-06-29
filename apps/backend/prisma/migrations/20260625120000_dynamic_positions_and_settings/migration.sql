-- 1. Drop default value constraint from User.position because it references the enum type
ALTER TABLE "User" ALTER COLUMN "position" DROP DEFAULT;

-- 2. Alter existing columns to TEXT to remove dependency on the Position enum type
ALTER TABLE "User" ALTER COLUMN "position" TYPE TEXT;
ALTER TABLE "PositionHistory" ALTER COLUMN "position" TYPE TEXT;

-- 3. Drop the Position enum type so we can create a table with the same name
DROP TYPE "Position";

-- 4. Create Position table
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "canManageSettings" BOOLEAN NOT NULL DEFAULT false,
    "canExportLogs" BOOLEAN NOT NULL DEFAULT false,
    "canManageEvents" BOOLEAN NOT NULL DEFAULT false,
    "canManageProjects" BOOLEAN NOT NULL DEFAULT false,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- 5. Create SystemSetting table
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- 6. Populate default positions (matching current enum values and styles)
INSERT INTO "Position" ("id", "name", "label", "color", "canManageSettings", "canExportLogs", "canManageEvents", "canManageProjects", "isLeader") VALUES
(1, 'UJONC', 'Újonc', 'bg-slate-500/10 text-foreground border-slate-500/20', false, false, false, false, false),
(2, 'TAG', 'Tag', 'bg-orange-500/10 text-foreground border-orange-500/20', false, false, false, false, false),
(3, 'HR_FELELOS', 'HR-felelős', 'bg-pink-500/10 text-foreground border-pink-500/20', false, false, false, false, false),
(4, 'PR_FELELOS', 'PR-felelős', 'bg-purple-500/10 text-foreground border-purple-500/20', false, false, false, false, false),
(5, 'TANFOLYAMFELELOS', 'Tanfolyamfelelős', 'bg-indigo-500/10 text-foreground border-indigo-500/20', false, false, false, false, false),
(6, 'GAZDASAGIS', 'Gazdaságis', 'bg-emerald-500/10 text-foreground border-emerald-500/20', false, true, false, false, false),
(7, 'KORVEZETO_HELYETTES', 'Körvezető helyettes', 'bg-amber-500/10 text-foreground border-amber-500/20', false, true, true, true, false),
(8, 'KORVEZETO', 'Körvezető', 'bg-red-500/10 text-foreground border-red-500/20', true, true, true, true, true),
(9, 'OREGTAG', 'Öregtag', 'bg-yellow-500/10 text-foreground border-yellow-500/20', false, false, false, false, false),
(10, 'ARCHIVALT', 'Archivált', 'bg-gray-400/10 text-foreground border-gray-400/20', false, false, false, false, false);

-- Adjust sequence for Position id after inserts
SELECT setval('public."Position_id_seq"', 10, true);

-- 7. Add temporary nullable positionId columns
ALTER TABLE "User" ADD COLUMN "positionId" INTEGER;
ALTER TABLE "PositionHistory" ADD COLUMN "positionId" INTEGER;

-- 8. Copy data from 'position' TEXT column to 'positionId' based on name matching
UPDATE "User" SET "positionId" = (SELECT id FROM "Position" WHERE "Position".name = "User".position);
UPDATE "PositionHistory" SET "positionId" = (SELECT id FROM "Position" WHERE "Position".name = "PositionHistory".position);

-- 9. Set positionId as NOT NULL (since all users must have one)
ALTER TABLE "User" ALTER COLUMN "positionId" SET NOT NULL;
ALTER TABLE "PositionHistory" ALTER COLUMN "positionId" SET NOT NULL;

-- 10. Add foreign key constraints
ALTER TABLE "User" ADD CONSTRAINT "User_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PositionHistory" ADD CONSTRAINT "PositionHistory_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 11. Drop old position TEXT columns
ALTER TABLE "User" DROP COLUMN "position";
ALTER TABLE "PositionHistory" DROP COLUMN "position";
