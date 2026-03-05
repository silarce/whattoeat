"use client";

import { showModal, useModalClose } from "@/lib/show-modal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import guideImg from "@/public/img/guide_1.png";
import { XIcon } from "./icons";

const STORAGE_KEY = "whattoeat_hide_guide";

function getHideGuide(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function setHideGuide() {
  localStorage.setItem(STORAGE_KEY, "1");
}

function UsageGuideContent() {
  const close = useModalClose();

  const handleDontShowAgain = () => {
    setHideGuide();
    close();
  };

  return (
    <div className={cn(
      "rounded-2xl bg-white p-6 shadow-2xl",
      "dark:bg-gray-900"
    )}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            📖 使用說明
          </h2>
          <button
            onClick={close}
            aria-label="關閉"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300 cursor-pointer"
          >
            <XIcon />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200">
            <p>專為「選擇困難症」設計！自動搜尋附近餐廳，透過趣味轉盤隨機幫你決定下一餐，輕鬆解決用餐煩惱。</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 space-y-2 dark:bg-gray-800">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Step 1 — 定位
            </p>
            <p>
              進入網站後會自動請求定位權限，允許後即可搜尋附近餐廳。也可隨時點擊「🔄 重新定位」更新位置。
              若沒有出現設置定位權限的提示，請先重新整理網頁試試。
              若無效則請參考附圖操作。
              <br />
              若使用移動裝置，請參考
              <br />
              <Link href="https://share.google/aimode/gfkK95m9GOUtt8kur"
                className="underline text-orange-500 hover:text-orange-400"
                target="_blank"
              >
                手機定位權限設置指南
              </Link>
              <br />
              <Link href="https://share.google/aimode/bBv99TYQTzrlN3ddV"
                className="underline text-orange-500 hover:text-orange-400"
                target="_blank"
              >
                手機定位權限解除封鎖指南
              </Link>

              <Image
                src={guideImg}
                alt="瀏覽器定位權限設置示意圖"
                className="mt-2 rounded-md border"
              />
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 space-y-2 dark:bg-gray-800">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Step 2 — 瀏覽與挑選
            </p>
            <p>
              搜尋結果會顯示在右側列表（手機請點右上角 ☰ 開啟）。可切換距離範圍，也可手動將餐廳加入或移出轉盤。
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 space-y-2 dark:bg-gray-800">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Step 3 — 轉盤決定
            </p>
            <p>
              點擊「開始轉」讓轉盤隨機幫你選一家餐廳！也可以點「抽十個」重新填充轉盤。
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 space-y-2 dark:bg-gray-800">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Step 4 — 收藏
            </p>
            <p>
              喜歡的餐廳可以加入收藏，下次就能快速找到！
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 space-y-2 dark:bg-gray-800">
            <p>
              {'若要再次查看說明請點擊左上小的小字"使用說明"'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="md" onClick={() => {
            close();
            handleDontShowAgain()
          }}>
            不再顯示
          </Button>
          <Button variant="primary" size="md" onClick={close}>
            我知道了！
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 命令式呼叫使用說明 Modal */
export function showUsageGuide() {
  return showModal(<UsageGuideContent />);
}

/** 首次進入時自動顯示（若未設定「不再顯示」） */
export function showUsageGuideIfNeeded() {
  if (!getHideGuide()) {
    showUsageGuide();
  }
}
