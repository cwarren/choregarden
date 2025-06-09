#!/bin/sh
set -e

# Copy certs to a writeable location
cp /var/lib/postgresql/certs/server.crt /tmp/server.crt
cp /var/lib/postgresql/certs/server.key /tmp/server.key
chmod 600 /tmp/server.key
chown 999:999 /tmp/server.key /tmp/server.crt

# Start Postgres in the background with SSL using the copied certs
/usr/local/bin/docker-entrypoint.sh postgres \
  -c ssl=on \
  -c ssl_cert_file=/tmp/server.crt \
  -c ssl_key_file=/tmp/server.key &

# Wait for Postgres to be ready
sleep 5

# Create app user if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='${APP_DB_USER}';" | grep -q 1 || \
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE USER \"${APP_DB_USER}\" WITH PASSWORD '${APP_DB_PASSWORD}';"

# Create app database if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}';" | grep -q 1 || \
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"${POSTGRES_DB}\";"

# Grant privileges
psql -U "$POSTGRES_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"${POSTGRES_DB}\" TO \"${APP_DB_USER}\";"

# Wait for background Postgres
wait
