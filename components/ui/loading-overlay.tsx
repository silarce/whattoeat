"use client";

import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

type LoadingOverlayProps = {
  isLoading: boolean;
  message?: string;
  delay?: number;
};

export function LoadingOverlay({ isLoading, message = "載入中…", delay = 200 }: LoadingOverlayProps) {
  const [visible, setVisible] = useState(false);

  // isLoading 變 false 時，在 render 階段直接重置（避免 effect 同步 setState 警告）
  if (!isLoading && visible) setVisible(false);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm">
      <ClipLoader color="#f97316" size={36} speedMultiplier={0.8} />
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
}
