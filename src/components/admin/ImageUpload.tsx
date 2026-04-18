"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  folder?: string;
  type?: string;
}

export default function ImageUpload({ value, onChange, onRemove, label, folder = "uploads" }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 5MB)");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onChange(data.url);
        toast.success("Đã tải ảnh lên");
      } else {
        toast.error(data.error || "Lỗi tải ảnh");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!value) return;
    
    // Optional: Ask for confirmation for major images
    // if (!confirm("Xóa ảnh này?")) return;

    const oldUrl = value;
    
    // Internal clear
    onChange("");
    if (onRemove) onRemove();

    try {
      await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: oldUrl }),
      });
    } catch (error) {
      console.error("Failed to delete file from server", error);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {label && <label className="text-sm font-semibold text-gray-700 block mb-2">{label}</label>}
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-full aspect-square md:w-[200px] md:h-[200px] rounded-xl overflow-hidden border border-gray-200 group shadow-md bg-gray-50">
            <div className="absolute z-10 top-2 right-2">
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-all hover:scale-110"
              >
                <X size={14} />
              </button>
            </div>
            <img
              src={value}
              alt="Uploaded"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div 
            onClick={() => !loading && fileInputRef.current?.click()}
            className="w-full h-32 md:h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#58d68d] hover:bg-green-50/30 transition-all group"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#58d68d]" />
                <span className="text-xs font-medium text-gray-400">Đang tải...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Upload size={20} className="text-gray-400 group-hover:text-[#58d68d]" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-semibold text-gray-600">Click để chọn ảnh</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP (Tối đa 5MB)</p>
                </div>
              </>
            )}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
}
