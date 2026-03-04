# What To Eat (吃什麼)

**What To Eat** 是一個專為「選擇困難症」患者設計的純前端地圖與轉盤應用程式。透過整合使用者的 GPS 定位與 Google Maps Places API，自動搜尋附近的餐廳，並透過生動的轉盤動畫，隨機幫使用者決定下一餐的落腳處。

---

## 🚀 核心功能

1. **智慧定位與周邊搜尋**
   - 透過瀏覽器 Geolocation API 即時獲取使用者精準座標。
   - 串接 Google Maps Places API，動態搜尋使用者 近、有點遠、遠 的餐廳資訊。
2. **互動式輪盤推薦**
   - 從搜尋結果中自動或手動挑選最多 10 家餐廳加入轉盤。
   - 點擊按鈕後進行流暢的旋轉動畫，隨機抽出今天的幸運餐廳，解決用餐的選擇困難。
3. **個人化收藏清單**
   - 支援將喜歡的餐廳加入「我的最愛」。
   - 資料完全落實於本地端 (IndexedDB)，重視隱私且無需註冊帳號。
   - 收藏的餐廳可一鍵直接加入輪盤，打造專屬的「自訂候選清單」。
4. **地圖與列表雙模式檢視**
   - 直覺的地圖標記 (Google Maps) 顯示周遭餐廳分布。
   - 清晰的列表模式，一次瀏覽餐廳評分、地址、營業狀態與實景圖片。

---

## 🛠 技術棧 (Tech Stack)

### 核心框架與語言
- **[Next.js 16](https://nextjs.org/) (App Router)** - 提供強大的 React 架構。
- **[React 19](https://react.dev/)** - UI 組件建構。
- **[TypeScript](https://www.typescriptlang.org/)** - 型別安全，提升開發與維護效率。

### 樣式與 UI 組件
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first 的 CSS 框架，快速建構響應式設計。
- **[Radix UI](https://www.radix-ui.com/)** - 提供無障礙 (a11y) 的底層 Headless UI (如 Tabs, Dialog)。
- **[clsx](https://github.com/lukeed/clsx) & [tailwind-merge](https://github.com/dcastil/tailwind-merge)** - 動態 className 處理。

### 狀態管理與 API 串接
- **[Google Maps JS API Loader](https://github.com/googlemaps/js-api-loader)** - 非同步載入地圖與 Places API。
- **[idb](https://github.com/jakearchibald/idb)** - 基於 Promise 的 IndexedDB 封裝套件，用於處理本地收藏。
- **Custom Hooks** - 包含 `use-geolocation`、`use-wheel`、`use-favorites`、`use-restaurant-search` 將業務邏輯模組化解耦。

---

## 🏗 專案架構與實作細節

專案採用了高度模組化的檔案結構與 Hook 驅動設計：

- **狀態流轉**：所有外部資料流程 (GPS → Google API 請求 → 轉盤清單 → 選中餐廳) 皆透過 Custom Hooks 維護，確保頁面 (`page.tsx`) 保持乾淨的組合層。
- **離線儲存實作** (`lib/favorites-db.ts`)：利用 `idb` 建構輕量級 Wrapper，實作 `get`, `add`, `remove`, `getAll` 等資料庫操作方法，達成無需後端的資料持久化。
- **響應式 UI (RWD)**：考量到戶外使用的情境，介面經過嚴格的手機 (Mobile-first) 與桌面端設計適配，包含可滑動的側邊面板 (`side-panel.tsx`) 等設計。

---

## 💻 本地環境建置與執行

### 1. 複製專案與安裝依賴

```bash
git clone <repository_url>
cd whattoeat
npm install
```

### 2. 環境變數設定

在專案根目錄下建立 `.env.local` 檔案，並填入您的 Google Maps API Key：

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的_google_maps_api_key
```
> **注意**：您的 API Key 需要啟用 **Maps JavaScript API** 與 **Places API**。

### 3. 啟動開發伺服器

```bash
npm run dev
```

接著在瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 即可預覽專案。
