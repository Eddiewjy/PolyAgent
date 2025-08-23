import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line
} from 'recharts'

// WebSocket数据结构，来自perp-bot-mvp
interface PerpTickData {
  tick: number
  price: number
  buyVol: number
  sellVol: number
  net: number
  announcements: Array<{
    agentId: string
    text: string
    stance?: string
  }>
}

interface PriceChartProps {
  wsData: PerpTickData[]
  onMaxTickReached?: (tick: number) => void
  maxTick?: number
}

const PriceChart: React.FC<PriceChartProps> = ({
  wsData,
  onMaxTickReached,
  maxTick = 15
}) => {
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)

  // 计算价格变化
  useEffect(() => {
    if (wsData.length >= 2) {
      const currentPrice = wsData[wsData.length - 1].price
      const previousPrice = wsData[0].price
      const change = currentPrice - previousPrice
      const changePercent = (change / previousPrice) * 100

      setPriceChange(change)
      setPriceChangePercent(changePercent)
    }
  }, [wsData])

  // 检查是否达到最大tick数
  useEffect(() => {
    if (wsData.length > 0) {
      const latestTick = wsData[wsData.length - 1].tick
      if (latestTick >= maxTick && onMaxTickReached) {
        onMaxTickReached(latestTick)
      }
    }
  }, [wsData, onMaxTickReached, maxTick])

  // 获取最新的价格数据
  const latestData = useMemo(() => {
    return wsData.length > 0 ? wsData[wsData.length - 1] : null
  }, [wsData])

  // 这里不再需要价格统计信息
  // 我们已移除了相关显示

  // 格式化图表数据，增加时间戳，并过滤掉重复的tick
  const chartData = useMemo(() => {
    // 过滤掉重复的tick，只保留每个tick的最后一条数据
    const uniqueTicksData = wsData.reduce<PerpTickData[]>((acc, current) => {
      const existingIndex = acc.findIndex((item) => item.tick === current.tick)
      if (existingIndex >= 0) {
        // 替换已存在的tick数据（保留最新的）
        acc[existingIndex] = current
      } else {
        // 添加新的tick数据
        acc.push(current)
      }
      return acc
    }, [])

    // 按tick数值排序，确保图表横轴正确显示
    const sortedData = [...uniqueTicksData].sort((a, b) => a.tick - b.tick)

    return sortedData.map((data) => ({
      ...data,
      timestamp: `Tick ${data.tick}`,
      id: data.tick
    }))
  }, [wsData])

  // 自定义提示框
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <p className="mb-2 text-sm text-gray-300">{label}</p>
          <div className="space-y-1">
            <p className="text-white">
              价格:{' '}
              <span className="font-bold text-primary">
                ${data.price.toFixed(2)}
              </span>
            </p>
            <p className="text-green-400">买入量: {data.buyVol.toFixed(1)}</p>
            <p className="text-red-400">卖出量: {data.sellVol.toFixed(1)}</p>
            <p
              className={`${data.net >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              净流量: {data.net >= 0 ? '+' : ''}
              {data.net.toFixed(1)}
            </p>
            <p className="text-gray-400">Tick: {data.tick}</p>
          </div>
        </div>
      )
    }

    return null
  }

  // 如果没有数据，显示加载状态
  if (wsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-800 rounded-lg bg-gray-900/50">
        <p className="text-gray-400">waiting...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 当前价格显示 */}
      <div className="p-4 text-center border border-gray-700 rounded-lg bg-gray-800/50">
        <p className="text-2xl font-bold text-primary">
          ${latestData?.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-400">Price</p>
        {priceChange !== 0 && (
          <p
            className={`text-sm ${
              priceChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {priceChange >= 0 ? '+' : ''}
            {priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}
            {priceChangePercent.toFixed(2)}%)
          </p>
        )}
      </div>

      {/* 简单价格折线图 - 增加高度 */}
      <div
        className="p-4 border border-gray-800 rounded-lg bg-gray-900/30"
        style={{ height: '480px' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 5, bottom: 30 }} // 增加底部边距，为X轴标签留出更多空间
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#6B7280' }}
              height={60}
              allowDataOverflow={false}
              interval={
                chartData.length > 10 ? Math.ceil(chartData.length / 10) : 0
              } // 动态计算间隔，确保显示合适数量的tick
            />
            <YAxis
              domain={[
                (dataMin: number) => dataMin * 0.9995,
                (dataMax: number) => dataMax * 1.0005
              ]}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#6B7280' }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              tickCount={10}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 价格线 */}
            <Line
              type="monotone"
              dataKey="price"
              name="price"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ stroke: '#6366F1', strokeWidth: 2, fill: '#1F2937', r: 3 }}
              activeDot={{
                stroke: '#6366F1',
                strokeWidth: 2,
                fill: '#1F2937',
                r: 5
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PriceChart
