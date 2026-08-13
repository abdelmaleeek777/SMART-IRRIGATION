# Smart Irrigation

Smart Irrigation is a full-stack application for managing agricultural farms and parcels, viewing weather conditions, and generating irrigation recommendations.

## Features

- Farmer registration, email verification, login, and JWT authentication.
- Farm (*exploitation*) management.
- Parcel management with location, area, and crop/soil information.
- Interactive parcel maps using Leaflet.
- Weather dashboard for the selected parcel.
- Irrigation recommendations and recommendation history.
- Dashboard filters for farms and parcels, including a seven-day water-recommendation chart.

## Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Leaflet, Framer Motion.
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL.

## Project structure

```text
SMART_IRREGATON/
├── backend/                 # FastAPI API and database migrations
├── frontend/                # React/Vite web application
├── irregation_db.sql        # PostgreSQL schema reference
└── README.md
```

## Requirements

- Node.js 18+
- Python 3.10+
- PostgreSQL

## Setup

### 1. Database

Create a PostgreSQL database, then configure the backend environment variables in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/smart_irrigation
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run migrations from the `backend` directory:

```bash
alembic upgrade head
```

Alternatively, `irregation_db.sql` is available as a schema reference.

### 2. Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

The API is available at `http://127.0.0.1:8003` and Swagger documentation is available at `http://127.0.0.1:8003/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

The frontend API base URL is currently configured in `frontend/src/services/api.js` as `http://127.0.0.1:8003`.

## Main API routes

| Area | Example routes |
| --- | --- |
| Authentication | `/auth/register`, `/auth/login`, `/auth/me` |
| Farms | `/exploitations/`, `/exploitations/{id}` |
| Parcels | `/parcelles/`, `/parcelles/{id}` |
| Recommendations | `/recommendation/parcels`, `/recommendation/predict`, `/recommendation/history/{parcelId}` |

Most API routes require an `Authorization: Bearer <token>` header after login.

## Production build

```bash
cd frontend
npm run build
```

## Notes

- The backend CORS configuration permits Vite development servers on ports `5173`, `5174`, and `5175`.
- Irrigation-history data is scoped to the authenticated farmer's parcels.
