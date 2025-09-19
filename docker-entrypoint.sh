#!/bin/sh

set -e

echo "Waiting for PostgreSQL database to be ready..."
until nc -z db 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up and running."

# Run Drizzle migrations.
echo "Running Drizzle migrations..."
npx drizzle-kit migrate

echo "Migrations applied successfully."

# The "$@" represents all arguments passed to the entrypoint.
# This allows 'npm start' to be passed as an argument from CMD.
exec "$@"
