# React + Django Betting Starter (Virtual Coins)

This archive contains a minimal starter project with a Django backend (REST API) and a React frontend.

## Quick start (development)

1. Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# mac/linux
# source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # create admin to add matches
python manage.py runserver
```

2. Frontend
```bash
cd frontend
npm install
npm start
```

API base URL used by the React app: http://127.0.0.1:8000/api/

This starter uses virtual coins only (no real money). Seed matches via Django admin, login via JWT token endpoint.
