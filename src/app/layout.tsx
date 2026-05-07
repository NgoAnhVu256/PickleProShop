import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getSiteSettings } from "@/lib/settings";
import GoogleAnalytics from "@/components/shop/GoogleAnalytics";
import Providers from "@/components/shop/Providers";
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });


export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = settings.seoCanonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // SEO fields from admin — fallback to store name/slogan
  const seoTitle = settings.seoTitle || settings.name;
  const seoDescription = settings.seoDescription || settings.slogan;
  const seoKeywords = settings.seoKeywords
    ? settings.seoKeywords.split(",").map((k: string) => k.trim())
    : ["Pickleball", "PicklePro", "Vợt Pickleball", "Giày Pickleball", "Phụ kiện Pickleball chính hãng", "Pickleball Vietnam"];
  const ogTitle = settings.ogTitle || seoTitle;
  const ogDescription = settings.ogDescription || seoDescription;
  const ogImage = settings.ogImage || settings.logo || "/api/favicon";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seoTitle,
      template: `%s | ${settings.name}`,
    },
    description: seoDescription,
    icons: {
      icon: [
        { url: "/api/favicon", type: "image/x-icon" },
        { url: "/api/favicon", type: "image/png" }
      ],
      shortcut: "/api/favicon",
      apple: "/api/favicon",
    },
    keywords: seoKeywords,
    openGraph: {
      type: (settings.ogType || "website") as "website",
      siteName: settings.name,
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    // Full SEO access for all bots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: settings.seoCanonicalUrl ? { canonical: settings.seoCanonicalUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";

  // JSON-LD Structured Data for Google Search
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name,
    url: siteUrl,
    logo: settings.logo
      ? (settings.logo.startsWith("http") ? settings.logo : `${siteUrl}${settings.logo}`)
      : `${siteUrl}/api/favicon`,
    description: settings.slogan,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phone,
      contactType: "customer service",
      availableLanguage: ["Vietnamese", "English"],
    },
    sameAs: [
      settings.facebook,
      settings.instagram,
      settings.youtube,
      settings.tiktok,
    ].filter(Boolean),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.name,
    url: siteUrl,
    description: settings.slogan,
    publisher: {
      "@type": "Organization",
      name: settings.name,
      logo: {
        "@type": "ImageObject",
        url: settings.logo
          ? (settings.logo.startsWith("http") ? settings.logo : `${siteUrl}${settings.logo}`)
          : `${siteUrl}/api/favicon`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="f59892f24bf2f7c1" />
        <GoogleAnalytics measurementId={settings.ga4MeasurementId} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.className} antialiased text-gray-900`}>
        <Providers settings={settings}>
          {children}
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
