import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, CrosshairMode } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface CandlestickData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  currentPrice?: number;
  colors?: {
    backgroundColor?: string;
    textColor?: string;
    upColor?: string;
    downColor?: string;
  };
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  currentPrice,
  colors: {
    backgroundColor = '#0A0A0A',
    textColor = '#A3A3A3',
    upColor = '#10B981',
    downColor = '#EF4444',
  } = {},
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: '#1A1A1A', style: 1 },
        horzLines: { color: '#1A1A1A', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#525252',
          style: 3,
          labelBackgroundColor: '#262626',
        },
        horzLine: {
          width: 1,
          color: '#525252',
          style: 3,
          labelBackgroundColor: '#262626',
        },
      },
      rightPriceScale: {
        borderColor: '#262626',
        autoScale: true,
      },
      timeScale: {
        borderColor: '#262626',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 12,
        fixLeftEdge: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    seriesRef.current = candlestickSeries;
    candlestickSeries.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, backgroundColor, textColor, upColor, downColor]);

  // Update the last candle with the current live price
  useEffect(() => {
    if (seriesRef.current && data.length > 0 && currentPrice) {
      const lastCandle = data[data.length - 1];
      const updatedCandle = {
        ...lastCandle,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
        close: currentPrice,
      };
      seriesRef.current.update(updatedCandle);
    }
  }, [currentPrice, data]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
