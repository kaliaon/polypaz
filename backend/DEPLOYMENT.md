# Backend Deployment and Seeding Guide

This guide provides instructions for setting up and deploying the PolyPath backend.

## Prerequisites

- Python 3.10+
- PostgreSQL
- Redis
- Docker (optional, but recommended for database and cache)

## Local Development Setup

### 1. Environment Configuration

Clone the repository and navigate to the `backend` directory:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and provide the following:
- `SECRET_KEY`: A unique random string.
- `GEMINI_API_KEY`: Your Google Gemini API key.
- Database and Redis credentials if not using defaults.

### 2. Database and Cache Setup

If you have Docker installed, you can start PostgreSQL using the provided `docker-compose.yml`:

```bash
docker-compose up -d postgres
```

> [!NOTE]
> If you don't use Docker, ensure you have a running PostgreSQL instance and a Redis server, and update the `.env` accordingly.

### 3. Migrations

Run Django migrations to set up the database schema:

```bash
python manage.py migrate
```

### 4. Seeding Data

To populate the database with initial mock data (Placement Tests, Roadmaps, Tasks, and Dialogue Scenarios), run the following command:

```bash
python manage.py seed_stage_1_data
```

This command runs several internal seeding scripts:
- `seed_placement_tests`: Sets up initial tests for English, Kazakh, etc.
- `seed_roadmaps`: Creates fallback roadmap templates.
- `seed_tasks`: Populates modules with sample tasks.
- `seed_dialogues`: Adds initial dialogue scenarios.

## Production Deployment

### 1. Production Settings

In production, ensure the following in your `.env`:
- `DEBUG=False`
- `ALLOWED_HOSTS`: Set to your domain or server IP.
- `CORS_ALLOWED_ORIGINS`: Set to your frontend domain.

### 2. Static Files

Collect static files for the admin interface and API docs:

```bash
python manage.py collectstatic
```

### 3. Running with Gunicorn

For production, it is recommended to use Gunicorn:

```bash
pip install gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### 4. Reverse Proxy

Set up Nginx or another reverse proxy to serve the application and handle HTTPS.

## Seeding Commands reference

If you need to run specific seeding scripts individually:

- `python manage.py seed_placement_tests`
- `python manage.py seed_tasks`
- `python manage.py seed_dialogue_scenarios`
