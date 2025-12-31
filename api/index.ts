import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  maxDuration: 10,
};

function setCorsHeaders(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("[API] Request:", req.method, req.url);

  if (req.url?.includes("/api/health")) {
    return res.status(200).json({ status: "ok", ts: Date.now() });
  }

  return res.status(200).json({ status: "ok", message: "Club Invaders API is running" });
}
