import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';
import { CandleData } from '../types';

interface Props {
  data: CandleData[];
  symbol: string;
  className?: string;
}

export const TradingViewChart: React.FC<Props> = ({ data, symbol, className }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 清除舊的 Chart (如果有的話)
    if (chartApiRef.current) {
      chartApiRef.current.remove();
      chartApiRef.current = null;
    }

    const handleResize = () => {
      chartApiRef.current?.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight, // Use container height
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      rightPriceScale: {
        borderColor: '#d1d4dc',
      },
      timeScale: {
        borderColor: '#d1d4dc',
      },
    });

    chartApiRef.current = chart;

    // Lightweight Charts v5 Syntax: 使用 addSeries 並傳入 Series Class
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // Tailwind green-500
      downColor: '#ef4444', // Tailwind red-500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // 轉換資料格式 (TradingView 嚴格要求時間排序與格式)
    // @ts-ignore lightweight-charts types can be picky
    candlestickSeries.setData(data);

    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartApiRef.current) {
        chartApiRef.current.remove();
        chartApiRef.current = null;
      }
    };
  }, [data, symbol]);

  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          行情走勢 ({symbol})
        </h2>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-slate-100 rounded text-slate-500 cursor-not-allowed">1D</span>
          <span className="px-2 py-1 bg-accent text-white rounded shadow-sm">1M</span>
          <span className="px-2 py-1 bg-slate-100 rounded text-slate-500 cursor-not-allowed">1Y</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full flex-1 min-h-[400px]" />
    </div>
  );
};