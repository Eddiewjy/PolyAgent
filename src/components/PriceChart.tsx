import { useState, useMemo } from 'react';
import type { MarketData } from '../types';
import {
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ComposedChart
} from 'recharts';

// Extended data structure for candlestick chart
interface CandlestickData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface PriceChartProps {
  data: MarketData[];
}

const PriceChart = ({ data }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState('1d'); // 1h, 4h, 1d, 1w

  // Only use USDT data
  const selectedData = data.find(d => d.symbol === 'USDT') || data[0];
  
  // Price change color
  const priceChangeColor = 
    selectedData?.change > 0 ? 'text-green-500' : 
    selectedData?.change < 0 ? 'text-red-500' : 'text-gray-400';
  
  // Generate candlestick data based on selected currency (simulated data)
  const candlestickData = useMemo(() => {
    // Generate continuous candlestick data that evolves to the right
    // In a real application, this would be historical data from an API
    const generateCandlestickData = (): CandlestickData[] => {
      const now = new Date();
      const basePrice = selectedData?.price || 50000;
      const volatility = Math.abs(selectedData?.change || 2) / 100 * basePrice;
      const periods = timeframe === '1h' ? 60 : 
                     timeframe === '4h' ? 96 :
                     timeframe === '1d' ? 24 : 7;
      
      const result: CandlestickData[] = [];
      
      for (let i = 0; i < periods; i++) {
        // 根据索引创建时间，从过去到现在
        const time = new Date(now.getTime() - (periods - i) * (
          timeframe === '1h' ? 60 * 1000 :         // 每分钟一个点
          timeframe === '4h' ? 15 * 60 * 1000 :    // 每15分钟一个点
          timeframe === '1d' ? 60 * 60 * 1000 :    // 每小时一个点
          24 * 60 * 60 * 1000 / 7                  // 1周显示7个点，每天一个点
        ));
        
        // 基于上一个收盘价生成这一周期的开盘价（第一个周期使用 basePrice）
        const open = i === 0 ? basePrice : result[i - 1].close;
        
        // 基于开盘价生成价格变化，保持趋势连续性
        // 使用偏移的随机数使价格更自然地波动，且有轻微的趋势性
        // -0.45 而不是 -0.5 给予轻微的上涨偏向
        const trend = i > 0 ? (result[i - 1].close > result[i - 1].open ? 0.05 : -0.05) : 0;
        const priceMove = ((Math.random() - 0.45) + trend) * volatility;
        
        const close = open + priceMove;
        
        // 生成高低点，确保它们合理地围绕开盘和收盘价
        const high = Math.max(open, close) + Math.random() * volatility * 0.3;
        const low = Math.min(open, close) - Math.random() * volatility * 0.3;
        
        // 交易量也有一定的连续性，与价格变化幅度相关
        const volumeBase = selectedData?.volume * 0.05;
        const volumeVariation = Math.abs(priceMove) / volatility * selectedData?.volume * 0.08;
        const volume = Math.floor(volumeBase + volumeVariation);
        
        result.push({
          time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`,
          open,
          close,
          high,
          low,
          volume
        });
      }
      
      return result;
    };

    return generateCandlestickData();
  }, [selectedData, timeframe]);

  // 计算价格区间
  const priceMin = useMemo(() => 
    Math.min(...candlestickData.map(d => d.low)) * 0.995, 
    [candlestickData]
  );
  
  const priceMax = useMemo(() => 
    Math.max(...candlestickData.map(d => d.high)) * 1.005, 
    [candlestickData]
  );

  // 自定义 tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // 处理交易量图表的情况
      if (payload[0].dataKey === 'volume') {
        return (
          <div className="p-2 text-xs bg-gray-800 border border-gray-700 rounded-md">
            <p className="mb-1 font-medium">{data.time}</p>
            <p className="text-gray-300">Volume: <span className="text-white">${(data.volume / 1000000).toFixed(2)}M</span></p>
          </div>
        );
      }
      
      // 处理K线图的情况
      return (
        <div className="p-2 text-xs bg-gray-800 border border-gray-700 rounded-md">
          <p className="mb-1 font-medium">{data.time}</p>
          <p className="text-gray-300">Open: <span className="text-white">${data.open.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></p>
          <p className="text-gray-300">Close: <span className={data.close >= data.open ? "text-green-500" : "text-red-500"}>${data.close.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></p>
          <p className="text-gray-300">High: <span className="text-green-400">${data.high.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></p>
          <p className="text-gray-300">Low: <span className="text-red-400">${data.low.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></p>
          <p className="text-gray-300">Volume: <span className="text-blue-400">${(data.volume / 1000000).toFixed(2)}M</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 border bg-surface rounded-xl border-gray-700/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">USDT Market Data</h3>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400">Current Price</p>
          <p className="text-2xl font-bold">${selectedData?.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">24h Change</p>
          <p className={`text-lg font-bold ${priceChangeColor}`}>
            {selectedData?.change > 0 ? '+' : ''}{selectedData?.change.toFixed(2)}%
          </p>
        </div>
      </div>
      
      {/* 时间框架选择器 */}
      <div className="flex gap-2 mb-4">
        {['1h', '4h', '1d', '1w'].map(tf => (
          <button
            key={tf}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              timeframe === tf
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* K 线图 */}
      <div className="relative w-full mt-2 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={candlestickData}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#333333"
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              tick={{fontSize: 10, fill: '#9ca3af'}}
              axisLine={{ stroke: '#4b5563' }}
              tickLine={false}
              interval={Math.floor(candlestickData.length / 8)}
            />
            <YAxis 
              domain={[priceMin, priceMax]}
              tick={{fontSize: 10, fill: '#9ca3af'}}
              axisLine={{ stroke: '#4b5563' }}
              tickLine={false}
              orientation="right"
              tickFormatter={(value) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
              width={60}
            />
            <YAxis 
              yAxisId="volume"
              orientation="left"
              tick={false}
              axisLine={false}
              tickLine={false}
              domain={['dataMin', 'dataMax']}
              hide={true}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            
            {/* K 线 */}
            {candlestickData.map((entry, index) => (
              <rect
                key={`candle-${index}`}
                x={`${index * (100 / candlestickData.length) + (100 / candlestickData.length / 4)}%`}
                y={`${((priceMax - Math.max(entry.open, entry.close)) / (priceMax - priceMin)) * 100}%`}
                width={`${100 / candlestickData.length / 2}%`}
                height={`${(Math.abs(entry.close - entry.open) / (priceMax - priceMin)) * 100}%`}
                fill={entry.close >= entry.open ? '#10b981' : '#ef4444'}
                fillOpacity={0.8}
              />
            ))}
            
            {/* 上下影线 */}
            {candlestickData.map((entry, index) => (
              <line
                key={`wick-${index}`}
                x1={`${index * (100 / candlestickData.length) + (100 / candlestickData.length / 2)}%`}
                y1={`${((priceMax - entry.high) / (priceMax - priceMin)) * 100}%`}
                x2={`${index * (100 / candlestickData.length) + (100 / candlestickData.length / 2)}%`}
                y2={`${((priceMax - entry.low) / (priceMax - priceMin)) * 100}%`}
                stroke={entry.close >= entry.open ? '#10b981' : '#ef4444'}
                strokeWidth={1}
              />
            ))}
            
            {/* 交易量柱状图 */}
            <Bar 
              dataKey="volume" 
              yAxisId="volume" 
              fill="#6366f1" 
              opacity={0.3} 
              barSize={5}
              height={20}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* 交易量部分 */}
      <div className="relative w-full h-20 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={candlestickData}
            margin={{ top: 0, right: 5, bottom: 5, left: 5 }}
          >
            <XAxis 
              dataKey="time" 
              tick={{fontSize: 10, fill: '#9ca3af'}}
              axisLine={{ stroke: '#4b5563' }}
              tickLine={false}
              height={20}
              interval={Math.floor(candlestickData.length / 8)}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: '#6366f1', fillOpacity: 0.2 }}
            />
            <Bar dataKey="volume">
              {
                candlestickData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.close >= entry.open ? '#10b981' : '#ef4444'}
                    fillOpacity={0.5}
                  />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="p-2 rounded-lg bg-gray-800/50">
          <p className="text-xs text-gray-400">Volume (24h)</p>
          <p className="text-sm font-medium">
            ${(selectedData?.volume / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/50">
          <p className="text-xs text-gray-400">Orders</p>
          <p className="text-sm font-medium">
            {Math.floor(Math.random() * 1000) + 500}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/50">
          <p className="text-xs text-gray-400">Volatility</p>
          <p className="text-sm font-medium">
            {Math.abs(selectedData?.change * 1.5).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
