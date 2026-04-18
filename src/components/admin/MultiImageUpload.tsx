"use client";

import { useState } from "react";
import { Upload, X, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  label?: string;
  folder?: string;
}

export default function MultiImageUpload({ value, onChange, onRemove, label, folder = "uploads" }: MultiImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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
          uploadedUrls.push(data.url);
        }
      } catch (error) {
        console.error("Upload failed for file", file.name);
      }
    }

    onChange([...value, ...uploadedUrls]);
    setLoading(false);
    if (uploadedUrls.length > 0) {
      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`);
    }
  };

  const handleDelete = async (url: string) => {
    // Internal clear
    onChange(value.filter((item) => item !== url));
    if (onRemove) onRemove(url);

    try {
      await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch (error) {
      console.error("Failed to delete file from server", error);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {label && <label className="text-sm font-semibold text-gray-700 block mb-2">{label}</label>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
            <div className="absolute z-10 top-2 right-2">
              <button
                type="button"
                onClick={() => handleDelete(url)}
                className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
              >
                <X size={14} />
              </button>
            </div>
            <img src={url} alt="Gallery" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
          </div>
        ))}
        
        <label className="relative aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#58d68d] hover:bg-green-50/30 transition-all group min-h-[120px]">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#58d68d]" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Plus size={20} className="text-gray-400 group-hover:text-[#58d68d]" />
              </div>
              <span className="text-xs font-bold text-gray-500">Thêm ảnh</span>
            </>
          )}
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
}
