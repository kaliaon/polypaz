# Polypaz

A mobile learning app with a Django REST backend and a React Native (Expo) mobile frontend.

## Prerequisites

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 16](https://www.postgresql.org/download/) or [Docker](https://docs.docker.com/get-docker/)
- [Expo Go](https://expo.dev/go) app on your phone

## Project Structure

```
polypaz/
├── backend/          # Django REST API
│   ├── accounts/     # User authentication
│   ├── learning/     # Learning module
│   └── manage.py
└── mobile/           # React Native (Expo) app
    └── src/
```

## Setup

### 1. Backend

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Linux / macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

#### Database (PostgreSQL)

Option A — using Docker:

```bash
docker compose up -d
```

Option B — use a local PostgreSQL instance and create a database called `polypaz_db`.

#### Environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DB_PASSWORD` | PostgreSQL password (`postgres` if using docker-compose) |
| `GEMINI_API_KEY` | Google Gemini API key (for AI features) |
| `ALLOWED_HOSTS` | Add your local IP if accessing from a phone |

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

> Use `0.0.0.0:8000` so the API is accessible from your phone on the same network.

### 2. Mobile

```bash
cd mobile
npm install
```

#### Environment variables

```bash
cp .env.example .env
```

Set `API_BASE_URL` to your machine's local IP:

```
API_BASE_URL=http://192.168.x.x:8000
```

> Find your IP: `ip addr` (Linux) / `ipconfig` (Windows) / `ifconfig` (macOS). Your phone and computer must be on the same Wi-Fi network.

Start the Expo dev server:

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone.

## Quick Reference

| Command | Description |
|---|---|
| `python manage.py runserver 0.0.0.0:8000` | Start backend |
| `npx expo start` | Start mobile app |
| `python manage.py makemigrations && python manage.py migrate` | Apply DB changes |
| `docker compose up -d` | Start PostgreSQL via Docker |
