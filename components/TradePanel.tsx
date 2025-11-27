import React, { useState } from 'react';
import { Quote, Trade } from '../types';
import { executeTrade as executeFirestoreTrade } from '../services/firebaseService';
import { fetchStockQuote as getQuote } from '../services/marketService';

interface Props {
  onTradeComplete: () => void;
  trades: Trade[];
}

export const TradePanel: React.FC<Props> = ({ onTradeComplete, trades }) => {
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState<number>(1);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  const handleGetQuote = async () => {
    setLoading(true);
    const data = await getQuote(symbol);
    setQuote(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!quote) return;
    setExecuting(true);
    try {
      await executeFirestoreTrade({
        symbol,
        side: 'BUY',
        price: quote.c,
        quantity: quantity,
      });
      onTradeComplete(); // Refresh parent data
      alert(`[交易成功] 以 $${quote.c} 買入 ${quantity} 股 ${symbol}`);
    } catch (e) {
      console.error(e);
      alert('交易失敗，請檢查控制台');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* 交易表單 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
          執行交易
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">股票代號</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="例如: AAPL"
              />
              <button 
                onClick={handleGetQuote}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 focus:ring-4 focus:ring-slate-300 disabled:opacity-50"
              >
                {loading ? '查詢中...' : '詢價'}
              </button>
            </div>
          </div>

          {quote && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-slate-500">當前價格</div>
                  <div className="text-2xl font-bold text-slate-900">${quote.c}</div>
                </div>
                <div className={`text-sm font-medium ${quote.d >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {quote.d >= 0 ? '+' : ''}{quote.d} ({quote.dp}%)
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">數量 (股)</label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>

          <div className="pt-2">
             <button 
                onClick={handleSubmit}
                disabled={!quote || executing}
                className="w-full px-4 py-3 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {executing ? '下單處理中...' : `確認買入 ${quote ? `$${(quote.c * quantity).toFixed(2)}` : ''}`}
              </button>
          </div>
        </div>
      </div>

      {/* 歷史紀錄 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-4">近期交易</h2>
        <div className="overflow-y-auto flex-1 pr-1">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-3">代號</th>
                <th className="px-3 py-3 text-right">價格</th>
                <th className="px-3 py-3 text-right">數量</th>
                <th className="px-3 py-3 text-right">時間</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <tr key={trade.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900">{trade.symbol}</td>
                  <td className="px-3 py-3 text-right">${trade.price}</td>
                  <td className="px-3 py-3 text-right">{trade.quantity}</td>
                  <td className="px-3 py-3 text-right text-xs">
                    {new Date(trade.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4">尚無交易紀錄</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};