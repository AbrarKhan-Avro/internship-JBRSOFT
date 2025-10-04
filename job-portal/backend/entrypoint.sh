#!/bin/sh
set -e

# Default DB host and port if not set
DB_HOST=${DJANGO_DB_HOST:-db}
DB_PORT=${DJANGO_DB_PORT:-5432}

# Wait for database to be ready
echo "Waiting for database at $DB_HOST:$DB_PORT..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.5
done
echo "Database is available."

# Apply migrations
echo "Applying Django migrations..."
python manage.py migrate --noinput

# Collect static files (optional, useful for production later)
# python manage.py collectstatic --noinput

# Start Django dev server
echo "Starting Django server on 0.0.0.0:8000..."
exec python manage.py runserver 0.0.0.0:8000
