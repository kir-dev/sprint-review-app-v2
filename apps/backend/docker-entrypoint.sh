#!/bin/sh
set -eu -o pipefail

# Applies pending Prisma migrations before the API starts, so a rollout needs no
# separate `prisma migrate deploy` step. A failed migration exits non-zero: the
# new pod never becomes ready and the previous one keeps serving traffic.
#
# Set RUN_MIGRATIONS=false to skip, e.g. when a risky migration is applied by
# hand after a pg_dump.

MIGRATE_ATTEMPTS=6
MIGRATE_RETRY_DELAY_SECONDS=5

# A stop signal is deliberately NOT forwarded to Prisma: interrupting a
# migration midway leaves a failed record that needs `prisma migrate resolve`.
# The shell runs this trap only once the foreground migration has finished, and
# then exits instead of starting the API. A migration that outlasts the pod's
# terminationGracePeriodSeconds is still SIGKILLed, so run long ones by hand.
stop_requested=false
trap 'stop_requested=true' TERM INT

migrate() {
  node node_modules/prisma/build/index.js migrate deploy \
    --schema apps/backend/prisma/schema.prisma 2>&1
}

run_migrations() {
  attempt=1
  log=$(mktemp)
  # Concurrent replicas serialise on a Postgres advisory lock, but Prisma gives
  # up waiting for it after 10s. Only that timeout is retried; any other
  # failure is fatal. tee streams progress to the pod log while keeping a copy
  # to inspect; pipefail keeps Prisma's exit status.
  until migrate | tee "$log"; do
    case "$(cat "$log")" in
      *"advisory lock"*) ;;
      *) exit 1 ;;
    esac
    if [ "$stop_requested" = true ] || [ "$attempt" -ge "$MIGRATE_ATTEMPTS" ]; then
      echo "Giving up waiting for the migration lock" >&2
      exit 1
    fi
    attempt=$((attempt + 1))
    echo "Another replica holds the migration lock; retrying ($attempt/$MIGRATE_ATTEMPTS)"
    sleep "$MIGRATE_RETRY_DELAY_SECONDS"
  done
  rm -f "$log"
}

case "${RUN_MIGRATIONS:-true}" in
  true)
    run_migrations
    ;;
  false)
    echo "RUN_MIGRATIONS=false: skipping prisma migrate deploy"
    ;;
  *)
    echo "RUN_MIGRATIONS must be 'true' or 'false'" >&2
    exit 1
    ;;
esac

if [ "$stop_requested" = true ]; then
  echo "Stop requested during migrations; not starting the API"
  exit 143
fi

# exec, so node replaces the shell as PID 1 and receives SIGTERM directly.
exec node --max-http-header-size=81920 apps/backend/dist/src/main.js
