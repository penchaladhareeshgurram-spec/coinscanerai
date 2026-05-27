import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, CrosshairMode, Time, LineStyle, IPriceLine } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import { detectLiquidityPools } from '../indicators/liquidityPools';

interface CandlestickData {
  time: Time;
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
  showLiquidityPools?: boolean;
  isDrawingLiqMode?: boolean;
  manualLiqLines?: number[];
  onLiqDrawn?: (price: number) => void;
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
  showLiquidityPools = true,
  isDrawingLiqMode = false,
  manualLiqLines = [],
  onLiqDrawn,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

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
        precision: 5,
        minMove: 0.00001,
      },
    });

    seriesRef.current = candlestickSeries;
    candlestickSeries.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [backgroundColor, textColor, upColor, downColor]);

  // Handle click for manual drawings
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    
    const clickHandler = (param: any) => {
      if (!param.point) return;
      
      const price = seriesRef.current!.coordinateToPrice(param.point.y);
      if (price !== null) {
        if (isDrawingLiqMode && onLiqDrawn) {
          onLiqDrawn(price);
        }
      }
    };
    
    chartRef.current.subscribeClick(clickHandler);
    
    // Change cursor based on drawing mode
    if (chartContainerRef.current) {
      chartContainerRef.current.style.cursor = isDrawingLiqMode ? 'crosshair' : 'default';
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.unsubscribeClick(clickHandler);
      }
    };
  }, [isDrawingLiqMode, onLiqDrawn]);

  // Handle data updates and indicators
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;
    
    seriesRef.current.setData(data);

    // Clear existing lines
    priceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line));
    priceLinesRef.current = [];

    // Calculate and add indicators
    const currentPriceVal = data.length > 0 ? (data[data.length - 1] as any).close : 0;

    if (showLiquidityPools) {
      const activePools = detectLiquidityPools(data as any);
      
      activePools.forEach(pool => {
        const color = pool.type === 'buy-side' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)';
        const title = pool.type === 'buy-side' ? 'Buy Liq' : 'Sell Liq';
        
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: pool.price,
          color: color,
          lineWidth: 1,
          lineStyle: LineStyle.LargeDashed,
          axisLabelVisible: true,
          title: title,
        }));
      });
    }

    if (manualLiqLines && manualLiqLines.length > 0) {
      manualLiqLines.forEach(linePrice => {
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: linePrice,
          color: '#A855F7',
          lineWidth: 2,
          lineStyle: LineStyle.LargeDashed,
          axisLabelVisible: true,
          title: 'Manual Liq',
        }));
      });
    }

  }, [data, showLiquidityPools, manualLiqLines]);

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
