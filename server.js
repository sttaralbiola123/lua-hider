const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Environment Variables ───────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌  Missing environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required."
  );
  process.exit(1);
}

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateId(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

// ── Custom Access Denied Page for Browsers ─────────────────────────────────
function getAccessDeniedPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚫 ACCESS DENIED | LuaBin</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0c0f;
      color: #ff4757;
      font-family: 'JetBrains Mono', monospace;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
    }
    .container {
      max-width: 600px;
      width: 100%;
      padding: 40px 30px;
      text-align: center;
      background: rgba(17, 19, 24, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 71, 87, 0.3);
      border-radius: 20px;
    }
    h1 {
      font-family: 'Syne', sans-serif;
      font-size: 48px;
      margin-bottom: 20px;
    }
    .emoji-big { font-size: 80px; margin-bottom: 15px; }
    p { font-size: 16px; margin: 12px 0; color: #c8cdd8; }
    .highlight { color: #e8ff47; font-weight: bold; }
    .code-block {
      background: #0a0c0f;
      border: 1px solid #1e222b;
      border-radius: 10px;
      padding: 15px;
      margin: 20px 0;
      font-size: 12px;
      color: #47ffb2;
      text-align: left;
    }
    a {
      color: #47ffb2;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
      padding: 12px 28px;
      border: 1px solid #47ffb2;
      border-radius: 10px;
      transition: 0.2s;
    }
    a:hover { background: rgba(71, 255, 178, 0.1); }
    .footer { margin-top: 30px; font-size: 10px; color: #3a3f4e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji-big">💀</div>
    <h1>BRO, WHAT YOU DOING HERE???</h1>
    <p>You tryna <span class="highlight">steal my code</span>? Lol 🤣</p>
    <p>Make your <span class="highlight">own script</span>, lazy ahh 💀</p>
    <div class="code-block">
      ⚠️ ERROR: Unauthorized access detected ⚠️<br>
      > Your IP has been logged<br>
      > Your browser is not allowed here<br>
      > Only Roblox executors can access this
    </div>
    <a href="/">← Go back before I crash your PC (jk)</a>
    <div class="footer">LuaBin — For Roblox executors only</div>
  </div>
</body>
</html>`;
}

// ── Check if request is from browser or executor ───────────────────────────
function isBrowserRequest(userAgent) {
  const ua = userAgent.toLowerCase();
  // Block these browser signatures
  const browserSignals = ["mozilla", "chrome", "safari", "edge", "webkit", "firefox", "opera", "brave"];
  // Allow these executor signatures (Roblox and common executors)
  const executorSignals = ["roblox", "krnl", "synapse", "delta", "script-ware", "scriptware", "electron", "celery", "oxygen", "fluxus"];
  
  const isBrowser = browserSignals.some(signal => ua.includes(signal));
  const isExecutor = executorSignals.some(signal => ua.includes(signal));
  
  // If empty user agent or clearly an executor, allow
  if (ua.length === 0 || isExecutor) {
    return false; // NOT a browser
  }
  
  return isBrowser && !isExecutor;
}

// ── POST /api/upload ─────────────────────────────────────────────────────────
app.post("/api/upload", async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return res.status(400).json({ error: "No code provided." });
  }

  const id = generateId(8);
  const endpoint = `${SUPABASE_URL}/rest/v1/scripts`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ id, code: code.trim() }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Supabase insert error:", response.status, errorBody);
      return res.status(500).json({ error: "Failed to save script." });
    }

    const downloadUrl = `/raw/lua/${id}/download`;
    return res.status(200).json({ url: downloadUrl });
  } catch (err) {
    console.error("Unexpected upload error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ── GET /raw/lua/:id/download ────────────────────────────────────────────────
app.get("/raw/lua/:id/download", async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers["user-agent"] || "";
  
  // Check if browser (block) or executor (allow)
  if (isBrowserRequest(userAgent)) {
    console.log(`🚫 Blocked browser request for script: ${id} - UA: ${userAgent.substring(0, 100)}`);
    return res.status(404).type("text/html").send(getAccessDeniedPage());
  }

  // Validate ID format (8 alphanumeric characters)
  if (!/^[A-Za-z0-9]{8}$/.test(id)) {
    return res.status(404).send("Not Found");
  }

  const endpoint = `${SUPABASE_URL}/rest/v1/scripts?id=eq.${encodeURIComponent(id)}&select=code&limit=1`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: supabaseHeaders(),
    });

    if (!response.ok) {
      console.error("Supabase fetch error:", response.status);
      return res.status(500).send("Internal Server Error");
    }

    const rows = await response.json();

    if (!rows || rows.length === 0) {
      return res.status(404).send("Not Found");
    }

    // Return raw Lua code (no HTML wrapper)
    res.set({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    });

    return res.status(200).send(rows[0].code);
  } catch (err) {
    console.error("Unexpected download error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// ── Fallback: serve index.html for any unmatched GET ────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Roblox LuaBin running at http://localhost:${PORT}`);
  console.log(`✅ Allowed executors: Roblox, Krnl, Synapse, Delta, ScriptWare, Fluxus, Electron, Celery, Oxygen`);
  console.log(`🚫 Browsers are blocked with funny page`);
});
