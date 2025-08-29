import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import Card from '../components/Card'
import MessageFeed from '../components/MessageFeed'
import RealTimePriceChart from '../components/RealTimePriceChart'
import { gameAPI, createGameWebSocket } from '../utils/api'

interface GameData {
  gameSession: any
  tick: number
  price: number
  agents: any[]
  messages: any[]
  history: number[]
}

// WebSocket data format for perp-bot-mvp
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

const RealTimeGamePage = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  const [gameData, setGameData] = useState<GameData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [marketHistory, setMarketHistory] = useState<number[]>([])
  const [currentPrice, setCurrentPrice] = useState(100)
  const [currentTick, setCurrentTick] = useState(0)
  const [buyVolume, setBuyVolume] = useState(0)
  const [sellVolume, setSellVolume] = useState(0)
  const [netFlow, setNetFlow] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [userAgent] = useState<any>(null)

  const wsRef = useRef<WebSocket | null>(null)

  // 加载游戏数据
  useEffect(() => {
    const loadGameData = async () => {
      if (!gameId) return

      try {
        setIsLoading(true)
        const response = await gameAPI.getGame(gameId)
        setGameData(response.data.game)
        setCurrentPrice(response.data.game.price || 100)
        setCurrentTick(response.data.game.tick || 0)

        // 初始化历史数据 - 用当前价格填充
        const initialHistory = Array(50).fill(response.data.game.price || 100)
        setMarketHistory(initialHistory)
      } catch (error) {
        console.error('Failed to load game data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGameData()
  }, [gameId])

  // WebSocket连接到perp-bot-mvp
  useEffect(() => {
    if (!gameData) return

    const connectWebSocket = () => {
      try {
        const ws = createGameWebSocket(gameId || '')
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected to perp-bot-mvp')
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const data: PerpTickData = JSON.parse(event.data)
            console.log('Received tick data:', data)

            // 更新价格和tick数据
            setCurrentPrice(data.price)
            setCurrentTick(data.tick)
            setBuyVolume(data.buyVol)
            setSellVolume(data.sellVol)
            setNetFlow(data.net)

            // 更新价格历史
            setMarketHistory((prev) => [...prev, data.price].slice(-100))

            // 处理公告消息
            if (data.announcements && data.announcements.length > 0) {
              const timestamp = Date.now()
              const newMessages = data.announcements.map((ann, index) => ({
                id: `${data.tick}-${ann.agentId}-${index}-${timestamp}`,
                senderId: ann.agentId,
                content: ann.text,
                timestamp: new Date().toISOString(),
                isPublic: true,
                impact: 50,
                stance: ann.stance || 'neutral'
              }))
              setMessages((prev) => [...newMessages, ...prev].slice(0, 50))
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket disconnected')
          setIsConnected(false)
          // 尝试重连
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [gameId, gameData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="mb-4 text-xl font-bold">Game Not Found</h2>
        <Button text="Back to Games" onClick={() => navigate('/games')} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-full hover:bg-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">
                {gameData.gameSession.name}
              </h1>
              <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">
                LIVE
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
            </div>
            <p className="text-gray-400">
              {gameData.gameSession.participants.length} bots • Tick:{' '}
              {currentTick}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 主要内容区 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 实时价格图表 */}
          <Card>
            <h3 className="mb-4 text-lg font-bold">Real-time Price Chart</h3>
            <RealTimePriceChart
              priceHistory={marketHistory}
              currentPrice={currentPrice}
              buyVolume={buyVolume}
              sellVolume={sellVolume}
              netFlow={netFlow}
              currentTick={currentTick}
            />
          </Card>

          {/* 代理排行榜 */}
          <Card>
            <h3 className="mb-4 text-lg font-bold">Active Bots</h3>
            <div className="space-y-2">
              {gameData.agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    agent.ownerId === 'user'
                      ? 'bg-primary/10 border border-primary'
                      : 'bg-gray-800/50'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-gray-400">{agent.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ${agent.portfolioValue.toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Win Rate: {agent.winRate.toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 游戏状态 */}
          <Card>
            <h3 className="mb-4 text-lg font-bold">Game Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-medium text-green-400">LIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Bots:</span>
                <span>{gameData.gameSession.participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Tick:</span>
                <span>{currentTick}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connection:</span>
                <span
                  className={isConnected ? 'text-green-400' : 'text-red-400'}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </Card>

          {/* 用户代理状态 */}
          {userAgent && (
            <Card>
              <h3 className="mb-4 text-lg font-bold">My Bot</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={userAgent.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{userAgent.name}</p>
                    <p className="text-sm text-gray-400">{userAgent.type}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-sm text-gray-300">{userAgent.prompt}</p>
                </div>
              </div>
            </Card>
          )}

          {/* 消息feed */}
          <MessageFeed
            messages={messages}
            isPublic={true}
            title="Bot Messages"
          />
        </div>
      </div>
    </div>
  )
}

export default RealTimeGamePage
