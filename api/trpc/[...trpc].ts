import { trpcServer } from "@hono/trpc-server";
import { handle } from "hono/vercel";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.use(
  "/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.get("/", (c) => {
  const url = new URL(c.req.url);
  console.log("[tRPC] Hit", { pathname: url.pathname, search: url.search });
  return c.json({ status: "ok", message: "tRPC endpoint" });
});

export default handle(app);
