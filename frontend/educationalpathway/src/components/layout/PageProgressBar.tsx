"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({ 
  showSpinner: false, 
  trickleSpeed: 200,
  minimum: 0.3
});

export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start progress bar when pathname or searchParams changes
    NProgress.start();
    
    // Complete progress bar after a short delay to simulate route change completion
    // In Next.js App Router, there's no perfect 'routeChangeComplete' event for client-side navigation
    // so we use a short timeout which works well for perceived performance.
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
