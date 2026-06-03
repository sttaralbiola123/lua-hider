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

// ── Custom Access Denied Page (Natural & Funny) ─────────────────────────────
function getAccessDeniedPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
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
      position: relative;
      overflow-x: hidden;
      padding: 20px;
    }
    
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: 0;
    }
    
    @keyframes glitch {
      0%, 100% { transform: translate(0); opacity: 1; }
      20% { transform: translate(-2px, 1px); }
      40% { transform: translate(-1px, -1px); }
      60% { transform: translate(1px, 1px); }
      80% { transform: translate(1px, -1px); }
    }
    
    .container {
      max-width: 650px;
      width: 100%;
      padding: 30px 25px;
      text-align: center;
      z-index: 1;
      position: relative;
      background: rgba(17, 19, 24, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 71, 87, 0.3);
      border-radius: 20px;
      animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    h1 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(28px, 6vw, 48px);
      font-weight: 800;
      margin-bottom: 15px;
      letter-spacing: -1px;
      animation: glitch 0.3s ease infinite;
    }
    
    .emoji-big {
      font-size: clamp(50px, 15vw, 80px);
      margin-bottom: 15px;
      display: inline-block;
      animation: bounce 1s ease infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    p {
      font-size: clamp(14px, 4vw, 16px);
      margin: 12px 0;
      line-height: 1.6;
      color: #c8cdd8;
    }
    
    .highlight { color: #e8ff47; font-weight: bold; }
    
    .code-block {
      background: #0a0c0f;
      border: 1px solid #1e222b;
      border-radius: 10px;
      padding: 12px 15px;
      margin: 20px 0;
      font-size: clamp(11px, 3vw, 13px);
      color: #47ffb2;
      text-align: left;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    
    .warning-box {
      background: rgba(255, 71, 87, 0.1);
      border-left: 3px solid #ff4757;
      padding: 12px 15px;
      margin: 20px 0;
      text-align: left;
      font-size: clamp(12px, 3.5vw, 13px);
      border-radius: 0 8px 8px 0;
    }
    
    .funny-list {
      text-align: left;
      display: inline-block;
      margin: 15px 0;
      color: #6b7280;
      font-size: clamp(12px, 3.5vw, 13px);
      width: 100%;
    }
    
    .funny-list li {
      margin: 10px 0;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .funny-list li::before {
      content: "💀";
      color: #ff4757;
    }
    
    a {
      color: #47ffb2;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
      padding: 12px 24px;
      border: 1px solid #47ffb2;
      border-radius: 10px;
      transition: all 0.2s ease;
      font-weight: bold;
      font-size: clamp(13px, 4vw, 14px);
    }
    
    a:hover {
      background: rgba(71, 255, 178, 0.1);
      transform: translateX(-5px);
    }
    
    .footer {
      margin-top: 30px;
      font-size: 10px;
      color: #3a3f4e;
      border-top: 1px solid #1e222b;
      padding-top: 20px;
      line-height: 1.5;
    }
    
    .blink { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji-big">💀</div>
    <h1>BRO, WHAT ARE YOU DOING HERE???</h1>
    
    <p>You really tryna <span class="highlight">steal my code</span>? 😂</p>
    <p>Go make your own script, stop being lazy 💀</p>
    
    <div class="code-block">
      ⚠️ ERROR: Unauthorized access detected ⚠️<br>
      > IP address logged<br>
      > Browser access blocked<br>
      > Only Roblox executors allowed
    </div>
    
    <div class="warning-box">
      <strong>🔒 REAL TALK:</strong><br>
      Even if you visit this, it won't work in your browser anyway.<br>
      Nice try though, clown 🤡
    </div>
    
    <ul class="funny-list">
      <li>You're not using a Roblox executor</li>
      <li>You can't run Lua in a normal browser</li>
      <li>Stop trying to steal scripts</li>
      <li>This page is protected by <span class="blink">Sttar Albiola</span> 😎</li>
    </ul>
    
    <a href="/">
      ← Go back before I crash your PC <span style="font-size:11px">(jk... or am I?)</span>
    </a>
    
    <div class="footer">
      LuaBin — Made by Sttar Albiola<br>
      For Roblox executors only • Browsers = 🤡
    </div>
  </div>
</body>
</html>`;
}

// ── Routes (rest of your code remains the same) ─────────────────────────────

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

app.get("/raw/lua/:id/download", async (req, res) => {
  const { id } = req.params;
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  const browserSignals = ["mozilla", "chrome", "safari", "edge", "gecko", "webkit"];
  const isBrowser = browserSignals.some((signal) => userAgent.includes(signal));
  const isAllowed = !isBrowser || userAgent.includes("roblox");

  if (!isAllowed) {
    return res.status(404).type("text/html").send(getAccessDeniedPage());
  }

  if (!/^[A-Za-z0-9]{8}$/.test(id)) {
    return res.status(404).type("text/html").send(getAccessDeniedPage());
  }

  const endpoint = `\( {SUPABASE_URL}/rest/v1/scripts?id=eq. \){encodeURIComponent(id)}&select=code&limit=1`;

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
      return res.status(404).type("text/html").send(getAccessDeniedPage());
    }

    res.set({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    return res.status(200).send(rows[0].code);
  } catch (err) {
    console.error("Unexpected download error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀  Roblox Lua Pastebin running at http://localhost:${PORT}`);
});
