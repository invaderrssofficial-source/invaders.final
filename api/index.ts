import { handle } from "hono/vercel";
import { Hono } from "hono";

export const maxDuration = 30;

const app = new Hono();

app.get("/api", (c) => {
  const url = new URL(c.req.url);
  console.log("[API] GET /api", { pathname: url.pathname, search: url.search });
  return c.json({ status: "ok", message: "Club Invaders API is running" });
});

app.get("/api/health", (c) => {
  const url = new URL(c.req.url);
  console.log("[API] GET /api/health", { pathname: url.pathname, search: url.search });
  return c.json({ status: "ok", ts: Date.now() });
});

export default handle(app);
