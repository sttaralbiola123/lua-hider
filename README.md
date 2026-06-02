# LuaBin — Roblox Lua Script Hosting

A lightweight, self-hostable Pastebin for Roblox Lua scripts.
Scripts are blocked from browser access and only served to executor-like clients.

---

## Folder Structure

```
roblox-pastebin/
├── public/
│   └── index.html        # Dark-themed frontend
├── server.js             # Express backend + API routes
├── package.json
├── supabase_setup.sql    # Run once in Supabase SQL Editor
├── .env.example          # Copy → .env and fill in values
└── .gitignore
```

---

## 1. Supabase Setup

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `supabase_setup.sql`
3. Note your **Project URL** and **anon/public API key**
   (Project Settings → API)

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Supabase URL and key

# Load .env and start with hot-reload
npx dotenv -e .env -- npm run dev
# OR just:
npm run dev   # if your shell already has the vars exported
```

Visit http://localhost:3000

---

## 3. Deployment

### Render (recommended free tier)

1. Push your repo to GitHub (make sure `.env` is in `.gitignore`)
2. New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in the **Environment** tab:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Railway

1. New Project → Deploy from GitHub repo
2. Add variables under **Variables** tab
3. Railway auto-detects `npm start`

### Vercel (serverless caveat)

Vercel works but requires converting `server.js` into `/api/` route files
(serverless functions). For simplest deployment use Render or Railway instead.

### VPS (Ubuntu/Debian)

```bash
# Install Node 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and install
git clone <your-repo> luabin && cd luabin
npm install

# Set environment variables
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_ANON_KEY="your_key"

# Run with PM2 for persistence
npm install -g pm2
pm2 start server.js --name luabin
pm2 save && pm2 startup
```

---

## 4. Using in Roblox

```lua
-- In your executor, use the full download URL:
loadstring(game:HttpGet("https://your-domain.com/raw/lua/XXXXXXXX/download"))()
```

Direct browser requests to `/raw/lua/:id/download` return **404**.
Only clients without browser User-Agent strings (like Roblox executors) receive the script.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload` | Upload a script. Body: `{ "code": "..." }`. Returns `{ "url": "/raw/lua/XXXXXXXX/download" }` |
| `GET`  | `/raw/lua/:id/download` | Download script as `text/plain`. Blocked for browsers. |
