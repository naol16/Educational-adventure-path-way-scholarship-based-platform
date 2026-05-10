"use client";

import { SWRConfig } from "swr";
import api from "@/lib/api";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => api.get(url).then((res) => res.data),
        revalidateOnFocus: false, // Avoid unnecessary refetches when switching tabs
        dedupingInterval: 5000, // Dedup identical requests within 5 seconds
        shouldRetryOnError: false, // Don't spam retries on failure
      }}
    >
      {children}
    </SWRConfig>
  );
}
