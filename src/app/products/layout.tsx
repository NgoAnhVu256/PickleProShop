import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm | PicklePro",
  description: "Khám phá bộ sưu tập vợt Pickleball, giày, quần áo và phụ kiện chính hãng tại PicklePro. Giá tốt nhất, giao hàng nhanh.",
  alternates: { canonical: "/products" },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
