FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer output
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory inside container
WORKDIR /code

# Install system dependencies:
# - build-essential and libpq-dev are needed for psycopg2 (Postgres driver)
# - netcat-openbsd is used in entrypoint to wait for DB
RUN apt-get update \
  && apt-get install -y build-essential libpq-dev netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /code/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r /code/requirements.txt

# Copy all backend source code into container
COPY . /code/

# Ensure entrypoint is executable
RUN chmod +x /code/entrypoint.sh

# Start container with entrypoint
ENTRYPOINT ["/code/entrypoint.sh"]
