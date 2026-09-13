-- 1. Reassign logs from duplicate work periods to the canonical work period (the one with the most logs, or lowest id)
WITH ranked_periods AS (
  SELECT 
    id, 
    name,
    ROW_NUMBER() OVER (
      PARTITION BY name 
      ORDER BY (SELECT COUNT(*) FROM "Log" WHERE "Log"."workPeriodId" = "WorkPeriod".id) DESC, id ASC
    ) as rn
  FROM "WorkPeriod"
),
canonical_periods AS (
  SELECT id as canonical_id, name
  FROM ranked_periods
  WHERE rn = 1
),
duplicate_periods AS (
  SELECT r.id as duplicate_id, c.canonical_id
  FROM ranked_periods r
  JOIN canonical_periods c ON r.name = c.name
  WHERE r.rn > 1
)
UPDATE "Log"
SET "workPeriodId" = duplicate_periods.canonical_id
FROM duplicate_periods
WHERE "Log"."workPeriodId" = duplicate_periods.duplicate_id;

-- 2. Delete duplicate work periods (now with 0 logs)
DELETE FROM "WorkPeriod"
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id, 
      ROW_NUMBER() OVER (
        PARTITION BY name 
        ORDER BY (SELECT COUNT(*) FROM "Log" WHERE "Log"."workPeriodId" = "WorkPeriod".id) DESC, id ASC
      ) as rn
    FROM "WorkPeriod"
  ) sub 
  WHERE rn > 1
);

-- 3. Create unique index on WorkPeriod(name)
CREATE UNIQUE INDEX "WorkPeriod_name_key" ON "WorkPeriod"("name");
