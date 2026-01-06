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
    
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      console.log("[tRPC] Request body:", body.substring(0, 500));
    }

    const fetchRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as HeadersInit,
      body,
    });

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: fetchRequest,
      router: appRouter,
      createContext,
      onError({ error, path, type }) {
        console.error("[tRPC] Error:", { path, type, message: error.message, stack: error.stack });
      },
    });

    const responseBody = await response.text();
    console.log("[tRPC] Response status:", response.status, "Body length:", responseBody.length);
    
    if (responseBody.length > 0) {
      console.log("[tRPC] Response preview:", responseBody.substring(0, 300));
    }
    
    if (!responseBody || responseBody.length === 0) {
      console.error("[tRPC] Empty response body, returning error");
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json([{ 
        error: { 
          json: {
            message: "Empty response from server",
            code: "INTERNAL_SERVER_ERROR",
            data: { code: "INTERNAL_SERVER_ERROR" }
          }
        } 
      }]);
    }

    try {
      JSON.parse(responseBody);
    } catch (parseError) {
      console.error("[tRPC] Invalid JSON response:", parseError);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json([{ 
        error: { 
          json: {
            message: "Invalid server response",
            code: "INTERNAL_SERVER_ERROR",
            data: { code: "INTERNAL_SERVER_ERROR" }
          }
        } 
      }]);
    }
    
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-length") {
        res.setHeader(key, value);
      }
    });

    res.setHeader("Content-Type", "application/json");
    return res.status(response.status).send(responseBody);
  } catch (error: any) {
    console.error("[tRPC] Handler error:", error.message, error.stack);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json([{ 
      error: { 
        json: {
          message: error.message || "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
          data: { code: "INTERNAL_SERVER_ERROR" }
        }
      } 
    }]);
  }
}
