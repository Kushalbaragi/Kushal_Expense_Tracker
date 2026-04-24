# Kushal Expense Tracker

Minimal personal expense tracker — dark UI, liquid glass design, ₹ currency.

## Structure

```
expense-tracker/       React + Vite frontend
expense-tracker-api/   Express.js REST API backend
```

---

## Local Development

### Frontend
```bash
cd expense-tracker
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd expense-tracker-api
npm install
npm run dev          # http://localhost:3001
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions` | List all (filter: `?type=expense\|income`) |
| GET | `/api/transactions/:id` | Get by id |
| POST | `/api/transactions` | Create — body: `{ type, amount, date, description }` |
| DELETE | `/api/transactions/:id` | Delete by id |
| GET | `/health` | Liveness check |

---

## Hostinger Deployment

### Frontend (Shared Hosting / Static)
```bash
cd expense-tracker
npm install
npm run build        # generates dist/
```
Upload the contents of `dist/` to your Hostinger `public_html` via File Manager or FTP.
The `.htaccess` in `public/` handles SPA routing (all routes → `index.html`).

### Backend (VPS or Node.js Hosting)
```bash
cd expense-tracker-api
npm install
PORT=3001 npm start
```
Set the `PORT` environment variable in your Hostinger Node.js hosting panel.
Update the frontend API base URL to point to your live backend domain.
