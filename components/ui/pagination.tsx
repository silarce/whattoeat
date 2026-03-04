"use client";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 sticky bottom-0 bg-white pb-5 dark:border-gray-800 dark:bg-gray-900">
      <Button
        variant="ghost"
        size="md"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        ← 上一頁
      </Button>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="md"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        下一頁 →
      </Button>
    </div>
  );
}
