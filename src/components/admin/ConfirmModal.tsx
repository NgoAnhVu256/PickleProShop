"use client";

import { X, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này? Không thể hoàn tác.",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
}: ConfirmModalProps) {
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-200",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
    info: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
  };

  const iconStyles = {
    danger: "text-red-600 bg-red-50",
    warning: "text-amber-600 bg-amber-50",
    info: "text-blue-600 bg-blue-50",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${iconStyles[variant]}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
            </div>

            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
