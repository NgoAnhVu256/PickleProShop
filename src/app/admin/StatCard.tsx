"use client";

import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

const iconMap = { DollarSign, ShoppingCart, Package, Users } as const;
type IconName = keyof typeof iconMap;

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  iconName: IconName;
  iconBg: string;
  bg: string;
}

export function StatCard({ label, value, sub, iconName, iconBg, bg }: StatCardProps) {
  const Icon = iconMap[iconName];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: 22,
        border: "1px solid #eef2f7",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 12px ${bg}`,
        }}>
          <Icon size={20} color="#fff" />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#323b4b", lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#323b4b", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#b0bac9" }}>{sub}</div>
    </div>
  );
}
