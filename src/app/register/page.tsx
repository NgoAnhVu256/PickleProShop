import { Suspense } from "react";
import { getSiteSettings } from "@/lib/settings";
import AuthClient from "@/components/shop/AuthClient";

export default async function RegisterPage() {
  const settings = await getSiteSettings();
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /></div>}>
      <AuthClient settings={settings} initialMode="register" />
    </Suspense>
  );
}
