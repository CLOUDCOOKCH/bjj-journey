#!/usr/bin/env bash
set -Eeuo pipefail

: "${NEXTAUTH_SECRET:?Set NEXTAUTH_SECRET}"
: "${NEXTAUTH_URL:?Set NEXTAUTH_URL}"

if [[ $(id -u) == 0 ]]; then
  install -d -o postgres -g postgres -m 0700 "$PGDATA" "$PGHOST"
  exec gosu postgres "$0" "$@"
fi

# Use a private Unix socket. The bundled database never listens on TCP.
unset DATABASE_URL
if [[ ! -s "$PGDATA/PG_VERSION" ]]; then
  initdb --pgdata="$PGDATA" --username="$PGUSER" --auth-local=trust --auth-host=reject
fi

postgres -D "$PGDATA" -c listen_addresses= -c "unix_socket_directories=$PGHOST" -c unix_socket_permissions=0700 &
database_pid=$!
app_pid=

cleanup() {
  trap - EXIT TERM INT
  if [[ -n $app_pid ]]; then
    kill -TERM "$app_pid" 2>/dev/null || true
    wait "$app_pid" || true
  fi
  if kill -0 "$database_pid" 2>/dev/null; then
    kill -INT "$database_pid"
  fi
  wait "$database_pid" || true
}
trap cleanup EXIT
trap 'exit 0' TERM INT

for ((attempt = 0; attempt < 60; attempt++)); do
  if pg_isready --quiet --dbname=postgres; then break; fi
  if ! kill -0 "$database_pid" 2>/dev/null; then exit 1; fi
  sleep 1
done
pg_isready --quiet --dbname=postgres

if [[ $(psql --no-psqlrc --dbname=postgres -v ON_ERROR_STOP=1 -Atc "SELECT 1 FROM pg_database WHERE datname = 'bjj_journey'") != 1 ]]; then
  createdb bjj_journey
fi

node /opt/bjj-init/scripts/migrate-training.mjs --apply
node /opt/bjj-init/scripts/seed-training-catalog.mjs --apply

"$@" &
app_pid=$!
wait -n "$app_pid" "$database_pid"
