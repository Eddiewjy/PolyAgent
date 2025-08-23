import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Agent, Game, MarketData, LeaderboardEntry } from '../types'

// Mock data for demo purposes
import {
  mockUser,
  mockGames,
  mockMarketData,
  mockLeaderboard
} from '../utils/mockData'
import { gameAPI } from '../utils/api'

// 定义后端排行榜接口数据类型
// interface LeaderboardApiEntry {
//   id: string
//   equity: number
//   realized: number
//   volume: number
// }

interface AppContextType {
  user: User | null
  games: Game[]
  activeGame: Game | null
  marketData: MarketData[]
  leaderboard: LeaderboardEntry[]
  setActiveGame: (game: Game | null) => void
  createAgent: (agent: Omit<Agent, 'id'>) => void
  updateAgentPrompt: (agentId: string, prompt: string) => void
  joinGame: (gameId: string) => void
  claimReward: (rewardId: string) => void
  isLoading: boolean
  // 新增：Bot系统相关
  createBotGame: (
    name: string,
    maxParticipants?: number,
    duration?: number
  ) => Promise<string>
  startBotGame: (gameId: string) => Promise<void>
  addAgentToGame: (gameId: string, agentConfig: any) => Promise<void>
  fetchLeaderboard: (limit?: number) => Promise<void> // 新增：获取排行榜数据
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockUser)
  const [games] = useState<Game[]>(mockGames)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [marketData, setMarketData] = useState<MarketData[]>(mockMarketData)
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(mockLeaderboard)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Create a new agent
  const createAgent = (agent: Omit<Agent, 'id'>) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (user) {
        const newAgent: Agent = {
          ...agent,
          id: `agent-${Date.now()}`
        }

        setUser({
          ...user,
          agents: [...user.agents, newAgent]
        })
      }
      setIsLoading(false)
    }, 1500)
  }

  // Update agent prompt
  const updateAgentPrompt = (agentId: string, prompt: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedAgents = user.agents.map((agent) =>
          agent.id === agentId ? { ...agent, prompt } : agent
        )

        setUser({
          ...user,
          agents: updatedAgents
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  // Join a game
  const joinGame = (gameId: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const game = games.find((g) => g.id === gameId)
      if (game) {
        setActiveGame(game)
      }
      setIsLoading(false)
    }, 1500)
  }

  // Claim a reward
  const claimReward = (rewardId: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedRewards = user.rewards.map((reward) =>
          reward.id === rewardId ? { ...reward, claimed: true } : reward
        )

        setUser({
          ...user,
          rewards: updatedRewards
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  // 新增：创建Bot游戏
  const createBotGame = async (
    name: string,
    maxParticipants = 8,
    duration = 30
  ): Promise<string> => {
    setIsLoading(true)
    try {
      const response = await gameAPI.createGame(name, maxParticipants, duration)
      return response.data.id
    } catch (error) {
      console.error('Failed to create bot game:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 新增：开始Bot游戏
  const startBotGame = async (gameId: string): Promise<void> => {
    setIsLoading(true)
    try {
      await gameAPI.startGame(gameId)
    } catch (error) {
      console.error('Failed to start bot game:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 新增：添加代理到游戏
  const addAgentToGame = async (
    gameId: string,
    agentConfig: any
  ): Promise<void> => {
    setIsLoading(true)
    try {
      await gameAPI.addAgent(gameId, agentConfig)
    } catch (error) {
      console.error('Failed to add agent to game:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 获取排行榜数据
  const fetchLeaderboard = async (limit = 10) => {
    setIsLoading(true)
    try {
      const response = await gameAPI.getLeaderboard(limit)
      const apiData = response.data

      // 将后端数据转换为前端需要的格式
      if (Array.isArray(apiData)) {
        const transformedData: LeaderboardEntry[] = apiData.map(
          (item, index) => ({
            rank: index + 1,
            agentId: item.id,
            agentName: item.id.replace('-', ' ').toUpperCase(),
            avatar: getAvatarByAgentId(item.id),
            score: item.equity,
            category: 'PROFIT', // 所有排行榜数据都属于利润类别
            realized: item.realized, // 添加已实现收益
            volume: item.volume // 添加成交量
          })
        )

        setLeaderboard(transformedData)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 根据agent ID获取头像
  const getAvatarByAgentId = (id: string): string => {
    if (id.includes('cons')) return '/avatars/conservative.png'
    if (id.includes('aggr') || id.includes('bull')) return '/avatars/bull.png'
    if (id.includes('chaos')) return '/avatars/chaotic.png'
    if (id.includes('info')) return '/avatars/informative.png'
    if (id.includes('betray')) return '/avatars/betrayer.png'
    return '/avatars/top1.png' // 默认头像
  }

  // Mock market data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prevData) =>
        prevData.map((data) => ({
          ...data,
          price: data.price * (1 + (Math.random() * 0.02 - 0.01)),
          change: Math.random() * 4 - 2,
          timestamp: new Date().toISOString()
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // 初始加载时获取排行榜数据
  useEffect(() => {
    fetchLeaderboard()

    // 每30秒刷新一次排行榜
    const interval = setInterval(() => {
      fetchLeaderboard()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        games,
        activeGame,
        marketData,
        leaderboard,
        setActiveGame,
        createAgent,
        updateAgentPrompt,
        joinGame,
        claimReward,
        isLoading,
        createBotGame,
        startBotGame,
        addAgentToGame,
        fetchLeaderboard
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }

  return context
}
