import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";

export const metadata: Metadata = {
  title: "Tất cả sản phẩm Pickleball chính hãng | PicklePro",
  description: "Mua vợt Pickleball, quần áo, giày, balo và phụ kiện chính hãng tại PicklePro. Giá tốt nhất thị trường, giao hàng nhanh toàn quốc.",
  keywords: ["vợt Pickleball", "mua Pickleball", "phụ kiện Pickleball", "Pickleball chính hãng", "PicklePro"],
  alternates: { canonical: `${siteUrl}/products` },
  openGraph: {
    title: "Sản phẩm Pickleball — PicklePro",
    description: "Khám phá bộ sưu tập Pickleball chính hãng: vợt, quần áo, giày, balo và phụ kiện.",
    url: `${siteUrl}/products`,
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
