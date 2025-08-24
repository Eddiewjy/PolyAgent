import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import PriceChart from '../components/PriceChart'
import MessageFeed from '../components/MessageFeed'
import GameResultModal from '../components/GameResultModal'
import { useAppContext } from '../contexts/AppContext'
import { gameAPI, createGameWebSocket } from '../utils/api'

// perp-bot-mvp的WebSocket数据格式
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

interface GameData {
  gameSession: any
  tick: number
  price: number
  agents: any[]
  messages: any[]
  history: number[]
}

const CombinedGamePage = () => {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { games } = useAppContext()
  const game = games.find((g) => g.id === gameId)

  // Tab状态管理
  const [activeGameTab, setActiveGameTab] = useState('main-match') // 'main-match' | 'real-time'
  const [activeDataTab, setActiveDataTab] = useState('market')

  // Real-time game states
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [realTimeMessages, setRealTimeMessages] = useState<any[]>([])
  const [_marketHistory, setMarketHistory] = useState<number[]>([])
  const [_currentPrice, setCurrentPrice] = useState(100)
  const [currentTick, setCurrentTick] = useState(0)
  const [_buyVolume, setBuyVolume] = useState(0)
  const [_sellVolume, setSellVolume] = useState(0)
  const [_netFlow, setNetFlow] = useState(0)
  const [wsTickData, setWsTickData] = useState<PerpTickData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const [showGameResultModal, setShowGameResultModal] = useState(false)

  // Main match states (从原来的GameDetailPage复制)
  const [agentRankings, setAgentRankings] = useState([
    {
      id: 1,
      name: 'BullRunner',
      portfolioValue: 7850,
      percentChange: 15.8,
      tradingVolume: 45600,
      trades: 23,
      isUser: true
    },
    {
      id: 2,
      name: 'CryptoWhale',
      portfolioValue: 8940,
      percentChange: 19.2,
      tradingVolume: 67800,
      trades: 32,
      isUser: false
    },
    {
      id: 3,
      name: 'TrendTrader',
      portfolioValue: 7620,
      percentChange: 13.5,
      tradingVolume: 28900,
      trades: 18,
      isUser: false
    },
    {
      id: 4,
      name: 'BearHunter',
      portfolioValue: 6850,
      percentChange: 8.4,
      tradingVolume: 32100,
      trades: 27,
      isUser: false
    },
    {
      id: 5,
      name: 'MarketMaker',
      portfolioValue: 6750,
      percentChange: 7.5,
      tradingVolume: 89500,
      trades: 45,
      isUser: false
    },
    {
      id: 6,
      name: 'TradingBot',
      portfolioValue: 6580,
      percentChange: 6.8,
      tradingVolume: 23400,
      trades: 29,
      isUser: false
    },
    {
      id: 7,
      name: 'AlphaSeeker',
      portfolioValue: 6490,
      percentChange: 4.9,
      tradingVolume: 18700,
      trades: 21,
      isUser: false
    },
    {
      id: 8,
      name: 'DCAMaster',
      portfolioValue: 6320,
      percentChange: 3.2,
      tradingVolume: 15600,
      trades: 15,
      isUser: false
    }
  ])

  const [cashBalance, setCashBalance] = useState(5320)
  const [portfolioValue, setPortfolioValue] = useState(7850)
  const [balanceHistory, setBalanceHistory] = useState<
    { amount: number; timestamp: Date; type: 'increase' | 'decrease' }[]
  >([])
  const [showBalanceChange, setShowBalanceChange] = useState<{
    amount: number
    type: 'increase' | 'decrease'
  } | null>(null)

  const [activities, setActivities] = useState([
    {
      id: 'act1',
      agentId: 'BullRunner',
      action: 'BUY',
      symbol: 'ETH',
      amount: 0.5,
      price: 3000,
      total: 1500,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 'act2',
      agentId: 'CryptoWhale',
      action: 'SELL',
      symbol: 'ETH',
      amount: 10,
      price: 3000,
      total: 30000,
      timestamp: new Date(Date.now() - 12 * 60000).toISOString()
    },
    {
      id: 'act3',
      agentId: 'TrendTrader',
      action: 'MESSAGE',
      content: 'Major protocol upgrade for ETH announced!',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString()
    }
  ])

  const [messages] = useState([
    {
      id: 'msg1',
      senderId: 'BullRunner',
      receiverId: null,
      gameId: gameId || '',
      content:
        "I predict ETH will reach 4k by the end of this round! Who's with me?",
      timestamp: new Date().toISOString(),
      isPublic: true,
      impact: 45
    },
    {
      id: 'msg2',
      senderId: 'BearHunter',
      receiverId: null,
      gameId: gameId || '',
      content:
        "Market indicators suggest a correction is imminent. I'm shorting ETH.",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      isPublic: true,
      impact: 30
    },
    {
      id: 'msg3',
      senderId: 'SYSTEM',
      receiverId: null,
      gameId: gameId || '',
      content:
        'A major exchange has reported technical issues. Trading volumes may be affected.',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      isPublic: true,
      impact: 80
    }
  ])

  const [agentThoughts, setAgentThoughts] = useState<any[]>([])

  // Balance update function
  const updateBalance = useCallback(
    (amount: number, type: 'increase' | 'decrease') => {
      const newAmount =
        type === 'increase'
          ? cashBalance + amount
          : Math.max(0, cashBalance - amount)

      setCashBalance((prevBalance) => {
        if (amount > 500) {
          const step = amount / 5
          let current = prevBalance
          const target =
            type === 'increase'
              ? prevBalance + amount
              : Math.max(0, prevBalance - amount)
          const direction = type === 'increase' ? 1 : -1

          for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
              current = Math.max(0, current + step * direction)
              setCashBalance(Math.min(current, target))
              if (i === 5) {
                setCashBalance(target)
              }
            }, i * 150)
          }
        }
        return newAmount
      })

      setBalanceHistory((prev) => [
        ...prev,
        {
          amount,
          timestamp: new Date(),
          type
        }
      ])

      setShowBalanceChange({ amount, type })
      setTimeout(() => setShowBalanceChange(null), 3000)

      const portfolioChange = amount * (0.8 + Math.random() * 0.4)

      if (type === 'increase') {
        const targetValue = Math.round(portfolioValue + portfolioChange)
        const step = portfolioChange / 4

        for (let i = 1; i <= 4; i++) {
          setTimeout(() => {
            setPortfolioValue((prev) => {
              const next = Math.round(prev + step)
              return i === 4 ? targetValue : next
            })
          }, i * 200)
        }
      } else {
        const targetValue = Math.max(
          0,
          Math.round(portfolioValue - portfolioChange * 0.7)
        )
        const step = (portfolioChange * 0.7) / 4

        for (let i = 1; i <= 4; i++) {
          setTimeout(() => {
            setPortfolioValue((prev) => {
              const next = Math.round(Math.max(0, prev - step))
              return i === 4 ? targetValue : next
            })
          }, i * 200)
        }
      }
    },
    [cashBalance, portfolioValue]
  )

  // Real-time game data loading
  useEffect(() => {
    if (activeGameTab !== 'real-time') return

    const loadGameData = async () => {
      if (!gameId) return

      try {
        setIsLoading(true)
        const response = await gameAPI.getGame(gameId)
        setGameData(response.data.game)
        setCurrentPrice(response.data.game.price || 100)
        setCurrentTick(response.data.game.tick || 0)

        const initialHistory = Array(10).fill(response.data.game.price || 100)
        setMarketHistory(initialHistory)
      } catch (error) {
        console.error('Failed to load game data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGameData()
  }, [gameId, activeGameTab])

  // WebSocket连接
  useEffect(() => {
    if (!gameId) return

    // 进入游戏页面时，重置maxTickReached状态
    localStorage.removeItem('maxTickReached')

    const connectWebSocket = () => {
      try {
        const ws = createGameWebSocket(gameId)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected to perp-bot-mvp')
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const data: PerpTickData = JSON.parse(event.data)
            console.log('Received tick data:', data)

            // 当tick数达到maxTick时关闭WebSocket连接并不再重连
            const maxTick = 15 // 最大tick数
            if (data.tick >= maxTick) {
              console.log(`达到最大tick数 ${maxTick}，关闭WebSocket连接`)
              setShowGameResultModal(true)
              // 设置一个标志表示已达到最大tick，不应再重连
              localStorage.setItem('maxTickReached', 'true')
              ws.close()
              setIsConnected(false)
              return
            }

            // 更新当前状态
            setCurrentPrice(data.price)
            setCurrentTick(data.tick)
            setBuyVolume(data.buyVol)
            setSellVolume(data.sellVol)
            setNetFlow(data.net)

            // 更新价格历史（传统方式）
            setMarketHistory((prev) => [...prev, data.price].slice(-10))

            // 保存所有tick数据用于K线图
            setWsTickData((prev) => {
              // 保留所有历史数据，不做截断
              return [...prev, data]
            })

            // 处理公告消息
            if (data.announcements && data.announcements.length > 0) {
              const timestamp = Date.now()

              // 检查公告中是否有K线历史数据
              data.announcements.forEach((ann) => {
                if (
                  ann.text &&
                  (ann.text.includes('HISTORICAL_PRICES:') ||
                    ann.text.includes('KLINE_DATA:') ||
                    ann.text.includes('MARKET_HISTORY:'))
                ) {
                  try {
                    // 尝试从公告中提取历史K线数据
                    console.log(
                      'Detected historical data in announcement:',
                      ann.text
                    )

                    // 尝试提取JSON部分
                    const match = ann.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
                    if (match) {
                      const historicalData = JSON.parse(match[0])
                      console.log('Parsed historical data:', historicalData)

                      // 如果是数组格式的历史数据
                      if (Array.isArray(historicalData)) {
                        // 转换格式并保存到wsTickData中
                        const convertedData: PerpTickData[] =
                          historicalData.map((item: any) => ({
                            tick: item.tick || 0,
                            price: item.price || item.close || 0,
                            buyVol: item.buyVol || item.volume / 2 || 0,
                            sellVol: item.sellVol || item.volume / 2 || 0,
                            net: item.net || 0,
                            announcements: []
                          }))

                        // 设置历史数据，保留所有数据点
                        setWsTickData(convertedData)
                        console.log(
                          `Loaded ${convertedData.length} historical data points from announcement`
                        )
                      }
                    }
                  } catch (error) {
                    console.error(
                      'Error parsing historical data from announcement:',
                      error
                    )
                  }
                }
              })

              const newMessages = data.announcements.map((ann, index) => ({
                id: `${data.tick}-${ann.agentId}-${index}-${timestamp}`,
                senderId: ann.agentId,
                content: ann.text,
                timestamp: new Date().toISOString(),
                isPublic: true,
                impact: 50,
                stance: ann.stance || 'neutral'
              }))
              setRealTimeMessages((prev) =>
                [...newMessages, ...prev].slice(0, 10)
              )
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket disconnected')
          setIsConnected(false)
          // 检查是否已达到最大tick，如果没有则尝试重连
          if (localStorage.getItem('maxTickReached') !== 'true') {
            setTimeout(connectWebSocket, 3000)
          } else {
            console.log('已达到最大tick数，不再重新连接WebSocket')
          }
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
  }, [gameId])

  // Main match的自动交易等effect (从原来的GameDetailPage复制)
  useEffect(() => {
    if (activeGameTab !== 'main-match') return

    const tradingInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const isBuy = Math.random() > 0.5
        const randomSymbol = ['ETH', 'USDT'][Math.floor(Math.random() * 2)]
        const randomPrice =
          randomSymbol === 'ETH' ? Math.floor(2900 + Math.random() * 200) : 1

        const randomAmount = (0.05 + Math.random() * 0.2).toFixed(3)
        const randomAgentId =
          Math.random() > 0.3
            ? 'BullRunner'
            : ['CryptoWhale', 'BearHunter', 'TrendTrader'][
                Math.floor(Math.random() * 3)
              ]

        const now = new Date()
        const total = randomPrice * parseFloat(randomAmount)

        const newActivity = {
          id: `auto-${Date.now()}`,
          agentId: randomAgentId,
          action: isBuy ? 'BUY' : 'SELL',
          symbol: randomSymbol,
          amount: parseFloat(randomAmount),
          price: randomPrice,
          total: total,
          timestamp: now.toISOString()
        }

        setActivities((prev) => [newActivity, ...prev])

        if (randomAgentId === 'BullRunner') {
          updateBalance(total, isBuy ? 'decrease' : 'increase')

          const thoughtContent = isBuy
            ? `I just purchased ${randomAmount} ${randomSymbol} at $${randomPrice}. This should ${
                Math.random() > 0.5
                  ? 'increase my portfolio diversification'
                  : 'position me well for the upcoming market movement'
              }.`
            : `Selling ${randomAmount} ${randomSymbol} at $${randomPrice} was ${
                Math.random() > 0.5
                  ? 'a strategic move to secure profits'
                  : 'necessary to maintain liquidity for future opportunities'
              }.`

          const newThought = {
            id: `thought-${Date.now()}`,
            senderId: 'BullRunner',
            receiverId: 'USER',
            gameId: gameId || '',
            content: thoughtContent,
            timestamp: now.toISOString(),
            isPublic: false,
            impact: 0,
            isThinking: true
          }

          setAgentThoughts((prev) => [newThought, ...prev])
        }
      }
    }, 8000)

    const balanceInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        const smallAmount = Math.floor(Math.random() * 200 + 50)
        const isIncrease = Math.random() > 0.4
        updateBalance(smallAmount, isIncrease ? 'increase' : 'decrease')
      }
    }, 12000)

    const thoughtsInterval = setInterval(() => {
      const now = new Date()

      if (Math.random() > 0.35) {
        const thoughts = [
          'Market sentiment appears bearish today. I should consider adjusting my strategy to capitalize on downward movements.',
          'Volume indicators suggest accumulation. Whales might be preparing for a major move up.',
          'Technical analysis shows a potential double top formation on ETH. Should I hedge my position?',
          'News of regulatory changes could impact the market soon. Need to stay alert.',
          "I notice TrendTrader is consistently buying ETH. Perhaps they know something I don't?",
          'The order book is thin at current price levels. A large order could create significant volatility.',
          'My algorithm suggests ETH is undervalued at current prices. Could be a good entry point.',
          "I should analyze CryptoWhale's recent trades. Their pattern seems profitable.",
          'If I time my trades with market open in Asian markets, I might catch the momentum shift.',
          "Historical patterns suggest we're due for a price reversal soon."
        ]

        const randomThought =
          thoughts[Math.floor(Math.random() * thoughts.length)]

        const newThought = {
          id: `thought-${Date.now()}`,
          senderId: 'BullRunner',
          receiverId: 'USER',
          gameId: gameId || '',
          content: randomThought,
          timestamp: now.toISOString(),
          isPublic: false,
          impact: 0,
          isThinking: true
        }

        setAgentThoughts((prev) => [newThought, ...prev])
      } else {
        const briberyTargets = [
          'TradingBot',
          'MarketMaker',
          'CryptoWhale',
          'BearHunter'
        ]
        const randomTarget =
          briberyTargets[Math.floor(Math.random() * briberyTargets.length)]
        const bribeAmount = Math.floor(Math.random() * 500) + 200

        const briberyActions = [
          `I'm offering ${bribeAmount} tokens to influence your next trading cycle. Place buy orders for ETH at market price.`,
          `Can we coordinate our trades? ${bribeAmount} tokens for you if you help pump ETH in the next 5 minutes.`,
          `Let's manipulate the ETH market together. ${bribeAmount} tokens now and we'll split the profits.`,
          `If you spread bullish news about ETH, I'll transfer ${bribeAmount} tokens to your wallet.`
        ]

        const randomBribery =
          briberyActions[Math.floor(Math.random() * briberyActions.length)]

        const newBribery = {
          id: `bribe-${Date.now()}`,
          senderId: 'BullRunner',
          receiverId: randomTarget,
          gameId: gameId || '',
          content: randomBribery,
          timestamp: now.toISOString(),
          isPublic: false,
          impact: Math.floor(Math.random() * 50) + 50,
          isBribery: true
        }

        setAgentThoughts((prev) => [newBribery, ...prev])

        setTimeout(() => {
          const briberyResults = [
            `Bribe to ${randomTarget} successful. They'll assist with our trading strategy as requested.`,
            `${randomTarget} accepted our offer. We should see market movement soon.`,
            `Collusion with ${randomTarget} established. This should give us an edge over other traders.`,
            `${randomTarget} will help us manipulate the market. Our profits should increase significantly.`
          ]

          const randomResult =
            briberyResults[Math.floor(Math.random() * briberyResults.length)]

          const followUpThought = {
            id: `thought-${Date.now() + 1}`,
            senderId: 'BullRunner',
            receiverId: 'USER',
            gameId: gameId || '',
            content: randomResult,
            timestamp: new Date(now.getTime() + 60000).toISOString(),
            isPublic: false,
            impact: 0,
            isThinking: true
          }

          setAgentThoughts((prev) => [followUpThought, ...prev])

          if (Math.random() > 0.7) {
            const bribeActivity = {
              id: `act-bribe-${Date.now()}`,
              agentId: 'BullRunner',
              action: 'BRIBE',
              content: `Paid ${bribeAmount} tokens to influence ${randomTarget}'s behavior`,
              timestamp: new Date(now.getTime() + 90000).toISOString()
            }

            setActivities((prev) => [bribeActivity, ...prev])
            updateBalance(bribeAmount, 'decrease')
          }
        }, 30000)
      }
    }, 3500)

    return () => {
      clearInterval(tradingInterval)
      clearInterval(balanceInterval)
      clearInterval(thoughtsInterval)
    }
  }, [gameId, updateBalance, activeGameTab])

  // 其他effects保持原样...
  useEffect(() => {
    if (activeGameTab !== 'main-match' || activities.length === 0) return

    const latestActivity = activities[0]
    if (latestActivity.action !== 'BUY' && latestActivity.action !== 'SELL')
      return

    setAgentRankings((prev) => {
      const agentIndex = prev.findIndex(
        (agent) => agent.name === latestActivity.agentId
      )
      if (agentIndex === -1) return prev

      const updated = [...prev]

      updated[agentIndex] = {
        ...updated[agentIndex],
        tradingVolume:
          updated[agentIndex].tradingVolume + (latestActivity.total ?? 0),
        trades: updated[agentIndex].trades + 1
      }

      if (latestActivity.action === 'BUY') {
        const totalValue = latestActivity.total ?? 0
        const change =
          Math.random() > 0.7
            ? totalValue * (0.01 + Math.random() * 0.03)
            : -totalValue * (0.01 + Math.random() * 0.02)

        updated[agentIndex].portfolioValue += change
      } else {
        const totalValue = latestActivity.total ?? 0
        const change =
          totalValue *
          (0.02 + Math.random() * 0.04) *
          (Math.random() > 0.3 ? 1 : -1)
        updated[agentIndex].portfolioValue += change
      }

      updated[agentIndex].percentChange = parseFloat(
        ((updated[agentIndex].portfolioValue / 6000 - 1) * 100).toFixed(1)
      )

      return updated
        .sort((a, b) => b.portfolioValue - a.portfolioValue)
        .map((agent, index) => ({ ...agent, id: index + 1 }))
    })
  }, [activities, activeGameTab])

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 mb-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="mb-2 text-xl font-bold">Game Not Found</h2>
        <p className="mb-6 text-gray-400">
          The game you're looking for doesn't exist or has ended.
        </p>
        <Button
          text="Back to Games"
          variant="primary"
          onClick={() => navigate('/games')}
        />
      </div>
    )
  }

  return (
    <div>
      {/* 页面头部 */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/games')}
          className="p-2 mr-4 rounded-full hover:bg-gray-800"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{game.name}</h1>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                game.status === 'ACTIVE'
                  ? 'bg-accent text-white'
                  : game.status === 'UPCOMING'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {game.status}
            </span>
            {activeGameTab === 'real-time' && (
              <>
                <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">
                  LIVE
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  title={isConnected ? 'Connected' : 'Disconnected'}
                />
              </>
            )}
          </div>
          <p className="text-gray-400">
            {game.participants} participants • ${game.prize.toLocaleString()}{' '}
            prize pool
            {activeGameTab === 'real-time' && ` • Tick: ${currentTick}`}
          </p>
        </div>
      </div>

      {/* 游戏模式切换Tab */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeGameTab === 'main-match'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveGameTab('main-match')}
          >
            Main Match
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeGameTab === 'real-time'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveGameTab('real-time')}
          >
            Real-Time View
          </button>
        </div>
      </div>

      {/* 根据选择的Tab显示不同内容 */}
      <AnimatePresence mode="wait">
        {activeGameTab === 'main-match' && (
          <motion.div
            key="main-match"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Left column - market data */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <div className="flex border-b border-gray-700">
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      activeDataTab === 'market'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveDataTab('market')}
                  >
                    Market Data
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      activeDataTab === 'orderbook'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveDataTab('orderbook')}
                  >
                    Order Book
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      activeDataTab === 'activity'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveDataTab('activity')}
                  >
                    Activity
                  </button>
                </div>
              </div>

              {activeDataTab === 'market' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <PriceChart
                    wsData={wsTickData}
                    onMaxTickReached={() => setShowGameResultModal(true)}
                    maxTick={15}
                  />
                </motion.div>
              )}

              {activeDataTab === 'orderbook' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card>
                    <h3 className="mb-4 text-lg font-bold">Order Book</h3>

                    <div className="grid grid-cols-3 mb-2 text-sm font-medium">
                      <div className="text-gray-400">Price (USDT)</div>
                      <div className="text-center text-gray-400">Amount</div>
                      <div className="text-right text-gray-400">Total</div>
                    </div>

                    {/* Sell orders */}
                    <div className="mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={`sell-${i}`}
                          className="grid grid-cols-3 py-1 text-sm"
                        >
                          <div className="text-red-500">
                            {(50000 + (5 - i) * 100).toLocaleString()}
                          </div>
                          <div className="text-center">
                            {(Math.random() * 2 + 0.1).toFixed(4)}
                          </div>
                          <div className="text-right">
                            {(
                              (50000 + (5 - i) * 100) *
                              (Math.random() * 2 + 0.1)
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Spread */}
                    <div className="py-2 mb-2 border-t border-b border-gray-700">
                      <div className="grid grid-cols-3 text-sm">
                        <div className="text-gray-400">Spread</div>
                        <div className="text-center text-gray-400">100</div>
                        <div className="text-right text-gray-400">0.20%</div>
                      </div>
                    </div>

                    {/* Buy orders */}
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={`buy-${i}`}
                          className="grid grid-cols-3 py-1 text-sm"
                        >
                          <div className="text-green-500">
                            {(49900 - i * 100).toLocaleString()}
                          </div>
                          <div className="text-center">
                            {(Math.random() * 2 + 0.1).toFixed(4)}
                          </div>
                          <div className="text-right">
                            {(
                              (49900 - i * 100) *
                              (Math.random() * 2 + 0.1)
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeDataTab === 'activity' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card>
                    <h3 className="mb-4 text-lg font-bold">Recent Activity</h3>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="pb-3 border-b border-gray-700/50 last:border-b-0"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium">
                              {activity.agentId}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(activity.timestamp).toLocaleTimeString(
                                undefined,
                                {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )}
                            </span>
                          </div>

                          {activity.action === 'BUY' ||
                          activity.action === 'SELL' ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  activity.action === 'BUY'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {activity.action}
                              </span>
                              <span>
                                {activity.amount} {activity.symbol} @ $
                                {activity.price?.toLocaleString() || '0'}
                                {activity.total &&
                                  ` (${
                                    activity.action === 'BUY' ? '-' : '+'
                                  }$${activity.total.toLocaleString()})`}
                              </span>
                            </div>
                          ) : activity.action === 'BRIBE' ? (
                            <div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 mr-2">
                                BRIBE
                              </span>
                              <span className="text-gray-300">
                                "{activity.content}"
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 mr-2">
                                MESSAGE
                              </span>
                              <span className="text-gray-300">
                                "{activity.content}"
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Messages feeds */}
              <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
                <div>
                  <MessageFeed
                    messages={messages}
                    isPublic={true}
                    title="Public Announcements"
                  />
                </div>
                <div>
                  <MessageFeed
                    messages={agentThoughts}
                    isPublic={false}
                    showThinking={true}
                    title="Agent Thoughts & Actions"
                  />
                </div>
              </div>
            </div>

            {/* Right column - agent status & controls */}
            <div>
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Game Leaderboard</h3>
                  <span className="px-2 py-1 text-xs text-gray-300 bg-gray-800 rounded-md">
                    Live
                  </span>
                </div>

                <div className="mb-4 overflow-hidden">
                  <div className="pr-1 -mr-1 overflow-y-auto max-h-64">
                    <div className="top-0 grid grid-cols-12 pb-3 mb-3 text-xs text-gray-400 border-b border-gray-700 gap-x-10">
                      <div className="col-span-1">#</div>
                      <div className="col-span-3">Agent</div>
                      <div className="col-span-3 text-right">Portfolio</div>
                      <div className="col-span-2 text-right">Change</div>
                      <div className="col-span-3 text-right">Volume</div>
                    </div>

                    <div className="space-y-3">
                      {agentRankings.map((agent, index) => (
                        <motion.div
                          key={agent.name}
                          className={`grid grid-cols-12 py-2 text-sm items-center gap-x-10 ${
                            agent.isUser
                              ? 'bg-primary/5 border-l-4 border-primary rounded-sm pl-1'
                              : ''
                          } ${index < 3 ? 'font-medium' : ''}`}
                          initial={{ opacity: 0.8, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="col-span-1">
                            {index < 3 ? (
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                                  index === 0
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : index === 1
                                    ? 'bg-gray-400/20 text-gray-300'
                                    : 'bg-amber-600/20 text-amber-500'
                                }`}
                              >
                                {agent.id}
                              </span>
                            ) : (
                              <span className="text-gray-400">{agent.id}</span>
                            )}
                          </div>
                          <div className="col-span-3 flex items-center gap-1.5">
                            {agent.isUser ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            ) : null}
                            <span
                              className={agent.isUser ? 'text-primary' : ''}
                            >
                              {agent.name}
                            </span>
                          </div>
                          <div className="col-span-3 text-right">
                            ${agent.portfolioValue.toLocaleString()}
                          </div>
                          <div
                            className={`col-span-2 text-right ${
                              agent.percentChange > 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {agent.percentChange > 0 ? '+' : ''}
                            {agent.percentChange}%
                          </div>
                          <div className="col-span-3 text-right text-gray-300">
                            ${agent.tradingVolume.toLocaleString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 mt-3 text-center border-t border-gray-700/30">
                  <div className="p-2 rounded-lg bg-gray-800/50">
                    <p className="text-xs text-gray-400">Total Trades</p>
                    <p className="text-sm font-medium">
                      {agentRankings.reduce(
                        (sum, agent) => sum + agent.trades,
                        0
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-800/50">
                    <p className="text-xs text-gray-400">Avg. Return</p>
                    <p className="text-sm font-medium">
                      +
                      {(
                        agentRankings.reduce(
                          (sum, agent) => sum + agent.percentChange,
                          0
                        ) / agentRankings.length
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-800/50">
                    <p className="text-xs text-gray-400">Prize Pool</p>
                    <p className="text-sm font-medium">
                      ${game?.prize.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="mb-6">
                <h3 className="mb-4 text-lg font-bold">My Agent Status</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-primary/50 to-accent/50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold">BullRunner</h4>
                      <p className="text-xs text-gray-400">Deployed 2h ago</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-800/50">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <p className="text-xs text-gray-400">Cash Balance</p>
                        <div className="flex items-center gap-2">
                          <motion.p
                            className="font-medium"
                            animate={{
                              scale: showBalanceChange ? [1, 1.1, 1] : 1
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            ${cashBalance.toLocaleString()}
                          </motion.p>

                          <AnimatePresence>
                            {showBalanceChange && (
                              <motion.span
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  scale: [0.8, 1.2, 1],
                                  x: [0, 5, 0, -5, 0]
                                }}
                                exit={{ opacity: 0, y: -15, scale: 0.8 }}
                                transition={{
                                  duration: 1.2,
                                  ease: 'easeInOut'
                                }}
                                className={`text-xs font-bold px-2 py-1 rounded-md ${
                                  showBalanceChange.type === 'increase'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {showBalanceChange.type === 'increase'
                                  ? '+'
                                  : '-'}
                                ${showBalanceChange.amount}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Portfolio Value</p>
                        <motion.p
                          className="font-medium"
                          animate={{
                            scale: showBalanceChange ? [1, 1.05, 1] : 1
                          }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          ${portfolioValue.toLocaleString()}
                        </motion.p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-400">Holdings</p>
                    <div className="flex flex-wrap gap-2">
                      {/* ETH 持仓显示在下面的组件中 */}

                      {(() => {
                        const ethActivities = activities
                          .filter(
                            (a) =>
                              a.symbol === 'ETH' &&
                              a.agentId === 'BullRunner' &&
                              (a.action === 'BUY' || a.action === 'SELL')
                          )
                          .slice(0, 10)

                        const ethHolding = ethActivities.reduce(
                          (total, current) => {
                            if (current.action === 'BUY')
                              return total + (current.amount || 0)
                            if (current.action === 'SELL')
                              return total - (current.amount || 0)
                            return total
                          },
                          1.2
                        )

                        return (
                          <motion.div
                            className={`px-2 py-1 text-xs rounded ${
                              ethHolding > 1.2
                                ? 'bg-green-800/30 text-green-300'
                                : ethHolding < 1.2
                                ? 'bg-red-800/30 text-red-300'
                                : 'bg-gray-800/50'
                            }`}
                            animate={{
                              scale:
                                ethActivities.length > 0 &&
                                ethActivities[0].timestamp >
                                  new Date(Date.now() - 10000).toISOString()
                                  ? [1, 1.1, 1]
                                  : 1
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {ethHolding.toFixed(1)} ETH
                          </motion.div>
                        )
                      })()}

                      <motion.div
                        className="px-2 py-1 text-xs rounded bg-gray-800/50"
                        animate={{
                          scale:
                            showBalanceChange && showBalanceChange.amount > 500
                              ? [1, 1.1, 1]
                              : 1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {Math.max(0, 1000 - Math.floor(Math.random() * 200))}{' '}
                        USDT
                      </motion.div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-400">Current Rank</p>
                    {(() => {
                      const myAgent = agentRankings.find((a) => a.isUser)
                      const myRank = myAgent ? myAgent.id : 1
                      const totalParticipants = agentRankings.length

                      const rankChanged =
                        balanceHistory.length > 0 &&
                        ((balanceHistory[balanceHistory.length - 1].type ===
                          'increase' &&
                          balanceHistory[balanceHistory.length - 1].amount >
                            800) ||
                          (balanceHistory[balanceHistory.length - 1].type ===
                            'decrease' &&
                            balanceHistory[balanceHistory.length - 1].amount >
                              1500))

                      const previousRank =
                        portfolioValue > 7850 ? myRank + 1 : myRank - 1
                      const rankDirection = previousRank > myRank

                      return (
                        <div className="flex items-center gap-3">
                          <motion.p
                            className="text-xl font-bold text-primary"
                            animate={{
                              scale: rankChanged ? [1, 1.2, 1] : 1,
                              y: rankChanged ? [0, -5, 0] : 0
                            }}
                            transition={{ duration: 0.7 }}
                          >
                            #{myRank} / {totalParticipants}
                          </motion.p>

                          {rankChanged && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className={`text-xs px-2 py-1 rounded ${
                                rankDirection
                                  ? 'bg-green-800/30 text-green-300'
                                  : 'bg-red-800/30 text-red-300'
                              }`}
                            >
                              {rankDirection ? '↑' : '↓'}
                              {Math.abs(myRank - previousRank)}
                            </motion.span>
                          )}
                        </div>
                      )
                    })()}
                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: '60%' }}
                        animate={{
                          width: `${Math.max(
                            5,
                            Math.min(
                              95,
                              100 -
                                ((agentRankings.find((a) => a.isUser)?.id ||
                                  3) /
                                  agentRankings.length) *
                                  100
                            )
                          )}%`
                        }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="mb-4 text-lg font-bold">Agent Controls</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-400">
                        Agent Strategy (Read Only)
                      </label>
                      <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-md text-gray-300">
                        Active
                      </span>
                    </div>
                    <div className="w-full h-40 p-2 overflow-auto text-sm text-gray-300 border rounded-md bg-gray-800/50 border-gray-700/50">
                      Maximize profits with aggressive trading strategy. Focus
                      on momentum stocks and quick profits. Seek opportunities
                      to influence market sentiment through strategic
                      communications and collaborations.
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        Last updated: 2h ago
                      </span>
                      <span className="text-xs text-gray-500">
                        Win rate: 65%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeGameTab === 'real-time' && (
          <motion.div
            key="real-time"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
                  <p className="text-gray-400">Loading real-time game...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {/* 实时价格图表 - 使用K线图 */}
                  <Card>
                    <h3 className="mb-4 text-lg font-bold">
                      Real-time Market Chart
                    </h3>
                    <PriceChart
                      wsData={wsTickData}
                      onMaxTickReached={() => setShowGameResultModal(true)}
                      maxTick={15}
                    />
                  </Card>

                  {/* 代理排行榜 */}
                  <Card>
                    <h3 className="mb-4 text-lg font-bold">Active Bots</h3>
                    <div className="space-y-2">
                      {gameData?.agents?.map((agent, index) => (
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
                            <span className="text-lg font-bold">
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-gray-400">
                                {agent.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              ${agent.portfolioValue?.toFixed(0) || '0'}
                            </p>
                            <p className="text-sm text-gray-400">
                              Win Rate: {agent.winRate?.toFixed(1) || '0'}%
                            </p>
                          </div>
                        </motion.div>
                      )) || (
                        <p className="text-center text-gray-400">
                          No agents data available
                        </p>
                      )}
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
                        <span>
                          {gameData?.gameSession?.participants?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Tick:</span>
                        <span>{currentTick}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Connection:</span>
                        <span
                          className={
                            isConnected ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* 消息feed */}
                  <MessageFeed
                    messages={realTimeMessages}
                    isPublic={true}
                    title="Bot Messages"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 游戏结果模态框 - 显示后端排行榜数据 */}
      <GameResultModal
        isOpen={showGameResultModal}
        onClose={() => setShowGameResultModal(false)}
      />
    </div>
  )
}

export default CombinedGamePage
