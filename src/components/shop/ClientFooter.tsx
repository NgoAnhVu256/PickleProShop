"use client";

import { useSiteSettings } from "./Providers";
import Footer from "./Footer";

export default function ClientFooter() {
  const settings = useSiteSettings();
  return <Footer settings={settings} />;
}
