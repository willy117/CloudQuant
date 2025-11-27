import { CandleData, Quote } from '../types';
import { IS_MOCK_MODE, MOCK_AAPL_CANDLES, MOCK_TSLA_CANDLES, MOCK_QUOTES } from '../constants';

const API_KEY = import.meta.env?.VITE_FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

/**
 * 獲取 K 線資料 (Candles)
 * 策略：如果有 Key -> Call API; 否則 -> 回傳模擬資料
 */
export const fetchStockCandles = async (symbol: string, resolution: string = 'D'): Promise<CandleData[]> => {
  if (IS_MOCK_MODE) {
    // 模擬模式延遲，增加真實感
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log(`[Mock API] Fetching candles for ${symbol}`);
    if (symbol === 'TSLA') return MOCK_TSLA_CANDLES;
    return MOCK_AAPL_CANDLES; // Default Mock
  }

  try {
    // 簡單計算時間範圍 (過去 30 天)
    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 60 * 60); 

    const response = await fetch(
      `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
    );
    const data = await response.json();

    if (data.s === 'ok') {
      return data.t.map((timestamp: number, index: number) => ({
        time: timestamp, // TradingView supports unix timestamp
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
      }));
    } else {
      throw new Error('No data found');
    }
  } catch (error) {
    console.error("Finnhub API Error:", error);
    return MOCK_AAPL_CANDLES; // Fallback even in real mode if API fails
  }
};

/**
 * 獲取即時報價 (Quote)
 */
export const fetchStockQuote = async (symbol: string): Promise<Quote> => {
  if (IS_MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log(`[Mock API] Fetching quote for ${symbol}`);
    return MOCK_QUOTES[symbol] || MOCK_QUOTES['AAPL'];
  }

  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Finnhub Quote Error:", error);
    return MOCK_QUOTES['AAPL'];
  }
};