# Kushal Expense Tracker

Minimal personal expense tracker — dark UI, liquid glass design, ₹ currency. React + Vite frontend, Supabase for auth and data.

## Local Development

```bash
cd expense-tracker
npm install
npm run dev          # http://localhost:5173
```

Requires a `.env` in `expense-tracker/` with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Hostinger Deployment (Shared Hosting / Static)

```bash
cd expense-tracker
npm install
npm run build        # generates dist/
```

Upload the contents of `dist/` to your Hostinger `public_html` via File Manager or FTP.
The `.htaccess` in `public/` handles SPA routing (all routes → `index.html`).
