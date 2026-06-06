import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, CrosshairMode, Time, LineStyle, IPriceLine } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { detectLiquidityPools } from '../indicators/liquidityPools';
import { calculateSupportResistance } from '../indicators/supportResistance';

interface CandlestickData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  open: number;
  high: number;
  low: number;
  close: number;
  time: any;
  pctChange?: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  currentPrice?: number;
  timeframe?: string;
  showSupportResistance?: boolean;
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
  timeframe = '1D',
  showSupportResistance = false,
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
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

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

    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setTooltip(null);
      } else {
        const data = param.seriesData.get(candlestickSeries) as any;
        if (data) {
          const open = data.open;
          const close = data.close;
          const high = data.high;
          const low = data.low;
          const pctChange = ((close - open) / open) * 100;
          
          setTooltip({
            visible: true,
            x: param.point.x,
            y: param.point.y,
            open,
            high,
            low,
            close,
            time: param.time,
            pctChange
          });
        }
      }
    });

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
      const activePools = detectLiquidityPools(data as any, timeframe);
      
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

    if (showSupportResistance) {
      const srLevels = calculateSupportResistance(data as any, timeframe);
      srLevels.forEach(level => {
        const color = level.type === 'resistance' ? 'rgba(244, 63, 94, 0.8)' : 'rgba(52, 211, 153, 0.8)';
        const title = level.type === 'resistance' ? `Res (${level.strength})` : `Sup (${level.strength})`;
        
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: level.price,
          color: color,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
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

  }, [data, showLiquidityPools, showSupportResistance, timeframe, manualLiqLines]);

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

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      {tooltip && tooltip.visible && (
        <div
          className="absolute z-50 pointer-events-none bg-[#141414]/90 backdrop-blur-sm border border-[#262626] rounded-lg shadow-xl p-3 text-[11px] font-mono whitespace-nowrap text-gray-300"
          style={{
            left: tooltip.x > (chartContainerRef.current?.clientWidth || 0) - 160 ? tooltip.x - 160 : tooltip.x + 15,
            top: tooltip.y > (chartContainerRef.current?.clientHeight || 0) - 180 ? tooltip.y - 180 : tooltip.y + 15,
          }}
        >
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-gray-500">O</span>
            <span className={tooltip.open > tooltip.close ? "text-red-400" : "text-emerald-400"}>
              {tooltip.open.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
            </span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-gray-500">H</span>
            <span className={tooltip.high > tooltip.close ? "text-emerald-400" : "text-white"}>
              {tooltip.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
            </span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-gray-500">L</span>
            <span className={tooltip.low < tooltip.close ? "text-red-400" : "text-white"}>
              {tooltip.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
            </span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-gray-500">C</span>
            <span className={tooltip.close > tooltip.open ? "text-emerald-400" : "text-red-400"}>
              {tooltip.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
            </span>
          </div>
          <div className="h-[1px] w-full bg-[#262626] my-2" />
          <div className="flex justify-between gap-4 font-semibold">
            <span className="text-gray-500">Change</span>
            <span className={tooltip.pctChange && tooltip.pctChange >= 0 ? "text-emerald-400" : "text-red-400"}>
              {tooltip.pctChange && tooltip.pctChange > 0 ? "+" : ""}
              {tooltip.pctChange?.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
