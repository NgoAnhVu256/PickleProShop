"use client";

import { useState, useEffect } from "react";
import {
  Save, Loader2, Store, Search, Share2, Phone, Mail, MapPin,
  Globe, MessageCircle,
  FileText, Link2, Tag, CheckCircle2,
  AtSign, Video, Rss,
} from "lucide-react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/admin/ImageUpload";

/* ─── Tabs ─── */
const TABS = [
  { id: "general", label: "Thông tin chung", icon: Store },
  { id: "seo",     label: "SEO",             icon: Search },
  { id: "social",  label: "Mạng xã hội",     icon: Share2 },
];

/* ─── Settings config ─── */
const SETTINGS_CONFIG = {
  general: [
    {
      section: "Thông tin cửa hàng",
      fields: [
        { key: "store_name",    label: "Tên cửa hàng",  type: "text",   icon: Store,    placeholder: "PicklePro" },
        { key: "store_slogan",  label: "Slogan",         type: "text",   icon: FileText, placeholder: "Chuyên Pickleball Chính Hãng" },
        { key: "store_email",   label: "Email liên hệ", type: "email",  icon: Mail,     placeholder: "hello@picklepro.vn" },
        { key: "store_phone",   label: "Số điện thoại", type: "text",   icon: Phone,    placeholder: "0909 123 456" },
        { key: "store_address",  label: "Địa chỉ CS1",    type: "text",   icon: MapPin,   placeholder: "123 Nguyễn Văn A, TP.HCM" },
        { key: "store_address2", label: "Địa chỉ CS2",    type: "text",   icon: MapPin,   placeholder: "456 Lê Lợi, Hà Nội" },
        { key: "store_website", label: "Website",        type: "text",   icon: Globe,    placeholder: "https://picklepro.vn" },
      ],
    },
    {
      section: "Chính sách & Vận hành",
      fields: [
        { key: "free_shipping_threshold", label: "Ngưỡng miễn phí ship (VNĐ)", type: "number", icon: Tag,      placeholder: "500000" },
        { key: "return_policy_days",      label: "Số ngày đổi trả",            type: "number", icon: FileText, placeholder: "30" },
        { key: "store_open_hours",        label: "Giờ làm việc",               type: "text",   icon: Store,    placeholder: "8:00 - 22:00 (Thứ 2 - CN)" },
        { key: "store_hotline",           label: "Hotline hỗ trợ",             type: "text",   icon: Phone,    placeholder: "1800 1234" },
      ],
    },
    {
      section: "API & Tích hợp",
      fields: [
        { key: "telegram_bot_token", label: "Telegram Bot Token", type: "password", icon: MessageCircle, placeholder: "••••••••" },
        { key: "telegram_chat_id",   label: "Telegram Chat ID",   type: "text",     icon: MessageCircle, placeholder: "-100xxxxxxxxxx" },
        { key: "gemini_api_key",     label: "Gemini AI API Key",  type: "password", icon: Tag,           placeholder: "AIza••••••••" },
        { key: "google_client_id",   label: "Google Client ID",   type: "text",     icon: Globe,         placeholder: "xxxx.apps.googleusercontent.com" },
      ],
    },
  ],
  seo: [
    {
      section: "Thẻ Meta cơ bản",
      fields: [
        { key: "seo_title",         label: "Title mặc định",                    type: "text",     icon: Tag,      placeholder: "PicklePro – Chuyên Pickleball Chính Hãng" },
        { key: "seo_description",   label: "Meta Description",                  type: "textarea", icon: FileText, placeholder: "Cửa hàng pickleball hàng đầu Việt Nam..." },
        { key: "seo_keywords",      label: "Từ khóa (cách nhau bởi dấu phẩy)", type: "textarea", icon: Tag,      placeholder: "pickleball, vợt pickleball, PicklePro" },
        { key: "seo_canonical_url", label: "Canonical URL",                     type: "text",     icon: Link2,    placeholder: "https://picklepro.vn" },
      ],
    },
    {
      section: "Open Graph (Facebook / Zalo)",
      fields: [
        { key: "og_title",       label: "OG Title",       type: "text",     icon: Tag,       placeholder: "PicklePro – Chuyên Pickleball Chính Hãng" },
        { key: "og_description", label: "OG Description", type: "textarea", icon: FileText,  placeholder: "Mua sắm pickleball chính hãng..." },
        { key: "og_image",       label: "OG Image URL",   type: "text",     icon: FileText, placeholder: "https://picklepro.vn/og-image.jpg" },
        { key: "og_type",        label: "OG Type",        type: "text",     icon: Tag,       placeholder: "website" },
      ],
    },
  ],
  social: [
    {
      section: "Mạng xã hội",
      fields: [
        { key: "social_facebook",  label: "Facebook Page URL",  type: "text", icon: Globe,         placeholder: "https://facebook.com/picklepro" },
        { key: "social_instagram", label: "Instagram URL",      type: "text", icon: AtSign,        placeholder: "https://instagram.com/picklepro" },
        { key: "social_youtube",   label: "Youtube Channel",    type: "text", icon: Video,         placeholder: "https://youtube.com/@picklepro" },
        { key: "social_tiktok",    label: "TikTok URL",         type: "text", icon: Share2,        placeholder: "https://tiktok.com/@picklepro" },
      ],
    },
  ],
} as const;

type TabId = keyof typeof SETTINGS_CONFIG;

function Field({
  field, value, onChange,
}: {
  field: any;
  value: string;
  onChange: (v: string) => void;
}) {
  const Icon = field.icon;
  const isTextarea = field.type === "textarea";
  const base: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px 9px 36px",
    background: "#f8f9fb",
    border: "1.5px solid #eef2f7",
    borderRadius: 8,
    fontSize: 13,
    color: "#323b4b",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {field.label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon size={13} style={{ position: "absolute", left: 11, top: isTextarea ? 11 : "50%", transform: isTextarea ? "none" : "translateY(-50%)", color: "#b0bac9" }} />
        {isTextarea ? (
          <textarea
            value={value}
            placeholder={field.placeholder}
            rows={3}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...base, paddingTop: 9, resize: "vertical", minHeight: 80 }}
          />
        ) : (
          <input
            type={field.type}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            style={base}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
        setLoading(false);
      });
  }, []);

  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lưu cài đặt thành công!");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const sections = SETTINGS_CONFIG[activeTab];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#323b4b", marginBottom: 4 }}>Cài đặt hệ thống</h1>
          <p style={{ fontSize: 13, color: "#8a98ac" }}>Quản lý thông tin, SEO và thương hiệu.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ height: 42, padding: "0 24px" }}
        >
          {saving ? <Loader2 className="spinner" size={16} /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu cài đặt"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "#fff", padding: 6, borderRadius: 12, border: "1px solid #eef2f7", width: "fit-content" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                color: isActive ? "#fff" : "#8a98ac",
                background: isActive ? "linear-gradient(135deg, #58d68d, #3cc06e)" : "transparent",
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "general" && (
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 22px", borderBottom: "1px solid #eef2f7", background: "#fafbfc" }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 1 }}>
              Thương hiệu — Logo & Favicon
            </h2>
          </div>
          <div style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <ImageUpload 
              label="Logo website"
              value={settings["store_logo"] || ""}
              onChange={(url) => set("store_logo", url)}
              onRemove={() => set("store_logo", "")}
              folder="site"
              type="logo"
            />
            <ImageUpload 
              label="Favicon"
              value={settings["store_favicon"] || ""}
              onChange={(url) => set("store_favicon", url)}
              onRemove={() => set("store_favicon", "")}
              folder="site"
              type="favicon"
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sections.map((section) => (
          <div key={section.section} style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "14px 22px", borderBottom: "1px solid #eef2f7", background: "#fafbfc" }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 1 }}>{section.section}</h2>
            </div>
            <div style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {section.fields.map((field: any) => (
                <Field
                  key={field.key}
                  field={field}
                  value={settings[field.key] || ""}
                  onChange={(v) => set(field.key, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
