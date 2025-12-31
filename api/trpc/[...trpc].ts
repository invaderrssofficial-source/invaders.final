import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";

export const config = {
  maxDuration: 25,
};

function setCorsHeaders(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-trpc-source");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("[tRPC] Request:", req.method, req.url);

  try {
    const url = new URL(req.url || "/", `https://${req.headers.host}`);
    
    const fetchRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: fetchRequest,
      router: appRouter,
      createContext,
      onError({ error, path, type }) {
        console.error("[tRPC] Error:", { path, type, message: error.message });
      },
    });

    const body = await response.text();
    
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-length") {
        res.setHeader(key, value);
      }
    });

    return res.status(response.status).send(body);
  } catch (error: any) {
    console.error("[tRPC] Handler error:", error);
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
}
