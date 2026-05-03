import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getSiteSettings } from "@/lib/settings";
import ChatWidget from "@/components/shop/ChatWidget";
import GoogleAnalytics from "@/components/shop/GoogleAnalytics";
import Providers from "@/components/shop/Providers";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: settings.name,
      template: `%s | ${settings.name}`,
    },
    description: settings.slogan,
    icons: {
      icon: "/api/favicon",
      shortcut: "/api/favicon",
    },
    keywords: ["Pickleball", "PicklePro", "Vợt Pickleball", "Giày Pickleball", "Phụ kiện Pickleball chính hãng", "Pickleball Vietnam"],
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: settings.name,
      description: settings.slogan,
      images: [settings.logo || "/favicon.ico"],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.name,
      description: settings.slogan,
      images: [settings.logo || "/favicon.ico"],
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
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} antialiased text-gray-900`}>
        <GoogleAnalytics measurementId={settings.ga4MeasurementId} />
        <Providers>
          {children}
          <ChatWidget
            zaloLink={settings.zalo}
            messengerLink={settings.messenger}
            chatbotAvatar={settings.chatbotAvatar}
          />
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
