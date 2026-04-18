import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seeding...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create Admin
  await prisma.user.upsert({
    where: { email: "admin@picklepro.vn" },
    update: {},
    create: {
      email: "admin@picklepro.vn",
      name: "Admin PicklePro",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created");

  // Create Brands
  const brands = [
    { name: "Selkirk", slug: "selkirk", logo: "https://images.unsplash.com/photo-1560472355-536de3962603?q=80&w=200&auto=format&fit=crop" },
    { name: "Joola", slug: "joola", logo: "https://images.unsplash.com/photo-1560472355-536de3962603?q=80&w=200&auto=format&fit=crop" },
    { name: "CRBN", slug: "crbn", logo: null },
    { name: "Engage", slug: "engage", logo: null },
    { name: "Paddletek", slug: "paddletek", logo: null },
  ];

  const brandRecords: Record<string, string> = {};
  for (const b of brands) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandRecords[b.slug] = brand.id;
  }
  console.log("✅ Brands created");

  // Create Categories
  const categories = [
    { name: "Vợt Pickleball", slug: "vot-pickleball", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop" },
    { name: "Giày Pickleball", slug: "giay-pickleball", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" },
    { name: "Phụ kiện", slug: "phu-kien", image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=600&auto=format&fit=crop" },
    { name: "Trang Phục", slug: "trang-phuc", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop" },
    { name: "Balo & Túi", slug: "balo-tui", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop" },
    { name: "Phụ kiện", slug: "phu-kien-2", image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=600&auto=format&fit=crop" },
  ];

  const categoryRecords: Record<string, string> = {};
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { image: cat.image },
      create: cat,
    });
    categoryRecords[cat.slug] = category.id;
  }
  console.log("✅ Categories created");

  // Create Banners
  const banners = [
    { title: "Special Sale", position: "FIXED_TOP", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop", link: "/products" },
    { title: "Hero Collection", position: "HERO", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1200&auto=format&fit=crop", link: "/products" },
    { title: "New Arrival", position: "LEFT", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop", link: "/products" },
    { title: "Limited Edition", position: "RIGHT_TOP", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop", link: "/products" },
    { title: "Best Seller", position: "RIGHT_BOTTOM", image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=600&auto=format&fit=crop", link: "/products" },
  ];

  for (const b of banners) {
    const id = b.title.replace(/\s+/g, "-").toLowerCase();
    await prisma.banner.upsert({
      where: { id },
      update: { image: b.image, position: b.position as any },
      create: {
        id,
        title: b.title,
        image: b.image,
        link: b.link,
        position: b.position as any,
        isActive: true,
        startDate: new Date(),
      },
    });
  }
  console.log("✅ Banners created");

  // Create Settings
  const settings = [
    { key: "store_name", value: "PicklePro" },
    { key: "store_slogan", value: "Cửa hàng Pickleball hàng đầu Việt Nam" },
    { key: "store_email", value: "help@picklepro.vn" },
    { key: "store_phone", value: "+84 123 456 789" },
    { key: "store_address", value: "Ho Chi Minh City, Vietnam" },
    { key: "store_logo", value: "" },
    { key: "store_favicon", value: "/favicon.ico" },
    { key: "social_facebook", value: "https://facebook.com/picklepro" },
    { key: "social_instagram", value: "https://instagram.com/picklepro" },
    { key: "social_youtube", value: "https://youtube.com/@picklepro" },
    { key: "social_tiktok", value: "https://tiktok.com/@picklepro" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Settings created");

  // Promotion Banners
  // Delete existing first to prevent duplicates
  await prisma.promotionBanner.deleteMany({});
  const promotions = [
    { title: "Flash Sale 50%", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop", order: 1 },
    { title: "New Season", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=400&auto=format&fit=crop", order: 2 },
    { title: "Pro Collection", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop", order: 3 },
    { title: "Accessories", image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=400&auto=format&fit=crop", order: 4 },
  ];

  for (const promo of promotions) {
    await prisma.promotionBanner.create({ data: promo });
  }
  console.log("✅ Promotion Banners created");

  // ===== SẢN PHẨM MẪU =====
  const sampleProducts = [
    {
      name: "Selkirk VANGUARD Power Air Invikta",
      slug: "selkirk-vanguard-power-air-invikta",
      description: "<p>Vợt Pickleball cao cấp từ Selkirk với công nghệ Power Air giúp tăng sức mạnh và kiểm soát. Thiết kế elongated shape phù hợp cho người chơi chuyên nghiệp.</p><ul><li>Trọng lượng: 7.7 - 8.1 oz</li><li>Bề mặt: Carbon Fiber</li><li>Core: Polypropylene X5</li><li>Grip: 5.25 inch</li></ul>",
      basePrice: 5290000,
      salePrice: 4590000,
      thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800"],
      categorySlug: "vot-pickleball",
      brandSlug: "selkirk",
      variants: [
        { sku: "SELK-VAI-BLK", price: 4590000, stock: 15, label: "Đen" },
        { sku: "SELK-VAI-WHT", price: 4590000, stock: 10, label: "Trắng" },
        { sku: "SELK-VAI-BLU", price: 4790000, stock: 5, label: "Xanh Navy" },
      ],
    },
    {
      name: "Joola Ben Johns Hyperion CFS 16mm",
      slug: "joola-ben-johns-hyperion-cfs-16mm",
      description: "<p>Vợt signature của Ben Johns - tay vợt số 1 thế giới. Carbon Friction Surface mang lại spin và control tối đa.</p><ul><li>Trọng lượng: 7.5 - 8.0 oz</li><li>Bề mặt: Carbon Friction Surface</li><li>Core: Reactive Polymer</li></ul>",
      basePrice: 6190000,
      salePrice: 5490000,
      thumbnail: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600&auto=format&fit=crop",
      images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800"],
      categorySlug: "vot-pickleball",
      brandSlug: "joola",
      variants: [
        { sku: "JOOLA-BJ-16", price: 5490000, stock: 20, label: "16mm Standard" },
        { sku: "JOOLA-BJ-14", price: 5690000, stock: 8, label: "14mm Swift" },
      ],
    },
    {
      name: "CRBN 1X Power Series",
      slug: "crbn-1x-power-series",
      description: "<p>Vợt CRBN 1X Power Series với raw carbon fiber face tạo spin cực mạnh. Lựa chọn hàng đầu của nhiều pro player.</p>",
      basePrice: 4990000,
      salePrice: null,
      thumbnail: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop",
      images: [],
      categorySlug: "vot-pickleball",
      brandSlug: "crbn",
      variants: [
        { sku: "CRBN-1X-STD", price: 4990000, stock: 12, label: "Standard" },
      ],
    },
    {
      name: "Giày Selkirk Pickleball Court Pro",
      slug: "giay-selkirk-court-pro",
      description: "<p>Giày chuyên dụng cho Pickleball từ Selkirk. Đế cao su non-marking, hỗ trợ di chuyển nhanh trên sân.</p>",
      basePrice: 3290000,
      salePrice: 2890000,
      thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
      images: [],
      categorySlug: "giay-pickleball",
      brandSlug: "selkirk",
      variants: [
        { sku: "SELK-SHOE-40", price: 2890000, stock: 10, label: "Size 40" },
        { sku: "SELK-SHOE-41", price: 2890000, stock: 8, label: "Size 41" },
        { sku: "SELK-SHOE-42", price: 2890000, stock: 12, label: "Size 42" },
        { sku: "SELK-SHOE-43", price: 2890000, stock: 6, label: "Size 43" },
      ],
    },
    {
      name: "Joola Essentials Pickleball Bag",
      slug: "joola-essentials-pickleball-bag",
      description: "<p>Túi đựng vợt Pickleball chuyên dụng từ Joola. Chứa tối đa 3 vợt, có ngăn giày và ngăn phụ kiện riêng.</p>",
      basePrice: 1590000,
      salePrice: null,
      thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
      images: [],
      categorySlug: "balo-tui",
      brandSlug: "joola",
      variants: [
        { sku: "JOOLA-BAG-BLK", price: 1590000, stock: 25, label: "Đen" },
        { sku: "JOOLA-BAG-NVY", price: 1590000, stock: 15, label: "Navy" },
      ],
    },
    {
      name: "Engage Elite Pro Pickleball Paddle",
      slug: "engage-elite-pro-paddle",
      description: "<p>Vợt Engage Elite Pro với công nghệ ControlPro polymer core và skin mặt vợt FiberTEK. Phù hợp cho người chơi all-round.</p>",
      basePrice: 3890000,
      salePrice: 3490000,
      thumbnail: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop",
      images: [],
      categorySlug: "vot-pickleball",
      brandSlug: "engage",
      variants: [
        { sku: "ENG-ELITE-STD", price: 3490000, stock: 18, label: "Standard Weight" },
        { sku: "ENG-ELITE-LW", price: 3690000, stock: 7, label: "Lightweight" },
      ],
    },
    {
      name: "Áo thể thao Pickleball Pro Dri-Fit",
      slug: "ao-the-thao-pickleball-pro-dri-fit",
      description: "<p>Áo thể thao chuyên dụng cho Pickleball, chất liệu Dri-Fit thoáng mát, co giãn 4 chiều.</p>",
      basePrice: 590000,
      salePrice: 490000,
      thumbnail: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop",
      images: [],
      categorySlug: "trang-phuc",
      brandSlug: null,
      variants: [
        { sku: "SHIRT-PP-M", price: 490000, stock: 30, label: "Size M" },
        { sku: "SHIRT-PP-L", price: 490000, stock: 25, label: "Size L" },
        { sku: "SHIRT-PP-XL", price: 490000, stock: 20, label: "Size XL" },
      ],
    },
    {
      name: "Bóng Pickleball Outdoor Franklin X-40",
      slug: "bong-pickleball-outdoor-franklin-x40",
      description: "<p>Bóng Pickleball outdoor chính hãng Franklin X-40, được sử dụng trong các giải đấu chuyên nghiệp. Bộ 6 quả.</p>",
      basePrice: 350000,
      salePrice: null,
      thumbnail: "https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=600&auto=format&fit=crop",
      images: [],
      categorySlug: "phu-kien",
      brandSlug: null,
      variants: [
        { sku: "BALL-X40-6", price: 350000, stock: 50, label: "Bộ 6 quả" },
        { sku: "BALL-X40-12", price: 650000, stock: 30, label: "Bộ 12 quả" },
      ],
    },
  ];

  // Create attribute for Variant Color/Size
  let colorAttr = await prisma.attribute.findFirst({ where: { name: "variant" } });
  if (!colorAttr) {
    colorAttr = await prisma.attribute.create({
      data: { name: "variant", label: "Phân loại", type: "SELECT" },
    });
  }

  for (const prod of sampleProducts) {
    const categoryId = categoryRecords[prod.categorySlug];
    const brandId = prod.brandSlug ? brandRecords[prod.brandSlug] : null;

    // Check if product exists
    const existing = await prisma.product.findFirst({ where: { slug: prod.slug } });
    if (existing) {
      console.log(`  ⏭ Sản phẩm đã tồn tại: ${prod.name}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        basePrice: prod.basePrice,
        salePrice: prod.salePrice,
        thumbnail: prod.thumbnail,
        images: prod.images,
        categoryId,
        brandId,
        isActive: true,
      },
    });

    // Create variants
    for (const v of prod.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          images: [],
        },
      });

      // Create attribute value for this variant
      await prisma.variantAttributeValue.create({
        data: {
          variantId: variant.id,
          attributeId: colorAttr.id,
          value: v.label,
        },
      });
    }

    console.log(`  ✅ Sản phẩm: ${prod.name} (${prod.variants.length} variants)`);
  }

  // Create a sample blog post
  const blogCategory = await prisma.postCategory.upsert({
    where: { slug: "tin-tuc" },
    update: {},
    create: { name: "Tin tức", slug: "tin-tuc" },
  });

  const existingPost = await prisma.post.findFirst({ where: { slug: "huong-dan-chon-vot-pickleball" } });
  if (!existingPost) {
    await prisma.post.create({
      data: {
        title: "Hướng dẫn chọn vợt Pickleball phù hợp cho người mới",
        slug: "huong-dan-chon-vot-pickleball",
        excerpt: "Tìm hiểu cách chọn vợt Pickleball phù hợp với phong cách chơi và trình độ của bạn.",
        content: "<h2>1. Chọn theo trọng lượng</h2><p>Vợt nhẹ (dưới 7.5oz) phù hợp cho người mới bắt đầu...</p>",
        image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800&auto=format&fit=crop",
        categoryId: blogCategory.id,
        isActive: true,
        publishedAt: new Date(),
      },
    });
  }

  const existingPost2 = await prisma.post.findFirst({ where: { slug: "top-5-vot-pickleball-2026" } });
  if (!existingPost2) {
    await prisma.post.create({
      data: {
        title: "Top 5 vợt Pickleball tốt nhất năm 2026",
        slug: "top-5-vot-pickleball-2026",
        excerpt: "Danh sách 5 vợt Pickleball được đánh giá cao nhất bởi người chơi chuyên nghiệp.",
        content: "<h2>1. Joola Ben Johns Hyperion</h2><p>Vợt số 1 thế giới...</p>",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop",
        categoryId: blogCategory.id,
        isActive: true,
        publishedAt: new Date(),
      },
    });
  }

  const existingPost3 = await prisma.post.findFirst({ where: { slug: "ky-thuat-giao-bong-pickleball" } });
  if (!existingPost3) {
    await prisma.post.create({
      data: {
        title: "Kỹ thuật giao bóng Pickleball hiệu quả cho người mới",
        slug: "ky-thuat-giao-bong-pickleball",
        excerpt: "Nắm vững kỹ thuật giao bóng cơ bản để cải thiện trình độ Pickleball của bạn.",
        content: "<h2>Giao bóng underhand</h2><p>Theo luật Pickleball, giao bóng phải underhand...</p>",
        image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop",
        categoryId: blogCategory.id,
        isActive: true,
        publishedAt: new Date(),
      },
    });
  }

  console.log("✅ Blog posts created");
  console.log("\n🎉 Seeding hoàn tất!");
  console.log("📧 Admin: admin@picklepro.vn / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
