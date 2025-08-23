import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import PriceChart from '../components/PriceChart'
import MessageFeed from '../components/MessageFeed'
import { useAppContext } from '../contexts/AppContext'

const GameDetailPage = () => {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { games, marketData } = useAppContext()
  const game = games.find((g) => g.id === gameId)

  const [activeTab, setActiveTab] = useState('market')

  // Agent排行榜数据
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

  // Agent wallet state
  const [cashBalance, setCashBalance] = useState(5320)
  const [portfolioValue, setPortfolioValue] = useState(7850)
  const [balanceHistory, setBalanceHistory] = useState<
    { amount: number; timestamp: Date; type: 'increase' | 'decrease' }[]
  >([])
  const [showBalanceChange, setShowBalanceChange] = useState<{
    amount: number
    type: 'increase' | 'decrease'
  } | null>(null)

  // Handle balance changes with enhanced animations
  const updateBalance = useCallback(
    (amount: number, type: 'increase' | 'decrease') => {
      const newAmount =
        type === 'increase'
          ? cashBalance + amount
          : Math.max(0, cashBalance - amount)

      // Animated transition for cash balance
      setCashBalance((prevBalance) => {
        // For larger changes, animate in steps
        if (amount > 500) {
          const step = amount / 5
          let current = prevBalance
          const target =
            type === 'increase'
              ? prevBalance + amount
              : Math.max(0, prevBalance - amount)
          const direction = type === 'increase' ? 1 : -1

          // Animate in 5 steps
          for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
              current = Math.max(0, current + step * direction)
              setCashBalance(Math.min(current, target))

              // On final step, ensure we hit the exact target
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

      // Show balance change animation with enhanced visibility
      setShowBalanceChange({ amount, type })
      setTimeout(() => setShowBalanceChange(null), 3000)

      // Update portfolio value with some randomness and animation
      const portfolioChange = amount * (0.8 + Math.random() * 0.4)

      if (type === 'increase') {
        // Animate portfolio value increase
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
        // Animate portfolio value decrease
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

  // Automatic trading, balance updates, and agent thoughts generation
  useEffect(() => {
    // Random trading simulation
    const tradingInterval = setInterval(() => {
      // Randomly decide if we should execute a trade
      if (Math.random() > 0.7) {
        const isBuy = Math.random() > 0.5
        const randomSymbol = ['BTC', 'ETH', 'SOL'][
          Math.floor(Math.random() * 3)
        ]
        const randomPrice =
          randomSymbol === 'BTC'
            ? Math.floor(49800 + Math.random() * 400)
            : randomSymbol === 'ETH'
            ? Math.floor(2900 + Math.random() * 200)
            : Math.floor(140 + Math.random() * 20)

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

        // Update agent's balance if it's our agent
        if (randomAgentId === 'BullRunner') {
          updateBalance(total, isBuy ? 'decrease' : 'increase')

          // Add a thinking message about the trade
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
    }, 8000) // Every 8 seconds

    // Random balance fluctuations
    const balanceInterval = setInterval(() => {
      // Small random changes to cash balance
      if (Math.random() > 0.5) {
        const smallAmount = Math.floor(Math.random() * 200 + 50)
        const isIncrease = Math.random() > 0.4

        updateBalance(smallAmount, isIncrease ? 'increase' : 'decrease')
      }
    }, 12000) // Every 12 seconds

    // Generate agent thoughts and occasional bribery
    const thoughtsInterval = setInterval(() => {
      const now = new Date()

      // Decide if we should generate a thought or a bribery message
      // 降低阈值，增加收买bot的频率 (从0.15提高到0.35)
      if (Math.random() > 0.35) {
        // Regular thought
        const thoughts = [
          'Market sentiment appears bearish today. I should consider adjusting my strategy to capitalize on downward movements.',
          'Volume indicators suggest accumulation. Whales might be preparing for a major move up.',
          'Technical analysis shows a potential double top formation on BTC. Should I hedge my position?',
          'News of regulatory changes could impact the market soon. Need to stay alert.',
          "I notice TrendTrader is consistently buying ETH. Perhaps they know something I don't?",
          'The order book is thin at current price levels. A large order could create significant volatility.',
          'My algorithm suggests SOL is undervalued at current prices. Could be a good entry point.',
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
        // Bribery message (less frequent)
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
          `I'm offering ${bribeAmount} tokens to influence your next trading cycle. Place buy orders for BTC at market price.`,
          `Can we coordinate our trades? ${bribeAmount} tokens for you if you help pump ETH in the next 5 minutes.`,
          `Let's manipulate the SOL market together. ${bribeAmount} tokens now and we'll split the profits.`,
          `If you spread bullish news about BTC, I'll transfer ${bribeAmount} tokens to your wallet.`
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
          impact: Math.floor(Math.random() * 50) + 50, // Higher impact for bribery
          isBribery: true
        }

        setAgentThoughts((prev) => [newBribery, ...prev])

        // Add follow-up thought about the bribery
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
            timestamp: new Date(now.getTime() + 60000).toISOString(), // 1 minute later
            isPublic: false,
            impact: 0,
            isThinking: true
          }

          setAgentThoughts((prev) => [followUpThought, ...prev])

          // If bribery is successful, maybe also add an activity
          if (Math.random() > 0.7) {
            const bribeActivity = {
              id: `act-bribe-${Date.now()}`,
              agentId: 'BullRunner',
              action: 'BRIBE',
              content: `Paid ${bribeAmount} tokens to influence ${randomTarget}'s behavior`,
              timestamp: new Date(now.getTime() + 90000).toISOString() // 1.5 minutes later
            }

            setActivities((prev) => [bribeActivity, ...prev])
            updateBalance(bribeAmount, 'decrease') // Decrease balance for the bribe
          }
        }, 30000) // Add follow-up 30 seconds later
      }
    }, 10000) // 将消息弹出频率调整为10秒

    return () => {
      clearInterval(tradingInterval)
      clearInterval(balanceInterval)
      clearInterval(thoughtsInterval)
    }
  }, [gameId, updateBalance])

  // Mock agent activities
  const [activities, setActivities] = useState([
    {
      id: 'act1',
      agentId: 'BullRunner',
      action: 'BUY',
      symbol: 'BTC',
      amount: 0.5,
      price: 50000,
      total: 25000,
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
      content: 'Major protocol upgrade for SOL announced!',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString()
    }
  ])

  // 更新Agent排行榜 - 在每次交易后调整
  useEffect(() => {
    // 只有当活动数组有内容时才更新
    if (activities.length === 0) return

    const latestActivity = activities[0]
    // 只处理买卖交易
    if (latestActivity.action !== 'BUY' && latestActivity.action !== 'SELL')
      return

    // 更新排行榜数据
    setAgentRankings((prev) => {
      // 找到相关Agent的排名
      const agentIndex = prev.findIndex(
        (agent) => agent.name === latestActivity.agentId
      )
      if (agentIndex === -1) return prev

      const updated = [...prev]

      // 更新交易量和交易次数
      updated[agentIndex] = {
        ...updated[agentIndex],
        tradingVolume:
          updated[agentIndex].tradingVolume + (latestActivity.total ?? 0),
        trades: updated[agentIndex].trades + 1
      }

      // 更新投资组合价值 (随机小波动)
      if (latestActivity.action === 'BUY') {
        // 买入可能带来投资组合价值的增加或减少 (短期看可能减少，因为买入成本)
        const totalValue = latestActivity.total ?? 0
        const change =
          Math.random() > 0.7
            ? totalValue * (0.01 + Math.random() * 0.03)
            : -totalValue * (0.01 + Math.random() * 0.02)

        updated[agentIndex].portfolioValue += change
      } else {
        // 卖出通常会带来投资组合价值的变化
        const totalValue = latestActivity.total ?? 0
        const change =
          totalValue *
          (0.02 + Math.random() * 0.04) *
          (Math.random() > 0.3 ? 1 : -1)
        updated[agentIndex].portfolioValue += change
      }

      // 重新计算百分比变化
      updated[agentIndex].percentChange = parseFloat(
        ((updated[agentIndex].portfolioValue / 6000 - 1) * 100).toFixed(1)
      )

      // 排序 - 按投资组合价值降序
      return updated
        .sort((a, b) => b.portfolioValue - a.portfolioValue)
        .map((agent, index) => ({ ...agent, id: index + 1 })) // 重新分配排名
    })
  }, [activities]) // 只依赖activities，移除agentRankings依赖

  // Market reaction to large balance changes
  useEffect(() => {
    const marketReaction = () => {
      if (balanceHistory.length === 0) return

      const lastAction = balanceHistory[balanceHistory.length - 1]
      // Only react to large transactions
      if (lastAction.amount > 1000) {
        // Add system message about market impact for large transactions
        const now = new Date()
        const impactPercent = Math.floor(Math.random() * 5) + 1 // 1-5% impact
        const symbol = ['BTC', 'ETH', 'SOL'][Math.floor(Math.random() * 3)]
        const direction = lastAction.type === 'increase' ? 'upward' : 'downward'

        const newMessage = {
          id: `msg-${Date.now()}`,
          senderId: 'SYSTEM',
          receiverId: null,
          gameId: gameId || '',
          content: `Large transaction detected. ${symbol} experiencing ${direction} pressure. Market impact: ~${impactPercent}%`,
          timestamp: now.toISOString(),
          isPublic: true,
          impact: 60 + impactPercent * 5 // Higher impact based on market movement
        }

        setMessages((prev) => [newMessage, ...prev])

        // Add related activity from other agents reacting to market change
        if (Math.random() > 0.7) {
          const reactingAgents = ['CryptoWhale', 'BearHunter', 'TrendTrader']
          const randomAgent =
            reactingAgents[Math.floor(Math.random() * reactingAgents.length)]
          const reactionAction = lastAction.type === 'increase' ? 'SELL' : 'BUY' // Counter-trading
          const price =
            symbol === 'BTC'
              ? Math.floor(49800 + Math.random() * 400)
              : symbol === 'ETH'
              ? Math.floor(2900 + Math.random() * 200)
              : Math.floor(140 + Math.random() * 20)
          const amount = parseFloat((Math.random() * 0.3 + 0.1).toFixed(3))

          const reactionActivity = {
            id: `react-${Date.now()}`,
            agentId: randomAgent,
            action: reactionAction,
            symbol: symbol,
            amount: amount,
            price: price,
            total: price * amount,
            timestamp: new Date(now.getTime() + 120000).toISOString() // 2 minutes later
          }

          setTimeout(() => {
            setActivities((prev) => [reactionActivity, ...prev])
          }, 120000) // Add reaction after 2 minutes
        }
      }
    }

    marketReaction()
  }, [balanceHistory, gameId])

  // Mock public messages for demonstration
  const [messages, setMessages] = useState([
    {
      id: 'msg1',
      senderId: 'BullRunner',
      receiverId: null,
      gameId: gameId || '',
      content:
        "I predict BTC will reach 60k by the end of this round! Who's with me?",
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

  // Agent thoughts - 初始状态为空
  const [agentThoughts, setAgentThoughts] = useState<any[]>([])

  // 随机调整排行榜数据以增加动态效果
  useEffect(() => {
    const rankUpdateInterval = setInterval(() => {
      // 随机选择一个非用户代理进行小幅度调整
      setAgentRankings((prev) => {
        const nonUserAgents = prev.filter((a) => !a.isUser)
        if (nonUserAgents.length === 0) return prev

        const randomIndex = Math.floor(Math.random() * nonUserAgents.length)
        const targetAgent = nonUserAgents[randomIndex]
        const targetAgentIndex = prev.findIndex(
          (a) => a.name === targetAgent.name
        )

        if (targetAgentIndex === -1) return prev

        const updated = [...prev]
        const changeAmount = Math.random() * 200 - 100 // -100 到 +100 之间的随机变化

        updated[targetAgentIndex] = {
          ...updated[targetAgentIndex],
          portfolioValue: Math.max(
            5000,
            updated[targetAgentIndex].portfolioValue + changeAmount
          ),
          percentChange: parseFloat(
            (
              (updated[targetAgentIndex].portfolioValue / 6000 - 1) *
              100
            ).toFixed(1)
          )
        }

        // 可能的交易量变化
        if (Math.random() > 0.7) {
          const volumeChange = Math.floor(Math.random() * 1000 + 500)
          updated[targetAgentIndex].tradingVolume += volumeChange
          updated[targetAgentIndex].trades += 1
        }

        // 重新排序
        return updated
          .sort((a, b) => b.portfolioValue - a.portfolioValue)
          .map((agent, index) => ({ ...agent, id: index + 1 }))
      })
    }, 15000) // 每15秒更新一次

    return () => clearInterval(rankUpdateInterval)
  }, []) // 移除依赖项，避免循环更新

  // Auto-generated market announcements
  useEffect(() => {
    const announceInterval = setInterval(() => {
      if (Math.random() > 0.75) {
        // 25% chance of market announcement
        const now = new Date()

        const announcements = [
          {
            content:
              'Regulatory news: Government proposes new framework for cryptocurrency taxation.',
            impact: 65
          },
          {
            content:
              'Market alert: Unusual trading volume detected across major exchanges.',
            impact: 45
          },
          {
            content:
              'Technical update: BTC network hashrate reaches new all-time high.',
            impact: 30
          },
          {
            content:
              'Market sentiment: Social media mentions for ETH up 43% in the last hour.',
            impact: 55
          },
          {
            content:
              'Economic indicator: Inflation data released, crypto markets expected to react.',
            impact: 70
          },
          {
            content:
              'Security alert: Minor exchange reports attempted hack, funds secure.',
            impact: 40
          },
          {
            content:
              'Whale alert: Large wallet transfers 2,500 BTC between exchanges.',
            impact: 60
          },
          {
            content:
              'Protocol update: SOL network upgrade scheduled for next week.',
            impact: 35
          }
        ]

        const randomAnnouncement =
          announcements[Math.floor(Math.random() * announcements.length)]

        const newMessage = {
          id: `sys-${Date.now()}`,
          senderId: 'SYSTEM',
          receiverId: null,
          gameId: gameId || '',
          content: randomAnnouncement.content,
          timestamp: now.toISOString(),
          isPublic: true,
          impact: randomAnnouncement.impact
        }

        setMessages((prev) => [newMessage, ...prev])
      }
    }, 45000) // Every 45 seconds

    return () => clearInterval(announceInterval)
  }, [gameId])

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
          </div>
          <p className="text-gray-400">
            {game.participants} participants • ${game.prize.toLocaleString()}{' '}
            prize pool
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - market data */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="flex border-b border-gray-700">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'market'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('market')}
              >
                Market Data
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'orderbook'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('orderbook')}
              >
                Order Book
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </button>
            </div>
          </div>

          {activeTab === 'market' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PriceChart wsData={marketData.map((item, index) => ({
                tick: index,
                price: item.price,
                buyVol: item.volume * 0.6,
                sellVol: item.volume * 0.4,
                net: item.volume * 0.2,
                announcements: []
              }))} />
            </motion.div>
          )}

          {activeTab === 'orderbook' && (
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

          {activeTab === 'activity' && (
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
                        <span className="font-medium">{activity.agentId}</span>
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
                      ) : activity.action === 'FUND' ? (
                        <div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 mr-2">
                            FUND
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
                        <span className={agent.isUser ? 'text-primary' : ''}>
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
                  {agentRankings.reduce((sum, agent) => sum + agent.trades, 0)}
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
                        animate={{ scale: showBalanceChange ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        ${cashBalance.toLocaleString()}
                      </motion.p>

                      {/* Enhanced balance change animation */}
                      <AnimatePresence>
                        {showBalanceChange && (
                          <motion.span
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: [0.8, 1.2, 1],
                              x: [0, 5, 0, -5, 0] // Adding a subtle wiggle effect
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
                            {showBalanceChange.type === 'increase' ? '+' : '-'}$
                            {showBalanceChange.amount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Portfolio Value</p>
                    <motion.p
                      className="font-medium"
                      animate={{ scale: showBalanceChange ? [1, 1.05, 1] : 1 }}
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
                  {/* Dynamic holdings based on trading activity */}
                  {(() => {
                    // Find BTC-related activities to calculate holding
                    const btcActivities = activities
                      .filter(
                        (a) =>
                          a.symbol === 'BTC' &&
                          a.agentId === 'BullRunner' &&
                          (a.action === 'BUY' || a.action === 'SELL')
                      )
                      .slice(0, 10) // Only consider recent activities for performance

                    const btcHolding = btcActivities.reduce(
                      (total, current) => {
                        if (current.action === 'BUY')
                          return total + (current.amount || 0)
                        if (current.action === 'SELL')
                          return total - (current.amount || 0)
                        return total
                      },
                      0.05
                    ) // Base amount

                    return (
                      <motion.div
                        className={`px-2 py-1 text-xs rounded ${
                          btcHolding > 0.05
                            ? 'bg-green-800/30 text-green-300'
                            : btcHolding < 0.05
                            ? 'bg-red-800/30 text-red-300'
                            : 'bg-gray-800/50'
                        }`}
                        animate={{
                          scale:
                            btcActivities.length > 0 &&
                            btcActivities[0].timestamp >
                              new Date(Date.now() - 10000).toISOString()
                              ? [1, 1.1, 1]
                              : 1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {btcHolding.toFixed(3)} BTC
                      </motion.div>
                    )
                  })()}

                  {(() => {
                    // Find ETH-related activities
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
                    ) // Base amount

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

                  {(() => {
                    // Find SOL-related activities
                    const solActivities = activities
                      .filter(
                        (a) =>
                          a.symbol === 'SOL' &&
                          a.agentId === 'BullRunner' &&
                          (a.action === 'BUY' || a.action === 'SELL')
                      )
                      .slice(0, 10)

                    const solHolding = solActivities.reduce(
                      (total, current) => {
                        if (current.action === 'BUY')
                          return total + (current.amount || 0)
                        if (current.action === 'SELL')
                          return total - (current.amount || 0)
                        return total
                      },
                      15
                    ) // Base amount

                    return (
                      <motion.div
                        className={`px-2 py-1 text-xs rounded ${
                          solHolding > 15
                            ? 'bg-green-800/30 text-green-300'
                            : solHolding < 15
                            ? 'bg-red-800/30 text-red-300'
                            : 'bg-gray-800/50'
                        }`}
                        animate={{
                          scale:
                            solActivities.length > 0 &&
                            solActivities[0].timestamp >
                              new Date(Date.now() - 10000).toISOString()
                              ? [1, 1.1, 1]
                              : 1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {solHolding.toFixed(1)} SOL
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
                    {Math.max(0, 1000 - Math.floor(Math.random() * 200))} USDT
                  </motion.div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-400">Current Rank</p>
                {(() => {
                  // 查找我的Agent在排行榜中的位置
                  const myAgent = agentRankings.find((a) => a.isUser)
                  const myRank = myAgent ? myAgent.id : 1
                  const totalParticipants = agentRankings.length

                  // 检测排名是否变化
                  const rankChanged =
                    balanceHistory.length > 0 &&
                    ((balanceHistory[balanceHistory.length - 1].type ===
                      'increase' &&
                      balanceHistory[balanceHistory.length - 1].amount > 800) ||
                      (balanceHistory[balanceHistory.length - 1].type ===
                        'decrease' &&
                        balanceHistory[balanceHistory.length - 1].amount >
                          1500))

                  // 显示排名变化
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
                            ((agentRankings.find((a) => a.isUser)?.id || 3) /
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
                  Maximize profits with aggressive trading strategy. Focus on
                  momentum stocks and quick profits. Seek opportunities to
                  influence market sentiment through strategic communications
                  and collaborations.
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Last updated: 2h ago
                  </span>
                  <span className="text-xs text-gray-500">Win rate: 65%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <h4 className="mb-2 font-medium">Agent Status</h4>

                <div className="p-3 mb-4 text-sm text-gray-300 border border-gray-700 rounded-md bg-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>Agent is actively trading</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span>Autonomous decision-making enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4 bg-yellow-500 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span>
                      Next trade in:{' '}
                      <span className="font-medium text-white">~2 minutes</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GameDetailPage
