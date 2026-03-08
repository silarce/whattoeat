"use client";
import { XIcon } from "@/components/icons";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  // Escape 鍵關閉
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // 打開時鎖定 body 捲動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-gray-50 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-950",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* 關閉按鈕 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</span>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="關閉面板"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 內容 */}
        <div className="h-[calc(100%-57px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
