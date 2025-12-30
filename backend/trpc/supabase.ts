import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("[Supabase] Initializing client...", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
    urlPreview: supabaseUrl?.substring(0, 20),
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    const error = {
      message: "Missing required Supabase environment variables",
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      availableEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
    };
    console.error("[Supabase] Configuration error:", error);
    throw new Error(JSON.stringify(error));
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[Supabase] Client initialized successfully");
    return supabaseInstance;
  } catch (err) {
    console.error("[Supabase] Failed to create client:", err);
    throw err;
  }
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
