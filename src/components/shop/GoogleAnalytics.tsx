import Script from "next/script";

/**
 * Google Analytics GA4 component.
 *
 * Uses next/script with strategy="afterInteractive" to:
 * 1. Not block the main thread during initial page load
 * 2. Load GA after hydration is complete
 * 3. Reduce render-blocking resource impact on FCP/LCP
 */
export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
}
