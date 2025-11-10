# Full-Stack Starter Template

This is a starter template for full-stack web applications, featuring a Django backend and a Vue 3 frontend with Tailwind CSS.

## Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest stable version recommended

## Project Structure

```
starter/
├── backend/             # Django backend
│   ├── backend/         # Django project settings
│   ├── venv/            # Python virtual environment
│   └── manage.py        # Django management script
├── frontend/            # Vue 3 frontend
│   ├── src/             # Vue source files
│   ├── public/          # Static assets
│   └── package.json     # Node.js dependencies
├── start.sh             # Startup script for Unix-like systems
└── start.bat            # Startup script for Windows
```

## Getting Started

### Installation

1. Clone this repository:

   ```
   git clone <repository-url>
   cd starter
   ```

2. **Backend Setup**:

   ```
   cd backend
   python -m venv venv
   ```

   - On Windows:

     ```
     venv\Scripts\activate
     ```

   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

   Then install dependencies:

   ```
   pip install -r requirements.txt
   python manage.py migrate
   ```

3. **Frontend Setup**:
   ```
   cd frontend
   npm install
   ```

### Running the Application

#### Using the Start Scripts

- **On Windows**:

  ```
  start.bat
  ```

- **On macOS/Linux**:
  ```
  chmod +x start.sh  # Make the script executable (first time only)
  ./start.sh
  ```

#### Manual Start

1. **Start the Backend**:

   ```
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python manage.py runserver
   ```

2. **Start the Frontend** (in a separate terminal):
   ```
   cd frontend
   npm run dev
   ```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Features

- Django backend with REST API capabilities
- Vue 3 frontend with TypeScript
- Tailwind CSS for styling
- Modern development setup with hot reloading

## Development

### Backend

- Create Django apps in the `backend` directory
- Run migrations with `python manage.py makemigrations` followed by `python manage.py migrate`

### Frontend

- Component-based architecture with Vue 3
- Tailwind CSS for utility-first styling
- TypeScript for type safety

## Deployment

This starter is configured for development. For production deployment:

1. Set `DEBUG = False` in Django settings
2. Configure proper environment variables for secrets
3. Build the Vue frontend with `npm run build`
4. Serve the Django application with a production WSGI server like Gunicorn
5. Set up a reverse proxy like Nginx

## License

[MIT License](LICENSE)
