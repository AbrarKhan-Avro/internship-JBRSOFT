FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies (for psycopg2 & PostgreSQL)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files (will copy after we create Django project)
COPY . .

EXPOSE 8000
