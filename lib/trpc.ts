import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!url) {
    console.warn('[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL not set, using fallback');
    return 'http://localhost:8081';
  }

  return url;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      fetch: async (url, options) => {
        console.log('[tRPC Client] Requesting:', url);
        try {
          const response = await fetch(url, options);
          console.log('[tRPC Client] Response status:', response.status);
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('[tRPC Client] Invalid content-type:', contentType);
            const text = await response.text();
            console.error('[tRPC Client] Response text:', text.substring(0, 200));
            throw new Error('Server returned non-JSON response');
          }
          
          return response;
        } catch (error: any) {
          console.error('[tRPC Client] Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});
