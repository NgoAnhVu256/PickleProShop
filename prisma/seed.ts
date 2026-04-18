import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── HELPERS ───────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── DATA ──────────────────────────────────────────────────────────────────

const BRANDS_DATA = [
  { name: "JOOLA",          logo: "/images/brands/joola.webp" },
  { name: "Selkirk Sport",  logo: "/images/brands/selkirk.webp" },
  { name: "Franklin Sports",logo: "/images/brands/franklin.webp" },
  { name: "Gamma Sports",   logo: "/images/brands/gamma.webp" },
  { name: "HEAD",           logo: "/images/brands/head.webp" },
  { name: "Paddletek",      logo: "/images/brands/paddletek.webp" },
];

const CATEGORIES_DATA = [
  { name: "Vợt Pickleball",  desc: "Vợt chuẩn thi đấu & tập luyện" },
  { name: "Giày Pickleball", desc: "Giày chuyên dụng cho sân court" },
  { name: "Quần áo",         desc: "Trang phục thể thao pickleball" },
  { name: "Bóng",            desc: "Bóng thi đấu trong & ngoài nhà" },
  { name: "Túi & Balo",      desc: "Túi đựng vợt và phụ kiện" },
  { name: "Phụ kiện",        desc: "Bọc cán, overgrip, bảo vệ cổ tay" },
];

// Attributes: name (technical key), label (display), type
const ATTRIBUTES_DATA = [
  { name: "color",       label: "Màu sắc",    type: "SELECT"  as const },
  { name: "size",        label: "Kích cỡ",    type: "SELECT"  as const },
  { name: "thickness",   label: "Độ dày",     type: "SELECT"  as const },
  { name: "weight",      label: "Trọng lượng",type: "SELECT"  as const },
  { name: "grip_size",   label: "Cỡ cán",     type: "SELECT"  as const },
  { name: "gender",      label: "Giới tính",  type: "SELECT"  as const },
  { name: "material",    label: "Chất liệu",  type: "TEXT"    as const },
  { name: "quantity",    label: "Số lượng",   type: "SELECT"  as const },
];

// CategoryAttribute assignments: which attrs belong to which category
const CATEGORY_ATTR_MAP: Record<string, string[]> = {
  "Vợt Pickleball":  ["color", "thickness", "weight", "grip_size"],
  "Giày Pickleball": ["color", "size", "gender"],
  "Quần áo":         ["color", "size", "gender"],
  "Bóng":            ["color", "quantity"],
  "Túi & Balo":      ["color", "material"],
  "Phụ kiện":        ["color", "size"],
};

// ─── PRODUCT SEED DATA ─────────────────────────────────────────────────────
const PRODUCTS_SEED = [
  // ── VỢT ────────────────────────────────────────────────────────────────
  {
    name: "JOOLA Ben Johns Hyperion CFS 16",
    category: "Vợt Pickleball",
    brand: "JOOLA",
    basePrice: 4_200_000,
    description: "Vợt signature của Ben Johns, core sợi carbon CFS 16mm, mặt vợt Charged Surface, cân bằng hoàn hảo giữa tấn công và kiểm soát. Lý tưởng cho người chơi nâng cao.",
    images: ["/images/products/joola-bjh-cfs16.webp"],
    variants: [
      { attrs: { color: "Đen/Xanh",  thickness: "16mm", weight: "226g", grip_size: "4¼" }, price: 4_200_000, stock: 15 },
      { attrs: { color: "Đỏ/Đen",    thickness: "16mm", weight: "224g", grip_size: "4¼" }, price: 4_200_000, stock: 8 },
      { attrs: { color: "Trắng/Xanh",thickness: "14mm", weight: "220g", grip_size: "4¼" }, price: 3_900_000, stock: 5 },
    ],
  },
  {
    name: "JOOLA Perseus CFS 14",
    category: "Vợt Pickleball",
    brand: "JOOLA",
    basePrice: 3_500_000,
    description: "Vợt JOOLA Perseus CFS 14mm, phù hợp người chơi trung cấp muốn cải thiện tốc độ phản ứng. Mặt vợt Carbon Friction Surface cho spin cực mạnh.",
    images: ["/images/products/joola-perseus-cfs14.webp"],
    variants: [
      { attrs: { color: "Xanh Navy", thickness: "14mm", weight: "218g", grip_size: "4¼" }, price: 3_500_000, stock: 12 },
      { attrs: { color: "Vàng/Đen",  thickness: "14mm", weight: "220g", grip_size: "4½" }, price: 3_500_000, stock: 7 },
    ],
  },
  {
    name: "Selkirk VANGUARD Power Air Epic",
    category: "Vợt Pickleball",
    brand: "Selkirk Sport",
    basePrice: 5_800_000,
    description: "Công nghệ Power Air của Selkirk tạo sweet spot rộng nhất trên thị trường. Khung carbon T-700 siêu nhẹ, core XL Polymer cho cảm giác chạm tuyệt vời.",
    images: ["/images/products/selkirk-vanguard-air.webp"],
    variants: [
      { attrs: { color: "Đen/Xanh lá", thickness: "16mm", weight: "222g", grip_size: "4¼" }, price: 5_800_000, stock: 6 },
      { attrs: { color: "Xanh/Trắng",  thickness: "16mm", weight: "224g", grip_size: "4½" }, price: 5_800_000, stock: 4 },
    ],
  },
  {
    name: "HEAD Radical Pro",
    category: "Vợt Pickleball",
    brand: "HEAD",
    basePrice: 3_200_000,
    description: "Vợt HEAD Radical Pro với mặt vợt fiberglass dệt, core polypropylene 13mm. Sản phẩm tốt cho người chơi phong trào đến nâng cao, cảm giác êm tay.",
    images: ["/images/products/head-radical-pro.webp"],
    variants: [
      { attrs: { color: "Đen/Cam",   thickness: "13mm", weight: "232g", grip_size: "4¼" }, price: 3_200_000, stock: 18 },
      { attrs: { color: "Đen/Xanh",  thickness: "13mm", weight: "228g", grip_size: "4½" }, price: 3_200_000, stock: 10 },
    ],
  },
  {
    name: "Paddletek Tempest Wave Pro",
    category: "Vợt Pickleball",
    brand: "Paddletek",
    basePrice: 4_500_000,
    description: "Paddletek Tempest Wave Pro nổi bật với polymer honeycomb core và mặt vợt carbon textured. Spin tốt, kiểm soát cao, power ổn định.",
    images: ["/images/products/paddletek-tempest-wave.webp"],
    variants: [
      { attrs: { color: "Tím/Đen",  thickness: "16mm", weight: "230g", grip_size: "4¼" }, price: 4_500_000, stock: 9 },
    ],
  },
  {
    name: "Franklin Sports X-40 Signature",
    category: "Vợt Pickleball",
    brand: "Franklin Sports",
    basePrice: 2_100_000,
    description: "Vợt entry-level của Franklin Sports, phù hợp người mới tập. Mặt graphite, core âm thanh tốt. Lựa chọn tuyệt vời để bắt đầu hành trình pickleball.",
    images: ["/images/products/franklin-x40.webp"],
    variants: [
      { attrs: { color: "Xanh lá/Đen", thickness: "13mm", weight: "240g", grip_size: "4¼" }, price: 2_100_000, stock: 25 },
      { attrs: { color: "Đỏ/Đen",      thickness: "13mm", weight: "238g", grip_size: "4½" }, price: 2_100_000, stock: 20 },
    ],
  },

  // ── GIÀY ───────────────────────────────────────────────────────────────
  {
    name: "JOOLA Vision Pickleball Shoe",
    category: "Giày Pickleball",
    brand: "JOOLA",
    basePrice: 2_800_000,
    description: "Giày pickleball chuyên dụng của JOOLA với đế non-marking, hỗ trợ mắt cá tốt và lớp đệm midsole ProFoam. Phù hợp cả sân trong và ngoài nhà.",
    images: ["/images/products/joola-vision-shoe.webp"],
    variants: [
      { attrs: { color: "Trắng/Xanh", size: "US 8",  gender: "Nam" }, price: 2_800_000, stock: 8 },
      { attrs: { color: "Trắng/Xanh", size: "US 9",  gender: "Nam" }, price: 2_800_000, stock: 12 },
      { attrs: { color: "Trắng/Xanh", size: "US 10", gender: "Nam" }, price: 2_800_000, stock: 10 },
      { attrs: { color: "Trắng/Xanh", size: "US 11", gender: "Nam" }, price: 2_800_000, stock: 6 },
      { attrs: { color: "Trắng/Hồng", size: "US 6",  gender: "Nữ"  }, price: 2_800_000, stock: 8 },
      { attrs: { color: "Trắng/Hồng", size: "US 7",  gender: "Nữ"  }, price: 2_800_000, stock: 10 },
      { attrs: { color: "Trắng/Hồng", size: "US 8",  gender: "Nữ"  }, price: 2_800_000, stock: 7 },
    ],
  },
  {
    name: "Selkirk Sport Vybe Court Shoe",
    category: "Giày Pickleball",
    brand: "Selkirk Sport",
    basePrice: 3_400_000,
    description: "Giày thi đấu cao cấp của Selkirk, thiết kế ôm chân, đế cao su gai non-marking tối ưu. Hỗ trợ bên sườn vượt trội cho các pha di chuyển ngang sân.",
    images: ["/images/products/selkirk-vybe-shoe.webp"],
    variants: [
      { attrs: { color: "Đen/Xanh", size: "US 8",  gender: "Nam" }, price: 3_400_000, stock: 5 },
      { attrs: { color: "Đen/Xanh", size: "US 9",  gender: "Nam" }, price: 3_400_000, stock: 8 },
      { attrs: { color: "Đen/Xanh", size: "US 10", gender: "Nam" }, price: 3_400_000, stock: 6 },
      { attrs: { color: "Trắng/Hồng", size: "US 7", gender: "Nữ"  }, price: 3_400_000, stock: 5 },
      { attrs: { color: "Trắng/Hồng", size: "US 8", gender: "Nữ"  }, price: 3_400_000, stock: 4 },
    ],
  },

  // ── QUẦN ÁO ────────────────────────────────────────────────────────────
  {
    name: "JOOLA Tiro Polo Shirt Nam",
    category: "Quần áo",
    brand: "JOOLA",
    basePrice: 680_000,
    description: "Áo polo thi đấu JOOLA Tiro, chất liệu polyester thoáng khí VibraFlex, kiểm soát mồ hôi tốt. Thiết kế gọn gàng, phù hợp cả tập luyện lẫn thi đấu.",
    images: ["/images/products/joola-tiro-polo-nam.webp"],
    variants: [
      { attrs: { color: "Trắng",    size: "S",  gender: "Nam" }, price: 680_000, stock: 20 },
      { attrs: { color: "Trắng",    size: "M",  gender: "Nam" }, price: 680_000, stock: 25 },
      { attrs: { color: "Trắng",    size: "L",  gender: "Nam" }, price: 680_000, stock: 22 },
      { attrs: { color: "Trắng",    size: "XL", gender: "Nam" }, price: 680_000, stock: 15 },
      { attrs: { color: "Xanh Navy",size: "S",  gender: "Nam" }, price: 680_000, stock: 12 },
      { attrs: { color: "Xanh Navy",size: "M",  gender: "Nam" }, price: 680_000, stock: 18 },
      { attrs: { color: "Xanh Navy",size: "L",  gender: "Nam" }, price: 680_000, stock: 14 },
      { attrs: { color: "Đen",      size: "M",  gender: "Nam" }, price: 680_000, stock: 20 },
      { attrs: { color: "Đen",      size: "L",  gender: "Nam" }, price: 680_000, stock: 16 },
    ],
  },
  {
    name: "JOOLA Vivid Dress Nữ",
    category: "Quần áo",
    brand: "JOOLA",
    basePrice: 890_000,
    description: "Váy thể thao JOOLA Vivid cho nữ, tích hợp quần short bên trong, chất liệu VibraFlex linh hoạt. Thiết kế hiện đại với các màu sắc sống động.",
    images: ["/images/products/joola-vivid-dress.webp"],
    variants: [
      { attrs: { color: "Xanh Mint", size: "XS", gender: "Nữ" }, price: 890_000, stock: 10 },
      { attrs: { color: "Xanh Mint", size: "S",  gender: "Nữ" }, price: 890_000, stock: 15 },
      { attrs: { color: "Xanh Mint", size: "M",  gender: "Nữ" }, price: 890_000, stock: 12 },
      { attrs: { color: "Hồng",      size: "XS", gender: "Nữ" }, price: 890_000, stock: 8 },
      { attrs: { color: "Hồng",      size: "S",  gender: "Nữ" }, price: 890_000, stock: 12 },
      { attrs: { color: "Hồng",      size: "M",  gender: "Nữ" }, price: 890_000, stock: 10 },
    ],
  },

  // ── BÓNG ───────────────────────────────────────────────────────────────
  {
    name: "Franklin Sports X-40 Ball",
    category: "Bóng",
    brand: "Franklin Sports",
    basePrice: 180_000,
    description: "Bóng outdoor USAPA approved, 40 lỗ thông gió, cứng hơn bóng indoor. Đây là bóng được dùng phổ biến nhất trong các giải đấu ngoài trời tại Mỹ.",
    images: ["/images/products/franklin-x40-ball.webp"],
    variants: [
      { attrs: { color: "Vàng", quantity: "1 quả"  }, price: 180_000, stock: 100 },
      { attrs: { color: "Vàng", quantity: "3 quả"  }, price: 490_000, stock: 50 },
      { attrs: { color: "Vàng", quantity: "6 quả"  }, price: 950_000, stock: 30 },
      { attrs: { color: "Xanh", quantity: "1 quả"  }, price: 180_000, stock: 80 },
    ],
  },
  {
    name: "JOOLA Pickleball Ben Johns Signature Ball",
    category: "Bóng",
    brand: "JOOLA",
    basePrice: 220_000,
    description: "Bóng outdoor signature Ben Johns, 40 lỗ USAPA approved. Độ bền cao hơn các bóng thông thường 20%. Chuẩn thi đấu chuyên nghiệp.",
    images: ["/images/products/joola-bj-ball.webp"],
    variants: [
      { attrs: { color: "Cam", quantity: "1 quả" }, price: 220_000, stock: 120 },
      { attrs: { color: "Cam", quantity: "3 quả" }, price: 600_000, stock: 60 },
    ],
  },

  // ── TÚI & BALO ─────────────────────────────────────────────────────────
  {
    name: "JOOLA Tour Elite Pro Bag",
    category: "Túi & Balo",
    brand: "JOOLA",
    basePrice: 1_800_000,
    description: "Túi vợt chuyên nghiệp JOOLA Tour Elite Pro, chứa tối đa 4 vợt, ngăn giữ nhiệt độ cho vợt, ngăn đựng giày riêng. Chất liệu polyester 600D bền bỉ.",
    images: ["/images/products/joola-tour-elite-bag.webp"],
    variants: [
      { attrs: { color: "Đen/Xanh",  material: "Polyester 600D" }, price: 1_800_000, stock: 15 },
      { attrs: { color: "Đen/Đỏ",    material: "Polyester 600D" }, price: 1_800_000, stock: 10 },
    ],
  },
  {
    name: "Selkirk Sport Lab II Backpack",
    category: "Túi & Balo",
    brand: "Selkirk Sport",
    basePrice: 2_200_000,
    description: "Balo pickleball cao cấp Selkirk Lab II, thiết kế tối ưu cho dân chơi chuyên nghiệp. Chứa 2 vợt, ngăn laptop 15\", hệ thống dây đeo ergonomic.",
    images: ["/images/products/selkirk-lab2-bag.webp"],
    variants: [
      { attrs: { color: "Đen", material: "Vải woven chống nước" }, price: 2_200_000, stock: 8 },
    ],
  },

  // ── PHỤ KIỆN ───────────────────────────────────────────────────────────
  {
    name: "Gamma Grip Overgrip (3 cuộn)",
    category: "Phụ kiện",
    brand: "Gamma Sports",
    basePrice: 120_000,
    description: "Overgrip Gamma ResiPro cao cấp, thấm hút mồ hôi tốt, dày 0.6mm không ảnh hưởng cảm giác vợt. Bộ 3 cuộn tiết kiệm.",
    images: ["/images/products/gamma-overgrip.webp"],
    variants: [
      { attrs: { color: "Trắng", size: "Chuẩn" }, price: 120_000, stock: 80 },
      { attrs: { color: "Đen",   size: "Chuẩn" }, price: 120_000, stock: 70 },
      { attrs: { color: "Xanh",  size: "Chuẩn" }, price: 120_000, stock: 60 },
    ],
  },
  {
    name: "Selkirk Edge Sentry Court Guard",
    category: "Phụ kiện",
    brand: "Selkirk Sport",
    basePrice: 250_000,
    description: "Bảo vệ cạnh vợt Selkirk Edge Sentry, dán ngoài cạnh frame giúp chống mài mòn và trầy xước khi vợt chạm sân. Tương thích hầu hết các vợt.",
    images: ["/images/products/selkirk-edge-guard.webp"],
    variants: [
      { attrs: { color: "Trong suốt", size: "One-size" }, price: 250_000, stock: 40 },
      { attrs: { color: "Đen",        size: "One-size" }, price: 250_000, stock: 35 },
    ],
  },
];

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Admin user ──────────────────────────────────────────────────────
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const hashed = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@picklepro.vn",
        password: hashed,
        role: "ADMIN",
      },
    });
    console.log("✅ Seeded admin (email: admin@picklepro.vn | password: admin123)");
  } else {
    console.log("⏭  Admin already exists, skipping.");
  }

  // ── 2. Brands ──────────────────────────────────────────────────────────
  const brandMap = new Map<string, string>(); // name → id
  for (const b of BRANDS_DATA) {
    const existing = await prisma.brand.findUnique({ where: { slug: slugify(b.name) } });
    if (existing) {
      brandMap.set(b.name, existing.id);
    } else {
      const created = await prisma.brand.create({
        data: { name: b.name, slug: slugify(b.name), logo: b.logo },
      });
      brandMap.set(b.name, created.id);
    }
  }
  console.log(`✅ Seeded ${BRANDS_DATA.length} brands`);

  // ── 3. Attributes ─────────────────────────────────────────────────────
  const attrMap = new Map<string, string>(); // name → id
  for (const a of ATTRIBUTES_DATA) {
    const existing = await prisma.attribute.findUnique({ where: { name: a.name } });
    if (existing) {
      attrMap.set(a.name, existing.id);
    } else {
      const created = await prisma.attribute.create({
        data: { name: a.name, label: a.label, type: a.type },
      });
      attrMap.set(a.name, created.id);
    }
  }
  console.log(`✅ Seeded ${ATTRIBUTES_DATA.length} attributes`);

  // ── 4. Categories + assign attributes ─────────────────────────────────
  const categoryMap = new Map<string, string>(); // name → id
  for (const c of CATEGORIES_DATA) {
    const slug = slugify(c.name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    let catId: string;
    if (existing) {
      catId = existing.id;
    } else {
      const created = await prisma.category.create({
        data: { name: c.name, slug, description: c.desc },
      });
      catId = created.id;
    }
    categoryMap.set(c.name, catId);

    // Assign attributes to category
    const attrNames = CATEGORY_ATTR_MAP[c.name] ?? [];
    for (let i = 0; i < attrNames.length; i++) {
      const attrId = attrMap.get(attrNames[i]);
      if (!attrId) continue;
      await prisma.categoryAttribute.upsert({
        where: { categoryId_attributeId: { categoryId: catId, attributeId: attrId } },
        create: { categoryId: catId, attributeId: attrId, isRequired: true, displayOrder: i + 1 },
        update: { displayOrder: i + 1 },
      });
    }
  }
  console.log(`✅ Seeded ${CATEGORIES_DATA.length} categories with attributes`);

  // ── 5. Products + Variants (Dynamic Generation) ──────────────────────
  console.log("📦 Checking product counts per category...");
  const allCategories = await prisma.category.findMany();
  const allBrands = await prisma.brand.findMany();
  
  if (allBrands.length === 0) {
    console.warn("⚠ No brands found. Please seed brands first.");
    return;
  }

  for (const category of allCategories) {
    const existingCount = await prisma.product.count({ where: { categoryId: category.id } });
    const needed = 5 - existingCount;

    if (needed > 0) {
      console.log(`🔹 Category "${category.name}" needs ${needed} more products.`);
      
      for (let i = 1; i <= needed; i++) {
        const brand = allBrands[Math.floor(Math.random() * allBrands.length)];
        const productName = `${category.name} ${brand.name} Platinum Edition ${existingCount + i}`;
        const slug = slugify(productName);
        
        // Ensure unique slug if multiple categories have similar names
        const finalSlug = existingCount > 0 ? `${slug}-${category.id.slice(-4)}` : slug;

        const product = await prisma.product.create({
          data: {
            name: productName,
            slug: finalSlug,
            description: `Mô tả chi tiết cho ${productName}. Đây là sản phẩm cao cấp thuộc danh mục ${category.name}, mang lại hiệu suất tối ưu cho người chơi chuyên nghiệp.`,
            categoryId: category.id,
            brandId: brand.id,
            basePrice: 1000000 + Math.floor(Math.random() * 5000000),
            isActive: true,
            thumbnail: `https://images.unsplash.com/photo-1611095973763-4140195a243b?q=80&w=800&auto=format&fit=crop&sig=${Math.random()}`,
          }
        });

        // Create at least one variant
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: `${product.slug.toUpperCase().slice(0, 20)}-V${Math.floor(Math.random() * 10000)}`,
            price: product.basePrice,
            stock: 50 + Math.floor(Math.random() * 100),
            isActive: true,
          }
        });
      }
    } else {
      console.log(`✅ Category "${category.name}" already has ${existingCount} products.`);
    }
  }

  // ── 6. CMS Data (Banners, Announcements, Settings) ──────────────────
  const bannersCount = await prisma.banner.count();
  if (bannersCount === 0) {
    await prisma.banner.createMany({
      data: [
        { title: "Pickleball Championship 2026", image: "/images/banners/hero-1.webp", position: "HERO", order: 1 },
        { title: "Summer Sale - 30% Off", image: "/images/banners/hero-2.webp", position: "HERO", order: 2 },
        { title: "New JOOLA Collection", image: "/images/banners/right-top.webp", position: "RIGHT_TOP", order: 1 },
        { title: "Join our Community", image: "/images/banners/right-bottom.webp", position: "RIGHT_BOTTOM", order: 1 },
      ],
    });
    console.log("✅ Seeded 4 banners");
  }

  const announcCount = await prisma.announcement.count();
  if (announcCount === 0) {
    await prisma.announcement.create({
      data: { content: "Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ!", isActive: true },
    });
    console.log("✅ Seeded announcement");
  }

  const settingsCount = await prisma.setting.count();
  if (settingsCount === 0) {
    await prisma.setting.createMany({
      data: [
        { key: "site_name", value: "PicklePro" },
        { key: "site_description", value: "Cửa hàng Pickleball số 1 Việt Nam" },
        { key: "contact_email", value: "contact@picklepro.vn" },
        { key: "contact_phone", value: "0901234567" },
      ],
    });
    console.log("✅ Seeded initial settings");
  }

  // ── 7. Post Categories + Posts ────────────────────────────────────────
  console.log("📝 Seeding blog posts...");
  const postCategoriesData = [
    { name: "Review", slug: "review", desc: "Đánh giá chi tiết các thiết bị Pickleball" },
    { name: "Tin tức", slug: "tin-tuc", desc: "Cập nhật giải đấu và tin tức mới nhất" },
    { name: "Khác", slug: "khac", desc: "Các mẹo vặt và kiến thức đời sống" },
  ];

  const postCategoryMap = new Map<string, string>();
  for (const pc of postCategoriesData) {
    const existing = await prisma.postCategory.findUnique({ where: { slug: pc.slug } });
    if (existing) {
      postCategoryMap.set(pc.name, existing.id);
    } else {
      const created = await prisma.postCategory.create({
        data: { name: pc.name, slug: pc.slug, description: pc.desc },
      });
      postCategoryMap.set(pc.name, created.id);
    }
  }

  const postsData = [
    { 
      title: "Review Vợt JOOLA Perseus: Cú Spin Cực Đỉnh",
      slug: "review-vot-joola-perseus",
      category: "Review",
      excerpt: "Một cái nhìn chi tiết về công nghệ Carbon Friction Surface trên dòng vợt cao cấp của JOOLA.",
      image: "https://images.unsplash.com/photo-1628191139360-4083564d03fd?q=80&w=800"
    },
    { 
      title: "Giải vô địch Pickleball Việt Nam 2026 chính thức khởi tranh",
      slug: "giai-vo-dich-pickleball-2026",
      category: "Tin tức",
      excerpt: "Hơn 500 vận động viên quy tụ tại TP.HCM để tranh tài các nội dung đơn và đôi.",
      image: "https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?q=80&w=800"
    },
    { 
      title: "Mẹo bảo quản vợt để bền bỉ qua năm tháng",
      slug: "meo-bao-quan-vot",
      category: "Khác",
      excerpt: "Đừng để vợt trong cốp xe nắng nóng! Hãy học cách vệ sinh bề mặt vợt đúng cách.",
      image: "https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=800"
    },
    { 
      title: "So sánh Selkirk Invitational vs Vanguard Power Air",
      slug: "so-sanh-selkirk-invitational-vanguard",
      category: "Review",
      excerpt: "Hai dòng vợt đình đám của Selkirk có gì khác biệt? Lựa chọn nào cho người chơi thích tấn công?",
      image: "https://images.unsplash.com/photo-1616091216791-a5360b5fc58e?q=80&w=800"
    },
    { 
      title: "Top 5 sân Pickleball đẹp nhất Quận 7",
      slug: "top-5-san-pickleball-quan-7",
      category: "Tin tức",
      excerpt: "Bạn đang tìm chỗ chơi? Hãy tham khảo ngay danh sách các cụm sân hiện đại này.",
      image: "https://images.unsplash.com/photo-1626225967045-2c83bc5df88e?q=80&w=800"
    },
    { 
      title: "Kỹ thuật Dinking đỉnh cao cho người mới",
      slug: "ky-thuat-dinking-dinh-cao",
      category: "Khác",
      excerpt: "Học cách kiểm soát trận đấu bằng những cú đánh nhẹ nhàng nhưng đầy uy lực ở khu vực Kitchen.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"
    },
    { 
      title: "Đánh giá giày Adidas Ubersonic 4 cho mặt sân Pickleball",
      slug: "danh-gia-giay-adidas-ubersonic-4",
      category: "Review",
      excerpt: "Độ bám, sự linh hoạt và tính ổn định. Có thực sự xứng đáng với giá tiền?",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800"
    },
    { 
      title: "Pickleball chính thức có mặt tại Sea Games 33",
      slug: "pickleball-sea-games-33",
      category: "Tin tức",
      excerpt: "Một bước ngoặt lớn cho bộ môn thể thao này tại khu vực Đông Nam Á.",
      image: "https://images.unsplash.com/photo-1461896704190-3213c9ad9566?q=80&w=800"
    },
    { 
      title: "Chế độ dinh dưỡng cho vận động viên Pickleball",
      slug: "dinh-duong-van-dong-vien",
      category: "Khác",
      excerpt: "Ăn gì trước trận đấu để tối ưu hóa năng lượng? Một vài gợi ý từ chuyên gia.",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800"
    },
    { 
      title: "Review bóng Franklin X-40: Vì sao là tiêu chuẩn vàng?",
      slug: "review-bong-franklin-x40",
      category: "Review",
      excerpt: "Độ nảy, độ bền và tính ổn định trong gió là những điểm mạnh của dòng bóng này.",
      image: "https://images.unsplash.com/photo-1611095973763-4140195a243b?q=80&w=800"
    },
  ];

  for (const post of postsData) {
    const categoryId = postCategoryMap.get(post.category);
    if (!categoryId) continue;

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: `Đây là nội dung đầy đủ cho bài viết "${post.title}". Pickleball đang trở thành xu hướng thể thao mạnh mẽ.`,
        image: post.image,
        categoryId: categoryId,
        isActive: true,
      }
    });
  }
  console.log(`✅ Seeded ${postsData.length} blog posts`);

  // ── 8. Summary ────────────────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────");
  console.log(`📊 Database Summary:`);
  console.log(`   Brands:     ${await prisma.brand.count()}`);
  console.log(`   Categories: ${await prisma.category.count()}`);
  console.log(`   Attributes: ${await prisma.attribute.count()}`);
  console.log(`   Products:   ${await prisma.product.count()}`);
  console.log(`   Variants:   ${await prisma.productVariant.count()}`);
  console.log(`   Posts:      ${await prisma.post.count()}`);
  console.log("──────────────────────────────────────────\n");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
