# WeOwe – Smart Expense Splitter

**Split Expenses, Not Friendships.**

A full-stack MERN expense splitting application for groups, friends, and settlements.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, React Hook Form + Zod
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** JWT

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Backend

```bash
cd server
cp .env.example .env   # Configure MONGODB_URI and JWT secrets
npm install
npm run seed         # Optional: seed test data
npm run dev          # http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

### Test Login (after seeding)

- Email: `anika@weoowe.com`
- Password: `password123`

## Project Structure

```
weoowe/
├── client/     React + Vite frontend
├── server/     Express API
└── README.md
```

## API Health Check

`GET http://localhost:5000/api/health`

## Deployment

- Frontend → Vercel (`VITE_API_URL` env var)
- Backend → Render (all server `.env` variables)
- Database → MongoDB Atlas
