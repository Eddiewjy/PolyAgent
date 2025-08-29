export type TradingAction = 'BUY' | 'SELL' | 'BRIBE' | 'FUND' | 'MESSAGE';

export interface TradingActivity {
  id: string;
  agentId: string;
  action: TradingAction;
  symbol?: string;
  amount?: number;
  price?: number;
  total?: number;
  content?: string;
  timestamp: string;
}

export interface MarketAnnouncement {
  content: string;
  impact: number;
}

export interface AgentThoughtCategories {
  analysis: string[];
  bribery: string[];
  collaboration: string[];
}

export const marketAnnouncements: MarketAnnouncement[] = [
  {
    content: 'Regulatory news: Government proposes new framework for cryptocurrency taxation.',
    impact: 65
  },
  {
    content: 'Market alert: Unusual trading volume detected across major exchanges.',
    impact: 45
  },
  {
    content: 'Technical update: ETH network hashrate reaches new all-time high.',
    impact: 30
  },
  {
    content: 'Market sentiment: Social media mentions for ETH up 43% in the last hour.',
    impact: 55
  },
  {
    content: 'Economic indicator: Inflation data released, crypto markets expected to react.',
    impact: 70
  },
  {
    content: 'Security alert: Minor exchange reports attempted hack, funds secure.',
    impact: 40
  },
  {
    content: 'Whale alert: Large wallet transfers 30,000 ETH between exchanges.',
    impact: 60
  },
  {
    content: 'Protocol update: ETH network upgrade scheduled for next week.',
    impact: 35
  }
];

export const agentThoughts: AgentThoughtCategories = {
  analysis: [
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
  ],
  bribery: [
    "I'm offering {amount} tokens to influence your next trading cycle. Place buy orders for ETH at market price.",
    "Can we coordinate our trades? {amount} tokens for you if you help pump ETH in the next 5 minutes.",
    "Let's manipulate the ETH market together. {amount} tokens now and we'll split the profits.",
    "If you spread bullish news about ETH, I'll transfer {amount} tokens to your wallet."
  ],
  collaboration: [
    "Bribe to {target} successful. They'll assist with our trading strategy as requested.",
    "{target} accepted our offer. We should see market movement soon.",
    "Collusion with {target} established. This should give us an edge over other traders.",
    "{target} will help us manipulate the market. Our profits should increase significantly."
  ]
};

export const initialAgentRankings = [
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
];

export const initialTradingActivities: TradingActivity[] = [
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
];

export const initialGameMessages = [
  {
    id: 'msg1',
    senderId: 'BullRunner',
    receiverId: null,
    gameId: '',
    content: "I predict ETH will reach 4k by the end of this round! Who's with me?",
    timestamp: new Date().toISOString(),
    isPublic: true,
    impact: 45
  },
  {
    id: 'msg2',
    senderId: 'BearHunter',
    receiverId: null,
    gameId: '',
    content: "Market indicators suggest a correction is imminent. I'm shorting ETH.",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    isPublic: true,
    impact: 30
  },
  {
    id: 'msg3',
    senderId: 'SYSTEM',
    receiverId: null,
    gameId: '',
    content: 'A major exchange has reported technical issues. Trading volumes may be affected.',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    isPublic: true,
    impact: 80
  }
];