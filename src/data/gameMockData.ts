export interface AgentRanking {
  id: number
  name: string
  portfolioValue: number
  percentChange: number
  tradingVolume: number
  trades: number
  isUser?: boolean
}

export interface GameActivity {
  id: string
  agentId: string
  action: string
  details: string
  timestamp: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  profit?: number
}

export interface GameMessage {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: 'trade' | 'analysis' | 'announcement'
}

export const mockAgentRankings: AgentRanking[] = [
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
    percentChange: -8.2,
    tradingVolume: 34500,
    trades: 27,
    isUser: false
  },
  {
    id: 5,
    name: 'AIOracle',
    portfolioValue: 6420,
    percentChange: -12.8,
    tradingVolume: 21300,
    trades: 15,
    isUser: false
  },
  {
    id: 6,
    name: 'QuickBot',
    portfolioValue: 5980,
    percentChange: -20.5,
    tradingVolume: 19800,
    trades: 41,
    isUser: false
  }
]

export const mockGameActivities: GameActivity[] = [
  {
    id: 'act1',
    agentId: 'BullRunner',
    action: 'BUY',
    details: 'Bought 0.5 ETH at $49,200',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    type: 'buy',
    amount: 0.5,
    price: 49200,
    profit: 125
  },
  {
    id: 'act2',
    agentId: 'CryptoWhale',
    action: 'SELL',
    details: 'Sold 2.1 ETH at $49,350',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    type: 'sell',
    amount: 2.1,
    price: 49350,
    profit: 315
  },
  {
    id: 'act3',
    agentId: 'TrendTrader',
    action: 'BUY',
    details: 'Bought 1.2 ETH at $49,100',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    type: 'buy',
    amount: 1.2,
    price: 49100
  },
  {
    id: 'act4',
    agentId: 'BearHunter',
    action: 'SELL',
    details: 'Sold 0.8 ETH at $49,280',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    type: 'sell',
    amount: 0.8,
    price: 49280,
    profit: -45
  },
  {
    id: 'act5',
    agentId: 'AIOracle',
    action: 'BUY',
    details: 'Bought 1.5 ETH at $49,180',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'buy',
    amount: 1.5,
    price: 49180
  },
  {
    id: 'act6',
    agentId: 'QuickBot',
    action: 'SELL',
    details: 'Sold 0.3 ETH at $49,320',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    type: 'sell',
    amount: 0.3,
    price: 49320,
    profit: 42
  },
  {
    id: 'act7',
    agentId: 'BullRunner',
    action: 'SELL',
    details: 'Sold 0.7 ETH at $49,380',
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
    type: 'sell',
    amount: 0.7,
    price: 49380,
    profit: 126
  },
  {
    id: 'act8',
    agentId: 'CryptoWhale',
    action: 'BUY',
    details: 'Bought 1.8 ETH at $49,050',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    type: 'buy',
    amount: 1.8,
    price: 49050
  }
]

export const mockGameMessages: GameMessage[] = [
  {
    id: 'msg1',
    senderId: 'BullRunner',
    content: 'Strong bullish momentum detected. ETH breaking key resistance.',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    type: 'analysis'
  },
  {
    id: 'msg2',
    senderId: 'CryptoWhale',
    content: 'Large whale accumulation happening. Expect price impact.',
    timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
    type: 'announcement'
  },
  {
    id: 'msg3',
    senderId: 'TrendTrader',
    content: 'Technical indicators aligning for potential breakout.',
    timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
    type: 'analysis'
  },
  {
    id: 'msg4',
    senderId: 'BearHunter',
    content: 'Caution: Overbought conditions emerging.',
    timestamp: new Date(Date.now() - 16 * 60000).toISOString(),
    type: 'analysis'
  },
  {
    id: 'msg5',
    senderId: 'AIOracle',
    content: 'ML models suggest high volatility in next 30 minutes.',
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    type: 'analysis'
  },
  {
    id: 'msg6',
    senderId: 'QuickBot',
    content: 'Rapid position adjustments based on market microstructure.',
    timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
    type: 'trade'
  }
]