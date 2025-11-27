import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { IS_DB_MOCK, MOCK_TRADES } from '../constants';
import { Trade } from '../types';

// 初始化 Firebase (僅在非模擬模式下)
let db: any = null;

if (!IS_DB_MOCK) {
  try {
    const configString = import.meta.env.VITE_FIREBASE_CONFIG_STRING;
    // 假設環境變數是一個 JSON 字符串
    const firebaseConfig = JSON.parse(configString);
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase Initialization Failed:", e);
    // 自動降級為模擬模式
  }
}

/**
 * 獲取交易歷史
 */
export const getTradeHistory = async (): Promise<Trade[]> => {
  if (IS_DB_MOCK || !db) {
    console.log('[Mock DB] Reading trade history...');
    // 從 localStorage 讀取以模擬持久化，如果沒有則使用預設 Mock
    const stored = localStorage.getItem('mock_trades');
    return stored ? JSON.parse(stored) : MOCK_TRADES;
  }

  try {
    const q = query(collection(db, 'trades'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
  } catch (error) {
    console.error("Firestore Read Error:", error);
    return [];
  }
};

/**
 * 執行交易 (寫入)
 */
export const executeTrade = async (trade: Omit<Trade, 'id' | 'timestamp' | 'status'>): Promise<Trade> => {
  const newTrade: Trade = {
    ...trade,
    id: `trade_${Date.now()}`,
    timestamp: Date.now(),
    status: 'FILLED'
  };

  if (IS_DB_MOCK || !db) {
    console.log('[Mock DB] Executing trade:', newTrade);
    // 模擬寫入 LocalStorage
    const currentTrades = await getTradeHistory();
    const updatedTrades = [newTrade, ...currentTrades];
    localStorage.setItem('mock_trades', JSON.stringify(updatedTrades));
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
    return newTrade;
  }

  try {
    const docRef = await addDoc(collection(db, 'trades'), {
      ...newTrade,
      timestamp: Date.now() // Use server timestamp in real app ideally, but simplified here
    });
    return { ...newTrade, id: docRef.id };
  } catch (error) {
    console.error("Firestore Write Error:", error);
    throw error;
  }
};