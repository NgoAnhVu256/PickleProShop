"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { PickleballIcon } from "@/components/common/Icons";
import { useConfirm } from "@/hooks/useConfirm";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  thumbnail: string | null;
  isActive: boolean;
  images: string[];
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
  _count: { variants: number };
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error("Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Xóa sản phẩm", message: "Bạn có chắc muốn xóa sản phẩm này? Không thể hoàn tác.", confirmText: "Xóa", variant: "danger" });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa sản phẩm");
        fetchProducts();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi xóa sản phẩm");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isActive ? "Đã ẩn sản phẩm" : "Đã hiện sản phẩm");
        fetchProducts();
      }
    } catch {
      toast.error("Lỗi cập nhật");
    }
  };

  const getDiscountPercent = (base: number, sale: number | null) => {
    if (!sale || sale >= base) return 0;
    return Math.round(((base - sale) / base) * 100);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Quản lý sản phẩm</h1>
        <Link href="/admin/products/create" className="btn btn-primary">
          <Plus size={16} /> Thêm sản phẩm
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, maxWidth: 400, position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8a98ac" }} />
        <input
          type="text"
          className="input"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ paddingLeft: 40, background: "#f8f9fb", border: "1.5px solid #eef2f7", color: "#323b4b" }}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th>Biến thể</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}><div className="skeleton" style={{ height: 20, width: "100%" }} /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>
                  Không tìm thấy sản phẩm
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const disc = getDiscountPercent(product.basePrice, product.salePrice);
                const imgSrc = product.thumbnail || product.images?.[0];
                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          background: "#f8f9fb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid #eef2f7",
                        }}>
                          {imgSrc ? (
                            <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : <PickleballIcon size={20} color="#b0bac9" />}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 700, color: "#323b4b", fontSize: 14 }}>{product.name}</span>
                          {product.brand && (
                            <span style={{ fontSize: 11, color: "#8a98ac" }}>{product.brand.name}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{product.category.name}</td>
                    <td>
                      {product.salePrice && product.salePrice < product.basePrice ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 700, color: "#dc2626", fontSize: 14 }}>{formatPrice(product.salePrice)}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "#8a98ac", textDecoration: "line-through" }}>{formatPrice(product.basePrice)}</span>
                            <span style={{ background: "#fee2e2", color: "#dc2626", padding: "1px 5px", borderRadius: 3, fontSize: 10, fontWeight: 700 }}>-{disc}%</span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{formatPrice(product.basePrice)}</span>
                      )}
                    </td>
                    <td>{product._count.variants} biến thể</td>
                    <td>
                      <span className={`badge ${product.isActive ? "badge-success" : "badge-danger"}`}>
                        {product.isActive ? "Hiện" : "Ẩn"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => toggleActive(product.id, product.isActive)} className="btn btn-secondary btn-sm" title={product.isActive ? "Ẩn" : "Hiện"}>
                          {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link href={`/admin/products/${product.id}`} className="btn btn-secondary btn-sm">
                          <Edit size={14} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={p === page ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
