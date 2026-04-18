import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getSiteSettings } from "@/lib/settings";
import ChatWidget from "@/components/shop/ChatWidget";
import Providers from "@/components/shop/Providers";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

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
      icon: settings.favicon,
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
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} antialiased text-gray-900`}>
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
