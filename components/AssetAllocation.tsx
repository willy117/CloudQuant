import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Trade, AssetAllocation as AssetType } from '../types';
import { CHART_COLORS } from '../constants';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  trades: Trade[];
}

export const AssetAllocation: React.FC<Props> = ({ trades }) => {
  // 計算目前持倉價值
  const allocation = useMemo(() => {
    const holdings: Record<string, number> = {};
    
    trades.forEach(trade => {
      if (!holdings[trade.symbol]) holdings[trade.symbol] = 0;
      // 假設只買不賣，簡化邏輯 (真實系統需處理賣出)
      holdings[trade.symbol] += trade.price * trade.quantity;
    });

    const totalValue = Object.values(holdings).reduce((a, b) => a + b, 0);

    return Object.entries(holdings).map(([symbol, value], index) => ({
      symbol,
      value,
      percentage: totalValue ? ((value / totalValue) * 100).toFixed(1) : 0,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [trades]);

  const totalPortfolioValue = allocation.reduce((acc, curr) => acc + curr.value, 0);

  const chartData = {
    labels: allocation.map(a => a.symbol),
    datasets: [
      {
        data: allocation.map(a => a.value),
        backgroundColor: allocation.map(a => a.color),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 12 }
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        資產分佈
      </h2>
      
      <div className="relative flex-1 min-h-[200px]">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-slate-400 text-xs">總資產 (USD)</span>
          <span className="text-2xl font-bold text-slate-800">
            ${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {allocation.map(item => (
          <div key={item.symbol} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="font-medium text-slate-700">{item.symbol}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-slate-500">${item.value.toLocaleString()}</span>
              <span className="font-bold text-slate-800 w-12 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};