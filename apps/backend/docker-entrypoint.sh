#!/bin/sh
set -eu

# Applies pending Prisma migrations before the API starts, so a rollout needs no
# separate `prisma migrate deploy` step. A failed migration exits non-zero: the
# new pod never becomes ready and the previous one keeps serving traffic.
#
# Concurrent replicas are safe: `migrate deploy` serialises on a Postgres
# advisory lock and skips migrations another pod has already applied.
#
# Set RUN_MIGRATIONS=false to skip, e.g. when a risky migration is applied by
# hand after a pg_dump.
case "${RUN_MIGRATIONS:-true}" in
  true)
    node node_modules/prisma/build/index.js migrate deploy \
      --schema apps/backend/prisma/schema.prisma
    ;;
  false)
    echo "RUN_MIGRATIONS=false: skipping prisma migrate deploy"
    ;;
  *)
    echo "RUN_MIGRATIONS must be 'true' or 'false'" >&2
    exit 1
    ;;
esac

# exec, so node replaces the shell as PID 1 and receives SIGTERM directly.
exec node --max-http-header-size=81920 apps/backend/dist/src/main.js
