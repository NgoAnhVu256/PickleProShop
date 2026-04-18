import { prisma } from "./prisma";

export async function getSiteSettings() {
  try {
    const settings = await prisma.setting.findMany();
    const config: Record<string, string> = {};
    
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    return {
      name: config.store_name || "PicklePro",
      slogan: config.store_slogan || "Cửa hàng Pickleball hàng đầu Việt Nam",
      logo: config.store_logo || "",
      favicon: config.store_favicon || "/favicon.ico",
      email: config.store_email || "help@picklepro.vn",
      phone: config.store_phone || "+84 123 456 789",
      address: config.store_address || "Ho Chi Minh City, Vietnam",
      facebook: config.social_facebook || "",
      instagram: config.social_instagram || "",
      youtube: config.social_youtube || "",
      tiktok: config.social_tiktok || "",
    };
  } catch (error) {
    return {
      name: "PicklePro",
      slogan: "Cửa hàng Pickleball hàng đầu Việt Nam",
      logo: "",
      favicon: "/favicon.ico",
      email: "help@picklepro.vn",
      phone: "+84 123 456 789",
      address: "Ho Chi Minh City, Vietnam",
      facebook: "",
      instagram: "",
      youtube: "",
      tiktok: "",
    };
  }
}
