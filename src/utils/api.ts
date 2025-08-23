import axios from 'axios'

// API 基础配置 - 连接到perp-bot-mvp后端
const API_BASE_URL = 'http://localhost:3000'
const WS_BASE_URL = 'ws://localhost:3000/ws'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 游戏 API - 适配perp-bot-mvp的接口
export const gameAPI = {
  // 获取所有游戏 (模拟数据，因为perp-bot-mvp只有一个match)
  getAllGames: () =>
    Promise.resolve({
      data: [
        {
          id: 'main-match',
          name: 'Main Trading Match',
          status: 'ACTIVE',
          participants: [],
          prize: 1000
        }
      ]
    }),

  // 获取特定游戏 - 使用perp-bot-mvp的snapshot接口
  getGame: (gameId: string) =>
    api.get('/match/snapshot').then((response) => ({
      data: {
        game: {
          gameSession: {
            id: gameId,
            name: 'Perp Bot Trading Match',
            status: 'ACTIVE',
            participants: response.data.bots || [],
            prize: 1000
          },
          tick: response.data.tick || 0,
          price: response.data.price || 100,
          agents: (response.data.bots || []).map((botId: string) => ({
            id: botId,
            name: botId.replace('-', ' ').toUpperCase(),
            type: getStrategyType(botId),
            portfolioValue: 1000 + (Math.random() - 0.5) * 200,
            winRate: 50 + (Math.random() - 0.5) * 30,
            ownerId: botId.includes('user-') ? 'user' : 'system'
          })),
          history: [],
          messages: []
        }
      }
    })),

  // 创建新游戏 (perp-bot-mvp不支持，返回模拟响应)
  createGame: (name: string, _maxParticipants?: number, _duration?: number) =>
    Promise.resolve({ data: { id: 'main-match', name } }),

  // 添加代理到游戏 - 使用perp-bot-mvp的agents接口
  addAgent: (
    _gameId: string,
    agent: {
      botId: string
      strategyKind: string
      strategyParams?: any
      maxPos?: number
      limits?: any
      ownerId?: string
    }
  ) => api.post('/match/agents', agent),

  // 开始游戏 - 使用perp-bot-mvp的resume接口
  startGame: (_gameId: string) => api.post('/match/resume'),

  // 暂停游戏 - 使用perp-bot-mvp的pause接口
  pauseGame: (_gameId: string) => api.post('/match/pause'),

  // 重置游戏 - 使用perp-bot-mvp的reset接口
  resetGame: (_gameId: string) => api.post('/match/reset'),

  // 获取游戏消息 (模拟数据)
  getMessages: (_gameId: string) => Promise.resolve({ data: [] }),

  // 获取市场历史数据 (模拟数据)
  getMarketHistory: (_gameId: string) => Promise.resolve({ data: [] })
}

// 辅助函数：根据botId推断策略类型
function getStrategyType(botId: string): string {
  if (botId.includes('cons')) return 'conservative'
  if (botId.includes('aggr')) return 'aggressive'
  if (botId.includes('chaos')) return 'chaotic'
  if (botId.includes('info')) return 'informative'
  return 'conservative'
}

// WebSocket 连接 - 直接连接到perp-bot-mvp的WebSocket
export const createGameWebSocket = (_gameId: string) => {
  return new WebSocket(WS_BASE_URL)
}

export default api
