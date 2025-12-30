import { handle } from "hono/vercel";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "../backend/trpc/app-router";
import { createContext } from "../backend/trpc/create-context";

const app = new Hono().basePath("/api");

app.use("*", cors());

app.use("*", async (c, next) => {
  const timeout = setTimeout(() => {
    console.error("[API] Request taking too long, approaching timeout");
  }, 25000);
  
  await next();
  clearTimeout(timeout);
});

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Club Invaders API is running" });
});

export default handle(app);
