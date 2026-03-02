"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

type LocationPermissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
};

export function LocationPermissionModal({
  isOpen,
  onClose,
  onRetry,
}: LocationPermissionModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <div className="space-y-4">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl">
              📍
            </div>

            {/* Title */}
            <div>
              <Dialog.Title className="text-lg font-bold text-gray-900">
                需要定位權限
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-600">
                「What To Eat」需要存取您的位置，以搜尋附近餐廳。
              </p>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
              <p className="font-medium">如何開啟定位權限：</p>
              <p>• Chrome：網址列左側鎖頭 → 網站設定 → 位置</p>
              <p>• Safari：設定 → 隱私權與安全性 → 定位服務</p>
              <p>• Firefox：網址列左側盾牌 → 允許定位</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="flex-1"
              >
                重新嘗試
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
