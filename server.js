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

/**
 * Generate a random alphanumeric ID of the given length.
 */
function generateId(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Shared Supabase REST headers.
 */
function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
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
        Prefer: "return=minimal", // Don't return the full row — faster
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
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  // Block browser requests — only allow Roblox / non-browser clients.
  // Roblox HttpService sends User-Agents like:
  //   "Roblox/WinInet"  |  "RobloxApp/..."  |  "" (empty)
  // Browsers always send mozilla/chrome/safari/edge.
  const browserSignals = ["mozilla", "chrome", "safari", "edge", "gecko", "webkit"];
  const isBrowser = browserSignals.some((signal) => userAgent.includes(signal));

  // Allow if: no UA, or UA contains "roblox", or UA has no browser signals
  const isAllowed = !isBrowser || userAgent.includes("roblox");

  if (!isAllowed) {
    return res.status(404).send("Not Found");
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

// ── Fallback: serve index.html for any unmatched GET ────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Roblox Lua Pastebin running at http://localhost:${PORT}`);
});
