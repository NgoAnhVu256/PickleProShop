import { prisma } from "./prisma";

export async function getSiteSettings() {
  try {
    const settings = await prisma.setting.findMany();
    const config: Record<string, string> = {};
    
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    // Parse addresses: try JSON array first, then legacy fields
    let addresses: string[] = [];
    if (config.store_addresses) {
      try { addresses = JSON.parse(config.store_addresses); } catch { addresses = []; }
    }
    // Fallback: migrate from old store_address / store_address2
    if (addresses.length === 0) {
      if (config.store_address) addresses.push(config.store_address);
      if (config.store_address2) addresses.push(config.store_address2);
    }

    return {
      name: config.store_name || "PicklePro",
      slogan: config.store_slogan || "Cửa hàng Pickleball hàng đầu Việt Nam",
      logo: config.store_logo || "",
      favicon: config.store_favicon || "/favicon.ico",
      email: config.store_email || "help@picklepro.vn",
      phone: config.store_phone || "+84 123 456 789",
      addresses,
      website: config.store_website || "",
      workingHours: config.store_open_hours || "",
      hotline: config.store_hotline || "",
      facebook: config.social_facebook || "",
      instagram: config.social_instagram || "",
      youtube: config.social_youtube || "",
      tiktok: config.social_tiktok || "",
      zalo: config.social_zalo || "",
      messenger: config.social_messenger || "",
      ga4MeasurementId: config.ga4_measurement_id || "",
    };
  } catch (error) {
    return {
      name: "PicklePro",
      slogan: "Cửa hàng Pickleball hàng đầu Việt Nam",
      logo: "",
      favicon: "/favicon.ico",
      email: "help@picklepro.vn",
      phone: "+84 123 456 789",
      addresses: [] as string[],
      website: "",
      workingHours: "",
      hotline: "",
      facebook: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      zalo: "",
      messenger: "",
      ga4MeasurementId: "",
    };
  }
}
