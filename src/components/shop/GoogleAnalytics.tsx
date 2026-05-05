/**
 * Google Analytics GA4 component.
 * 
 * Server component that injects GA4 tracking directly into <head>
 * using dangerouslySetInnerHTML so the tag appears in the initial HTML source.
 * This ensures Google's tag checker can detect it.
 */
export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (!measurementId) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
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
