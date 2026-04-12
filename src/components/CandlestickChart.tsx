import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, CrosshairMode, Time, LineStyle, IPriceLine } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import { detectDemandSupply } from '../indicators/demandSupply';
import { detectSupportResistance } from '../indicators/supportResistance';
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
  showDemandSupply?: boolean;
  showSupportResistance?: boolean;
  showLiquidityPools?: boolean;
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
  showDemandSupply = true,
  showSupportResistance = true,
  showLiquidityPools = true,
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

  // Handle data updates and indicators
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;
    
    seriesRef.current.setData(data);

    // Clear existing lines
    priceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line));
    priceLinesRef.current = [];

    // Calculate and add indicators
    if (showDemandSupply) {
      const zones = detectDemandSupply(data as any);
      zones.forEach(zone => {
        const color = zone.type === 'demand' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        const title = zone.type === 'demand' ? 'Demand' : 'Supply';
        
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: zone.top,
          color: color,
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `${title} Top`,
        }));
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: zone.bottom,
          color: color,
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `${title} Btm`,
        }));
      });
    }

    if (showSupportResistance) {
      const levels = detectSupportResistance(data as any);
      levels.forEach(level => {
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: level.price,
          color: level.type === 'support' ? '#3B82F6' : '#F59E0B',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: level.type === 'support' ? 'Support' : 'Resistance',
        }));
      });
    }

    if (showLiquidityPools) {
      const pools = detectLiquidityPools(data as any);
      pools.forEach(pool => {
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: pool.price,
          color: '#8B5CF6',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: pool.type === 'buy-side' ? 'Buy Liq' : 'Sell Liq',
        }));
      });
    }

  }, [data, showDemandSupply, showSupportResistance, showLiquidityPools]);

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
