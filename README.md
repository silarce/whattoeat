# 🍽️ What To Eat — 吃什麼

一款基於地理定位的餐廳隨機抽選 Web App，透過轉盤動畫幫助「選擇困難症」的你快速決定今天要吃什麼。

## 功能特色

- **自動定位** — 開啟頁面即請求 GPS 定位，取得使用者周邊餐廳
- **多類型搜尋** — 同時搜尋餐廳、咖啡廳、烘焙坊、台式、日式、韓式、早午餐等多種餐飲類型
- **距離篩選** — 支援「近」(100m) 與「遠」(400m) 兩種距離帶，即時 client-side 過濾
- **轉盤抽選** — 從列表勾選最多 10 家餐廳放入轉盤，以 ease-out 動畫旋轉抽出結果
- **收藏功能** — 將喜愛的餐廳存入瀏覽器 IndexedDB
- **Google 地圖整合** — 即時顯示餐廳位置（包含使用者定位藍點、餐廳標記、選中標記）
- **深色模式** — 支援明亮 / 深色主題切換，地圖也會同步切換風格
- **響應式設計** — 桌面雙欄、行動裝置單欄 + 抽屜式側邊欄
- **使用說明** — 首次造訪自動彈出引導教學

## 技術架構

### 前端框架

| 技術                                          | 版本 | 用途                         |
| --------------------------------------------- | ---- | ---------------------------- |
| [Next.js](https://nextjs.org/)                | 16   | React 全端框架（App Router） |
| [React](https://react.dev/)                   | 19   | UI 渲染引擎                  |
| [TypeScript](https://www.typescriptlang.org/) | 5    | 靜態型別檢查                 |
| [Tailwind CSS](https://tailwindcss.com/)      | 4    | Utility-first CSS 框架       |

### UI 元件 & 樣式

| 套件                                                                                                 | 用途                          |
| ---------------------------------------------------------------------------------------------------- | ----------------------------- |
| [Radix UI](https://www.radix-ui.com/) (`@radix-ui/react-dialog`, `@radix-ui/react-tabs`)             | 無障礙 Dialog / Tabs 基礎元件 |
| [next-themes](https://github.com/pacocoursey/next-themes)                                            | 明亮/深色主題管理             |
| [react-spinners](https://www.davidhu.io/react-spinners/)                                             | Loading 動畫元件              |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Tailwind class 合併與衝突處理 |

### 外部 API

| API                                            | 用途                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- |
| **Google Maps JavaScript API**                 | 地圖顯示、AdvancedMarkerElement 自訂標記、明/暗風格切換    |
| **Google Places API (New)** — Nearby Search v1 | 依座標搜尋附近餐廳，回傳名稱、地址、評分、電話、營業狀態等 |
| **Geolocation API** (瀏覽器原生)               | 取得使用者 GPS 座標與定位精度                              |

### 本地存儲

| 技術                                                            | 用途                   |
| --------------------------------------------------------------- | ---------------------- |
| [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper) | 收藏餐廳的永久儲存     |
| localStorage                                                    | 記錄使用說明是否已顯示 |

### 開發工具

| 工具                                   | 用途                                   |
| -------------------------------------- | -------------------------------------- |
| ESLint 9 + eslint-config-next          | 程式碼品質檢查                         |
| Prettier + prettier-plugin-tailwindcss | 程式碼格式化（含 Tailwind class 排序） |

## 專案結構

```
whattoeat/
├── app/
│   ├── layout.tsx          # 根佈局（字型、Metadata、Providers）
│   ├── page.tsx            # 主頁面（整合所有 hooks 與元件）
│   ├── providers.tsx       # ThemeProvider 全域包裝
│   └── globals.css         # Tailwind v4 + 自訂深色模式樣式
├── components/
│   ├── header.tsx          # 頂部標題列（重新定位、主題切換、漢堡選單）
│   ├── wheel-section.tsx   # 轉盤區域（項目網格 + 操作按鈕）
│   ├── map-section.tsx     # 地圖區域包裝
│   ├── RestaurantMap.tsx   # Google Maps 核心元件（標記、InfoWindow）
│   ├── side-panel.tsx      # 側邊欄 Tabs（附近餐廳 / 收藏）
│   ├── restaurant-list.tsx # 餐廳列表（距離帶切換、勾選、收藏、分頁）
│   ├── favorites-section.tsx # 收藏列表
│   ├── winner-card.tsx     # 抽選結果 Modal（評分、地址、電話、導航）
│   ├── theme-toggle.tsx    # 明/暗主題切換按鈕
│   ├── location-permission-modal.tsx  # 定位權限引導
│   ├── gps-off-modal.tsx   # 行動裝置 GPS 未開啟提示
│   ├── usage-guide-modal.tsx # 首次使用說明
│   ├── icons/              # SVG Icon 元件
│   └── ui/                 # 通用 UI 元件（Button、Card、Badge、Tabs、Drawer 等）
├── hooks/
│   ├── use-geolocation.ts       # GPS 定位狀態管理
│   ├── use-restaurant-search.ts # 餐廳搜尋 + 距離過濾 + 分頁
│   ├── use-wheel.ts             # 轉盤動畫邏輯（ease-out、30 幀動畫）
│   └── use-favorites.ts         # IndexedDB 收藏 CRUD + 分頁
├── lib/
│   ├── places-api.ts       # Google Places Nearby Search 封裝（6 組並行搜尋 + Haversine 距離計算）
│   ├── favorites-db.ts     # IndexedDB 操作封裝（idb）
│   ├── google-maps-loader.ts # Google Maps JS API 動態載入
│   ├── map-icons.ts        # 地圖自訂標記 SVG（餐廳 pin、使用者藍點）
│   ├── show-modal.tsx      # 命令式 Modal 系統（動態建立 React Root）
│   ├── constants.ts        # 距離帶、API 參數、轉盤設定等常數
│   └── utils.ts            # cn()、pickRandom() 工具函式
├── types/
│   ├── restaurant.ts       # Restaurant / FavoriteRestaurant 型別
│   └── place.ts            # Google Places API 回應型別定義
└── public/
    ├── icons/              # PWA / Favicon
    └── img/                # 使用說明圖片
```

## 核心運作流程

```
1. 使用者開啟頁面
   └─ 自動請求 GPS 定位

2. 定位成功
   └─ 並行發送 6 組 Google Places Nearby Search 請求
      （restaurant / café / 台式 / 日韓 / 早午餐 / 外帶外送）
   └─ 合併去重 → 依距離排序

3. 瀏覽與篩選
   ├─ 切換「近 / 遠」距離帶（Client-side 即時過濾）
   ├─ 勾選餐廳加入轉盤（上限 10 家）
   └─ 在地圖上查看位置

4. 轉盤抽選
   └─ 30 幀 ease-out 動畫 → 結果 Modal 展示

5. 決策完成
   ├─ 查看詳細資訊（評分、地址、電話）
   ├─ 一鍵開啟 Google Maps 導航
   └─ 加入收藏以便下次使用
```

## 開始使用

### 環境需求

- Node.js 18+
- Google Maps API Key（需啟用 Maps JavaScript API 與 Places API）

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build

# 正式啟動
npm start
```

### 環境變數

需設定 Google Maps API Key（請參考 Next.js 環境變數文件設定 `.env.local`）。

### 可用指令

| 指令                   | 說明                |
| ---------------------- | ------------------- |
| `npm run dev`          | 啟動開發伺服器      |
| `npm run build`        | 建置正式版本        |
| `npm start`            | 啟動正式伺服器      |
| `npm run lint`         | ESLint 檢查         |
| `npm run typecheck`    | TypeScript 型別檢查 |
| `npm run format`       | Prettier 格式化     |
| `npm run format:check` | 檢查格式是否一致    |
