// 定義 K 線資料結構 (TradingView 格式)
export interface CandleData {
  time: string | number; // UNIX timestamp or YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// 定義交易紀錄
export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  status: 'FILLED' | 'PENDING';
}

// 定義即時報價
export interface Quote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High
  l: number; // Low
  o: number; // Open
  pc: number; // Previous close
}

// 資產分佈
export interface AssetAllocation {
  symbol: string;
  value: number;
  color: string;
}

// 全域環境變數類型擴充
declare global {
  interface ImportMetaEnv {
    readonly VITE_FINNHUB_API_KEY: string;
    readonly VITE_FIREBASE_CONFIG_STRING: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}