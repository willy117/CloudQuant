import { CandleData, Trade } from './types';

// ==========================================
// 1. 環境變數檢查 (Hybrid Mode Logic)
// ==========================================

// 檢查是否為模擬模式：如果沒有 API Key，則視為模擬環境
export const IS_MOCK_MODE = !import.meta.env?.VITE_FINNHUB_API_KEY;
export const IS_DB_MOCK = !import.meta.env?.VITE_FIREBASE_CONFIG_STRING;

if (IS_MOCK_MODE) {
  console.warn('%c[系統提示] 未偵測到 Finnhub API Key，啟動行情模擬模式 (Mock Mode)。', 'background: #fbbf24; color: #000; padding: 4px; border-radius: 2px;');
}
if (IS_DB_MOCK) {
  console.warn('%c[系統提示] 未偵測到 Firebase Config，啟動資料庫模擬模式。', 'background: #fbbf24; color: #000; padding: 4px; border-radius: 2px;');
}

// ==========================================
// 2. 模擬數據產生器 (Mock Generators)
// ==========================================

// 產生過去 30 天的模擬 K 線資料
const generateMockCandles = (days: number, startPrice: number): CandleData[] => {
  const data: CandleData[] = [];
  let currentPrice = startPrice;
  const now = new Date();
  
  for (let i = days; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const volatility = currentPrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    data.push({
      time: dateStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
    currentPrice = close;
  }
  return data;
};

export const MOCK_AAPL_CANDLES = generateMockCandles(30, 150);
export const MOCK_TSLA_CANDLES = generateMockCandles(30, 200);

// 模擬即時報價
export const MOCK_QUOTES: Record<string, any> = {
  AAPL: { c: 152.45, d: 1.25, dp: 0.82, h: 153.00, l: 150.50, o: 151.00, pc: 151.20 },
  TSLA: { c: 210.50, d: -2.30, dp: -1.08, h: 215.00, l: 208.00, o: 212.00, pc: 212.80 },
  NVDA: { c: 450.00, d: 5.00, dp: 1.12, h: 455.00, l: 445.00, o: 448.00, pc: 445.00 },
};

// 模擬持倉紀錄
export const MOCK_TRADES: Trade[] = [
  { id: 't1', symbol: 'AAPL', side: 'BUY', price: 145.00, quantity: 50, timestamp: Date.now() - 86400000 * 5, status: 'FILLED' },
  { id: 't2', symbol: 'TSLA', side: 'BUY', price: 190.00, quantity: 20, timestamp: Date.now() - 86400000 * 3, status: 'FILLED' },
  { id: 't3', symbol: 'NVDA', side: 'BUY', price: 400.00, quantity: 10, timestamp: Date.now() - 86400000 * 10, status: 'FILLED' },
];

export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
];