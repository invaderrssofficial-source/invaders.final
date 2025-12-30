import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/cloudflare-pages";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "../backend/trpc/app-router";
import { createContext } from "../backend/trpc/create-context";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.get("/api", (c) => {
  console.log("[API] GET /api");
  return c.json({ status: "ok", message: "Club Invaders API is running" });
});

app.get("/api/health", (c) => {
  console.log("[API] GET /api/health");
  return c.json({ status: "ok", ts: Date.now() });
});

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    onError({ error, path, type, input }) {
      console.error("[tRPC] Error", {
        path,
        type,
        input,
        message: error.message,
        cause: (error.cause as unknown) ?? null,
      });
    },
  }),
);

app.all("*", (c) => {
  return c.json({ error: "Not Found" }, 404);
});

export const onRequest = handle(app);
