"use client";
import { SunIcon, MoonIcon } from "@/components/icons";

import { useTheme } from "next-themes";
import { useEffect, useState, } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, []);

  if (!mounted) {
    // 避免 hydration mismatch，未掛載前顯示佔位
    return (
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        aria-label="切換主題"
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  const isDark = theme === "dark";



  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      aria-label={isDark ? "切換為日間模式" : "切換為夜間模式"}
      title={isDark ? "日間模式" : "夜間模式"}
    >
      {isDark ? (
        // 日間圖示（太陽）
        <SunIcon className="h-5 w-5 cursor-pointer" />
      ) : (
        // 夜間圖示（月亮）
        <MoonIcon className="h-5 w-5 cursor-pointer" />
      )}
    </button>
  );
}
