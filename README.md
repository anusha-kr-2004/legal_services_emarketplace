## Legal Services eMarketplace (MERN)

### Run locally

1) Backend

```
cd server
copy .env.example .env  # create .env and adjust if needed
npm run dev
```

Required env in `server/.env`:

- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/legal_emarketplace`
- `JWT_SECRET=change_this_in_production`
- `CLIENT_ORIGIN=http://localhost:5173`

2) Frontend

```
cd client
copy .env.example .env  # or set VITE_API_URL
npm run dev
```

Required env in `client/.env`:

- `VITE_API_URL=http://localhost:5000`

### Features scaffolded

- Express API with health check `/health`
- MongoDB connection (Mongoose)
- Basic auth routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Vite + React app with API connectivity indicator






