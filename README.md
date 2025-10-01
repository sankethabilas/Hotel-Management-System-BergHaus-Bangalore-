# BergHaus Hotel Management

Monorepo with `backend` (Express + MongoDB) and `frontend` (React + Vite).

## Prerequisites
- Node.js 18+
- MongoDB connection string

## Backend
1. Create `backend/.env` with:
   - `PORT=5000`
   - `MONGO_URI=mongodb://localhost:27017/berghaus`
2. Install and run:
   - `cd backend`
   - `npm install`
   - `npm run dev`

Health check: `GET http://localhost:5000/api/health`

## Frontend
1. Create `frontend/.env` with:
   - `VITE_API_BASE=http://localhost:5000/api`
2. Install and run:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Open `http://localhost:5173`.

## Example Feature
- Simple Example entity with name and description
- Endpoints: `GET /api/examples`, `POST /api/examples`
