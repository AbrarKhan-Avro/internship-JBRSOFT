FROM python:3.11-slim

# Basic system deps
RUN apt-get update && apt-get install -y build-essential libpq-dev curl git --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements first to leverage docker cache during development
COPY requirements.txt /app/requirements.txt

RUN pip install --upgrade pip \
    && pip install -r /app/requirements.txt

# Copy rest of project (will be empty initially; we will create the Django project from container)
COPY . /app

# Expose Django default port (container)
EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput || true && python manage.py runserver 0.0.0.0:8000"]
