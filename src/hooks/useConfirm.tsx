"use client";

import { useState, useCallback } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
    setResolveRef(null);
  }, [resolveRef]);

  const handleClose = useCallback(() => {
    resolveRef?.(false);
    setIsOpen(false);
    setResolveRef(null);
  }, [resolveRef]);

  const ConfirmDialog = useCallback(() => (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
    />
  ), [isOpen, handleClose, handleConfirm, options]);

  return { confirm, ConfirmDialog };
}
