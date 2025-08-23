import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts'

interface PriceDataPoint {
  timestamp: string
  price: number
  buyVol: number
  sellVol: number
  net: number
  tick: number
}

interface RealTimePriceChartProps {
  priceHistory: number[]
  currentPrice: number
  buyVolume: number
  sellVolume: number
  netFlow: number
  currentTick: number
}

const RealTimePriceChart = ({
  priceHistory,
  currentPrice,
  buyVolume,
  sellVolume,
  netFlow,
  currentTick
}: RealTimePriceChartProps) => {
  const [chartData, setChartData] = useState<PriceDataPoint[]>([])
  const [priceChange, setPriceChange] = useState(0)
  const [priceChangePercent, setPriceChangePercent] = useState(0)

  // 更新图表数据
  useEffect(() => {
    const newDataPoint: PriceDataPoint = {
      timestamp: new Date().toLocaleTimeString(),
      price: currentPrice,
      buyVol: buyVolume,
      sellVol: sellVolume,
      net: netFlow,
      tick: currentTick
    }

    setChartData(prev => {
      const updated = [...prev, newDataPoint].slice(-50) // 保留最近50个数据点
      
      // 计算价格变化
      if (updated.length >= 2) {
        const oldPrice = updated[updated.length - 2].price
        const change = currentPrice - oldPrice
        const changePercent = (change / oldPrice) * 100
        setPriceChange(change)
        setPriceChangePercent(changePercent)
      }
      
      return updated
    })
  }, [currentPrice, buyVolume, sellVolume, netFlow, currentTick])

  // 计算价格统计
  const prices = chartData.map(d => d.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : currentPrice
  const maxPrice = prices.length > 0 ? Math.max(...prices) : currentPrice
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : currentPrice

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <p className="mb-2 text-sm text-gray-300">{label}</p>
          <div className="space-y-1">
            <p className="text-white">
              Price: <span className="font-bold text-primary">${data.price.toFixed(2)}</span>
            </p>
            <p className="text-green-400">
              Buy: {data.buyVol.toFixed(1)}
            </p>
            <p className="text-red-400">
              Sell: {data.sellVol.toFixed(1)}
            </p>
            <p className={`${data.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Net: {data.net >= 0 ? '+' : ''}{data.net.toFixed(1)}
            </p>
            <p className="text-gray-400">
              Tick: {data.tick}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* 价格统计 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            ${currentPrice.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Current Price</p>
          {priceChange !== 0 && (
            <p className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </p>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-lg font-bold text-green-400">
            {buyVolume.toFixed(1)}
          </p>
          <p className="text-sm text-gray-400">Buy Volume</p>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-bold text-red-400">
            {sellVolume.toFixed(1)}
          </p>
          <p className="text-sm text-gray-400">Sell Volume</p>
        </div>
        
        <div className="text-center">
          <p className={`text-lg font-bold ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netFlow >= 0 ? '+' : ''}{netFlow.toFixed(1)}
          </p>
          <p className="text-sm text-gray-400">Net Flow</p>
        </div>
      </div>

      {/* 线形图 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#6B7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#6B7280' }}
              tickFormatter={(value) => `$${value.toFixed(1)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 平均价格线 */}
            {chartData.length > 5 && (
              <ReferenceLine 
                y={avgPrice} 
                stroke="#F59E0B" 
                strokeDasharray="5 5" 
              />
            )}
            
            {/* 价格线 */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#6366F1', strokeWidth: 2, fill: '#1F2937' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 简化的条形图显示成交量 */}
      <div className="h-20">
        <div className="flex items-end justify-center h-full space-x-1">
          {priceHistory.slice(-50).map((_, index) => {
            const dataPoint = chartData[index]
            if (!dataPoint) return null
            
            const maxVol = Math.max(...chartData.map(d => Math.max(d.buyVol, d.sellVol)))
            const buyHeight = maxVol > 0 ? (dataPoint.buyVol / maxVol) * 60 : 0
            const sellHeight = maxVol > 0 ? (dataPoint.sellVol / maxVol) * 60 : 0

            return (
              <div key={`price-bar-${index}-${dataPoint.tick}`} className="flex flex-col items-center space-y-1" style={{ width: '6px' }}>
                <motion.div
                  className="rounded-t bg-green-500/60"
                  style={{ height: `${buyHeight}px`, width: '3px' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${buyHeight}px` }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="rounded-b bg-red-500/60"
                  style={{ height: `${sellHeight}px`, width: '3px' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${sellHeight}px` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Buy Volume</span>
          <span>Sell Volume</span>
        </div>
      </div>

      {/* 价格统计汇总 */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-400">24h High</p>
          <p className="font-bold text-green-400">${maxPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">24h Low</p>
          <p className="font-bold text-red-400">${minPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Avg Price</p>
          <p className="font-bold text-yellow-400">${avgPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default RealTimePriceChart
