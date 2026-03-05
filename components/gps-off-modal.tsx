"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

type GpsOffModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function GpsOffModal({ isOpen, onClose }: GpsOffModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none dark:bg-gray-900">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-100">
                📍 請開啟 GPS 定位
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                偵測到您的裝置定位精度極低，可能尚未開啟 GPS。
                開啟後GPS重新整理頁面，搜尋結果會更準確。
              </p>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 space-y-1.5 dark:bg-gray-800 dark:text-gray-300">
              <p className="font-medium">如何開啟 GPS：</p>
              <p>• <span className="font-medium">iOS</span>：設定 → 隱私權與安全性 → 定位服務 → 開啟</p>
              <p>• <span className="font-medium">Android</span>：設定 → 位置資訊 → 開啟，並選擇「高精確度」</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                開啟後重新整理
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                繼續使用
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
