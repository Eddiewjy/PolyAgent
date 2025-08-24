import { motion } from 'framer-motion'
import Button from './Button'
import { useEffect, useState } from 'react'
import { gameAPI } from '../utils/api'

interface LeaderboardItem {
  id: string
  equity: number
  realized: number
  volume: number
}

interface GameResultModalProps {
  isOpen: boolean
  onClose: () => void
  rankings?: Array<{
    id: number
    name: string
    portfolioValue: number
    percentChange: number
    tradingVolume: number
    trades: number
    isUser?: boolean
  }>
}

const GameResultModal = ({
  isOpen,
  onClose,
  rankings: propRankings
}: GameResultModalProps) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 从后端获取排行榜数据
  useEffect(() => {
    if (!isOpen) return

    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const response = await gameAPI.getLeaderboard(10) // 获取前10名
        setLeaderboardData(response.data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [isOpen])

  // 将后端数据转换为组件需要的格式
  const rankings =
    leaderboardData.length > 0
      ? leaderboardData.map((item, index) => ({
          id: index + 1,
          name: item.id.replace('-', ' ').toUpperCase(),
          portfolioValue: item.equity,
          percentChange: (item.realized / 1000) * 100 || 0, // 假设初始资金是1000，计算百分比变化
          tradingVolume: item.volume || 0,
          trades: Math.round(item.volume / 100) || 0, // 估算交易次数
          isUser: item.id.includes('user')
        }))
      : propRankings || []

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-4xl p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              游戏结束 - 最终排行榜
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              数据来自后端API，按总权益(equity)排序
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-full hover:bg-gray-800 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 顶部的奖杯和动画 */}
        <div className="flex flex-col items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <svg
              className="w-20 h-20 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5 3a2 2 0 012-2h6a2 2 0 012 2v1h2a2 2 0 012 2v2a2 2 0 01-2 2h-.5l.7 7.4a1 1 0 01-1 1.1H3.8a1 1 0 01-1-1.1L3.5 10H3a2 2 0 01-2-2V6a2 2 0 012-2h2V3zm3 10a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0-2a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm-3-8v1h8V3a1 1 0 00-1-1H6a1 1 0 00-1 1z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
          <motion.h3
            className="mt-2 text-xl font-bold text-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            交易已结束！
          </motion.h3>
        </div>

        {/* 前三名特别展示 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-8">
              <div className="w-12 h-12 border-t-2 rounded-full border-primary animate-spin"></div>
            </div>
          ) : (
            rankings.slice(0, 3).map((agent, index) => (
              <motion.div
                key={agent.id}
                className={`relative px-6 py-4 text-center rounded-lg ${
                  index === 0
                    ? 'bg-gradient-to-b from-yellow-500/20 to-yellow-700/20 border border-yellow-500/50'
                    : index === 1
                    ? 'bg-gradient-to-b from-gray-400/20 to-gray-600/20 border border-gray-400/50'
                    : 'bg-gradient-to-b from-amber-600/20 to-amber-800/20 border border-amber-600/50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.2 }}
              >
                <div
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full ${
                    index === 0
                      ? 'bg-yellow-500 text-black'
                      : index === 1
                      ? 'bg-gray-400 text-black'
                      : 'bg-amber-600 text-black'
                  }`}
                >
                  {index + 1}
                </div>
                <h4
                  className={`text-lg font-bold ${
                    agent.isUser ? 'text-primary' : 'text-white'
                  }`}
                >
                  {agent.name}
                </h4>
                <p className="mt-2 text-2xl font-bold">
                  ${agent.portfolioValue.toLocaleString()}
                </p>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-sm text-gray-300">
                    已实现收益: $
                    {(leaderboardData[index]?.realized || 0).toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    交易量: ${agent.tradingVolume.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* 完整排行榜 */}
        <div className="mb-6">
          <h3 className="mb-4 font-semibold text-gray-300">完整排行榜</h3>
          <div className="overflow-hidden border border-gray-800 rounded-lg">
            <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium text-gray-400 border-b border-gray-800 gap-x-4 bg-gray-800/50">
              <div className="col-span-1">排名</div>
              <div className="col-span-3">代理</div>
              <div className="col-span-3 text-right">总权益</div>
              <div className="col-span-2 text-right">已实现收益</div>
              <div className="col-span-3 text-right">交易量</div>
            </div>

            <div className="overflow-y-auto max-h-64">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-t-2 rounded-full border-primary animate-spin"></div>
                </div>
              ) : (
                rankings.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    className={`grid grid-cols-12 py-3 px-4 text-sm border-b border-gray-800 gap-x-4 items-center ${
                      agent.isUser
                        ? 'bg-primary/10'
                        : index % 2 === 0
                        ? 'bg-gray-800/20'
                        : ''
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <div className="col-span-1">
                      {index < 3 ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            index === 0
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : index === 1
                              ? 'bg-gray-400/20 text-gray-300'
                              : 'bg-amber-600/20 text-amber-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-gray-500">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex items-center col-span-3">
                      {agent.isUser && (
                        <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-primary"></span>
                      )}
                      <span
                        className={
                          agent.isUser ? 'text-primary font-medium' : ''
                        }
                      >
                        {agent.name}
                      </span>
                    </div>
                    <div className="col-span-3 text-right">
                      ${agent.portfolioValue.toLocaleString()}
                    </div>
                    <div
                      className={`col-span-2 text-right ${
                        agent.percentChange >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      $
                      {(leaderboardData[index]?.realized || 0).toLocaleString()}
                    </div>
                    <div className="col-span-3 text-right text-gray-300">
                      ${agent.tradingVolume.toLocaleString()}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <Button
            text="回到主页"
            variant="primary"
            onClick={() => (window.location.href = '/games')}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GameResultModal
