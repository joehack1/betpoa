# BetPOA - Sports Betting Platform

A modern sports betting platform built with Django REST Framework backend and React frontend. Users can view live and upcoming matches, place bets on football matches, and track their betting history.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Live Matches**: View current and upcoming football matches from various leagues
- **Betting System**: Place bets on match outcomes (Home, Draw, Away) with odds
- **Wallet Management**: Track coins and betting balance
- **Bet History**: View all placed bets and their results
- **Responsive Design**: Modern UI with dark theme and orange accents

## Tech Stack

### Backend
- **Django** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database (configurable)
- **JWT** - Authentication
- **TheSportsDB API** - External match data source

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS** - Custom styling with dark theme

## Project Structure

```
betpoa/
├── backend/                 # Django backend
│   ├── betproject/         # Django project settings
│   ├── api/                # Main API app
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API endpoints
│   │   ├── serializers.py  # Data serialization
│   │   └── urls.py         # URL routing
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # React components (pages)
│   │   ├── styles/        # CSS stylesheets
│   │   ├── App.jsx        # Main app component
│   │   ├── api.js         # API client configuration
│   │   └── main.jsx       # App entry point
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
└── README.md              # This file
```

## Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite works for development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Register/Login**: Create an account or login to access betting features
2. **View Matches**: Browse live and upcoming matches on the Matches page
3. **Place Bets**: Click on betting options (Home/Draw/Away) and enter bet amount
4. **Check Balance**: View your coin balance in the Profile or via API
5. **Bet History**: Review your betting history on the My Bets page

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (JWT)

### Matches & Betting
- `GET /api/matches/` - List unfinished matches
- `POST /api/matches/` - Create new match
- `POST /api/bets/` - Place a bet
- `GET /api/bets/` - List user's bets
- `GET /api/wallet/` - Get user's coin balance

### External Data
- `GET /api/openliga/{league}/{season}/` - Fetch matches from TheSportsDB

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/betpoa
```

### Database

The project uses SQLite by default for development. For production, configure PostgreSQL in `settings.py`.

## Development

### Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests (if configured)
cd frontend
npm test
```

### Code Style

- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use consistent React patterns and ES6+ syntax

## Deployment

### Backend Deployment

1. Set `DEBUG=False` in settings
2. Configure production database
3. Collect static files: `python manage.py collectstatic`
4. Use a WSGI server like Gunicorn

### Frontend Deployment

1. Build the app: `npm run build`
2. Serve the `dist/` folder with a static server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
