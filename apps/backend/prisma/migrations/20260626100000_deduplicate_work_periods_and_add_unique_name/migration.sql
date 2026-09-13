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

-- 2. Expand canonical work periods to encompass the widest date range (MIN(startDate) and MAX(endDate)) across duplicates
WITH period_bounds AS (
  SELECT
    name,
    MIN("startDate") AS min_start,
    MAX("endDate") AS max_end
  FROM "WorkPeriod"
  GROUP BY name
),
canonical_periods AS (
  SELECT id, name FROM (
    SELECT 
      id, 
      name,
      ROW_NUMBER() OVER (
        PARTITION BY name 
        ORDER BY (SELECT COUNT(*) FROM "Log" WHERE "Log"."workPeriodId" = "WorkPeriod".id) DESC, id ASC
      ) as rn
    FROM "WorkPeriod"
  ) sub
  WHERE rn = 1
)
UPDATE "WorkPeriod"
SET 
  "startDate" = b.min_start,
  "endDate" = b.max_end
FROM canonical_periods c
JOIN period_bounds b ON c.name = b.name
WHERE "WorkPeriod".id = c.id;

-- 3. Delete duplicate work periods (now with 0 logs)
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

-- 4. Create unique index on WorkPeriod(name)
CREATE UNIQUE INDEX "WorkPeriod_name_key" ON "WorkPeriod"("name");
