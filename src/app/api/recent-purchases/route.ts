import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Format name for privacy
function formatRealName(fullName: string | null): string {
  if (!fullName) return "Một khách hàng";
  const parts = fullName.trim().split(/\s+/);
  const lastName = parts[parts.length - 1];
  // Simple check for male/female prefix based on popular Vietnamese names
  const femaleNames = ["lan", "vy", "linh", "thảo", "hương", "trang", "mai", "ngọc", "phương", "trâm", "dung", "oanh", "như", "hạnh", "yến", "quuyên", "nhi", "hà", "giang", "thu", "thủy", "hoa", "anh", "huyền", "nga"];
  const isFemale = femaleNames.includes(lastName.toLowerCase());
  const prefix = isFemale ? "Chị" : "Anh";
  return `${prefix} ${lastName}`;
}

export async function GET() {
  try {
    // 1. Fetch active products from database to use for seeding
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
      },
      take: 40,
    });

    if (activeProducts.length === 0) {
      return NextResponse.json({ success: true, purchases: [] });
    }

    // 2. Fetch recent real orders (excluding cancelled)
    const realOrders = await prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        user: {
          select: { name: true },
        },
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    name: true,
                    slug: true,
                    thumbnail: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const purchases: any[] = [];

    // 3. Format real orders
    realOrders.forEach((order) => {
      const firstItem = order.items[0];
      const product = firstItem?.productVariant?.product;
      if (product) {
        let location = "Việt Nam";
        if (order.province) {
          location = order.district ? `${order.district}, ${order.province}` : order.province;
        }

        // Clean up location formatting if it contains duplicating words like "Thành phố", "Tỉnh"
        location = location
          .replace(/Tỉnh\s+/gi, "")
          .replace(/Thành phố\s+/gi, "TP. ")
          .replace(/Quận\s+/gi, "Q. ")
          .replace(/Huyện\s+/gi, "H. ");

        purchases.push({
          id: order.id,
          buyerName: formatRealName(order.user?.name || null),
          location,
          productName: product.name,
          productSlug: product.slug,
          thumbnail: product.thumbnail,
          createdAt: order.createdAt.toISOString(),
          isReal: true,
        });
      }
    });

    // 4. Generate fake seeding data (we want around 25 notifications total)
    const targetCount = Math.max(25, realOrders.length + 10);
    const fakeCountNeeded = targetCount - purchases.length;

    const fakeNames = [
      "Nam", "Tuấn", "Minh", "Hoàng", "Khánh", "Duy", "Đức", "Hùng", "Hải", "Sơn",
      "Dũng", "Bình", "Quốc", "Phong", "Thành", "Trung", "Tiến", "Lâm", "Huy", "Thắng",
      "Lan", "Vy", "Linh", "Thảo", "Hương", "Trang", "Mai", "Ngọc", "Phương", "Trâm",
      "Dung", "Oanh", "Như", "Hạnh", "Yến", "Quyên", "Nhi", "Hà", "Giang", "Thu"
    ];

    const fakeLocations = [
      "Q. 1, TP.HCM", "Q. 3, TP.HCM", "Q. 7, TP.HCM", "Thủ Đức, TP.HCM", "Q. Bình Thạnh, TP.HCM",
      "Q. Cầu Giấy, Hà Nội", "Q. Đống Đa, Hà Nội", "Q. Thanh Xuân, Hà Nội", "Q. Ba Đình, Hà Nội", "Q. Hai Bà Trưng, Hà Nội",
      "Q. Hải Châu, Đà Nẵng", "Q. Thanh Khê, Đà Nẵng", "Q. Ngô Quyền, Hải Phòng", "Q. Ninh Kiều, Cần Thơ",
      "TP. Biên Hòa, Đồng Nai", "TP. Thủ Dầu Một, Bình Dương", "TP. Vũng Tàu", "TP. Nha Trang",
      "TP. Đà Lạt", "TP. Vinh, Nghệ An", "TP. Thanh Hóa", "TP. Hạ Long, Quảng Ninh", "TP. Huế"
    ];

    const femaleNames = ["Lan", "Vy", "Linh", "Thảo", "Hương", "Trang", "Mai", "Ngọc", "Phương", "Trâm", "Dung", "Oanh", "Như", "Hạnh", "Yến", "Quyên", "Nhi", "Hà", "Giang", "Thu"];

    for (let i = 0; i < fakeCountNeeded; i++) {
      const randomProduct = activeProducts[Math.floor(Math.random() * activeProducts.length)];
      const name = fakeNames[Math.floor(Math.random() * fakeNames.length)];
      const location = fakeLocations[Math.floor(Math.random() * fakeLocations.length)];
      const prefix = femaleNames.includes(name) ? "Chị" : "Anh";

      // Fake time: between 1 minute and 24 hours ago
      const minutesAgo = Math.floor(Math.random() * 1440) + 1;
      const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

      purchases.push({
        id: `fake-${i}-${Date.now()}`,
        buyerName: `${prefix} ${name}`,
        location,
        productName: randomProduct.name,
        productSlug: randomProduct.slug,
        thumbnail: randomProduct.thumbnail,
        createdAt,
        isReal: false,
      });
    }

    // 5. Shuffle the purchases so real and fake are mixed nicely
    // but keep very fresh real purchases near the beginning if any
    const shuffledPurchases = shuffleArray(purchases);

    return NextResponse.json({
      success: true,
      purchases: shuffledPurchases,
    });
  } catch (error) {
    console.error("Error in /api/recent-purchases", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
