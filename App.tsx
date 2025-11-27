import React, { useState, useEffect } from 'react';
import { TradingViewChart } from './components/TradingViewChart';
import { AssetAllocation } from './components/AssetAllocation';
import { TradePanel } from './components/TradePanel';
import { fetchStockCandles, fetchStockQuote } from './services/marketService';
import { getTradeHistory } from './services/firebaseService';
import { CandleData, Trade } from './types';
import { IS_MOCK_MODE, IS_DB_MOCK } from './constants';

type ViewState = 'dashboard' | 'market' | 'wallet';

const App: React.FC = () => {
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  // 初始化資料
  useEffect(() => {
    loadMarketData();
    loadPortfolioData();
  }, [activeSymbol]);

  // 即時行情輪詢 (每 5 秒更新一次)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!activeSymbol || candles.length === 0) return;

      try {
        const quote = await fetchStockQuote(activeSymbol);
        
        setCandles(prevCandles => {
          if (prevCandles.length === 0) return prevCandles;
          
          const newCandles = [...prevCandles];
          const lastCandle = newCandles[newCandles.length - 1];
          
          // 更新最後一根 K 線
          // 注意：真實環境下需檢查 timestamp 是否跨日/跨分鐘，這裡簡化為直接更新當日數據
          const updatedCandle = {
            ...lastCandle,
            close: quote.c,
            high: Math.max(lastCandle.high, quote.c),
            low: Math.min(lastCandle.low, quote.c),
            // 若有成交量資訊可在此累加
          };

          newCandles[newCandles.length - 1] = updatedCandle;
          return newCandles;
        });
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // 5 seconds polling

    return () => clearInterval(intervalId);
  }, [activeSymbol, candles.length > 0]); // 依賴 activeSymbol 和是否已有初始資料

  const loadMarketData = async () => {
    const data = await fetchStockCandles(activeSymbol);
    setCandles(data);
  };

  const loadPortfolioData = async () => {
    const history = await getTradeHistory();
    setTrades(history);
  };

  const NavButton = ({ view, label, icon }: { view: ViewState, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => {
        setCurrentView(view);
        setSidebarOpen(false); // Mobile: close sidebar on click
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="font-bold text-xl text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">Q</div>
          CloudQuant
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">Q</div>
            CloudQuant
          </h1>
          <p className="text-xs text-slate-400 mt-2">Professional Trading</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          <NavButton 
            view="dashboard" 
            label="儀表板首頁" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} 
          />
          <NavButton 
            view="market" 
            label="市場分析" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>} 
          />
          <NavButton 
            view="wallet" 
            label="資產錢包" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>} 
          />
        </nav>

        {/* System Status Indicators */}
        <div className="p-6">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">System Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Market Data</span>
                <span className={`px-2 py-0.5 rounded-full ${IS_MOCK_MODE ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {IS_MOCK_MODE ? 'Simulated' : 'Live Feed'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Database</span>
                <span className={`px-2 py-0.5 rounded-full ${IS_DB_MOCK ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {IS_DB_MOCK ? 'Local Mock' : 'Firebase'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {currentView === 'dashboard' && '市場概況'}
              {currentView === 'market' && '深度技術分析'}
              {currentView === 'wallet' && '資產與交易紀錄'}
            </h1>
            <p className="text-slate-500 text-sm">
              {currentView === 'dashboard' && '歡迎回來，檢視您的投資組合與即時行情。'}
              {currentView === 'market' && '即時 K 線圖表與交易執行。'}
              {currentView === 'wallet' && '您的資產分佈與歷史交易明細。'}
            </p>
          </div>
          
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            {['AAPL', 'TSLA', 'NVDA'].map(sym => (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeSymbol === sym 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
            {/* Main Chart (Col span 2) */}
            <div className="lg:col-span-2 space-y-6">
              <TradingViewChart data={candles} symbol={activeSymbol} />
              
              <div className="h-80">
                <AssetAllocation trades={trades} />
              </div>
            </div>

            {/* Right Panel (Trade Execution) */}
            <div className="lg:col-span-1 h-full min-h-[600px]">
              <TradePanel onTradeComplete={loadPortfolioData} trades={trades} />
            </div>
          </div>
        )}

        {currentView === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
            {/* Extended Chart View */}
            <div className="lg:col-span-2 h-full">
               <TradingViewChart data={candles} symbol={activeSymbol} className="h-full" />
            </div>
            <div className="lg:col-span-1 h-full">
               <TradePanel onTradeComplete={loadPortfolioData} trades={trades} />
            </div>
          </div>
        )}

        {currentView === 'wallet' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
              <AssetAllocation trades={trades} />
              {/* Stat Cards or Summary could go here, using a placeholder for balance */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center">
                <h3 className="text-slate-400 mb-2">總資產估值</h3>
                <div className="text-4xl font-bold mb-6">$1,245,670.00</div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/10 p-4 rounded-lg">
                      <div className="text-xs text-slate-400">當日損益</div>
                      <div className="text-xl font-bold text-emerald-400">+$12,450</div>
                   </div>
                   <div className="bg-white/10 p-4 rounded-lg">
                      <div className="text-xs text-slate-400">持倉數量</div>
                      <div className="text-xl font-bold">{trades.length} 筆</div>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h2 className="text-lg font-bold text-slate-800 mb-4">完整交易歷史</h2>
               <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">交易 ID</th>
                      <th className="px-4 py-3">代號</th>
                      <th className="px-4 py-3">方向</th>
                      <th className="px-4 py-3 text-right">價格</th>
                      <th className="px-4 py-3 text-right">數量</th>
                      <th className="px-4 py-3 text-right">總金額</th>
                      <th className="px-4 py-3 text-right">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(trade => (
                      <tr key={trade.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{trade.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{trade.symbol}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            {trade.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">${trade.price}</td>
                        <td className="px-4 py-3 text-right">{trade.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium">${(trade.price * trade.quantity).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-400">
                          {new Date(trade.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;