"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { GA_TRACKING_ID, pageview } from "@/lib/gtag";

function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Avoid double-counting the initial page load since the script config runs on load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-tag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker />
      </Suspense>
    </>
  );
}
