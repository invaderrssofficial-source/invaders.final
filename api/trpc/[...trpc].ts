import { trpcServer } from "@hono/trpc-server";
import { handle } from "hono/vercel";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";

export const maxDuration = 30;

const app = new Hono();

app.use("*", cors());

app.use(
  "/*",
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

export default handle(app);
