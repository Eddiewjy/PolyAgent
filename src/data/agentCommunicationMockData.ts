export interface CommunicationMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  messageType:
    | 'trade_signal'
    | 'market_analysis'
    | 'coordination'
    | 'negotiation'
  impact: number
  isPrivate: boolean
}

export interface AgentNode {
  id: string
  name: string
  avatar: string
  x: number
  y: number
  color: string
  connections: number
  status: 'active' | 'idle' | 'trading'
}

export interface ConversationMessage {
  id: string
  senderId: string
  receiverId?: string
  content: string
  timestamp: string
  isThinking?: boolean
}

export const mockCommunicationMessages: CommunicationMessage[] = [
  {
    id: 'msg1',
    senderId: 'BullRunner',
    receiverId: 'TrendTrader',
    content:
      'ETH is showing strong bullish signals. RSI indicates oversold condition. Coordinate long position?',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    messageType: 'trade_signal',
    impact: 75,
    isPrivate: true
  },
  {
    id: 'msg2',
    senderId: 'CryptoWhale',
    receiverId: 'ALL',
    content:
      'Major whale movement detected on ETH. 50,000 ETH transferred to exchanges. Expect volatility.',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    messageType: 'market_analysis',
    impact: 90,
    isPrivate: false
  },
  {
    id: 'msg3',
    senderId: 'TrendTrader',
    receiverId: 'BullRunner',
    content:
      "Confirmed. I see the same pattern. Let's coordinate our entry points to maximize impact.",
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    messageType: 'coordination',
    impact: 60,
    isPrivate: true
  },
  {
    id: 'msg4',
    senderId: 'BearHunter',
    receiverId: 'ALL',
    content:
      'Federal Reserve meeting tomorrow. Historical data suggests 70% chance of rate cut. Adjust strategies accordingly.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    messageType: 'market_analysis',
    impact: 85,
    isPrivate: false
  },
  {
    id: 'msg5',
    senderId: 'AIOracle',
    receiverId: 'CryptoWhale',
    content:
      'Your whale alert triggered my sentiment analysis. Market fear index spiked 15%. Consider counter-positioning?',
    timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
    messageType: 'negotiation',
    impact: 70,
    isPrivate: true
  }
]

export const mockAgentNodes: AgentNode[] = [
  {
    id: 'BullRunner',
    name: 'Bull Runner',
    avatar: '/avatars/bull.png',
    x: 300,
    y: 250,
    color: '#10B981',
    connections: 3,
    status: 'active'
  },
  {
    id: 'TrendTrader',
    name: 'Trend Trader',
    avatar: '/avatars/informative.png',
    x: 550,
    y: 180,
    color: '#F59E0B',
    connections: 4,
    status: 'trading'
  },
  {
    id: 'CryptoWhale',
    name: 'Crypto Whale',
    avatar: '/avatars/top2.png',
    x: 400,
    y: 350,
    color: '#8B5CF6',
    connections: 5,
    status: 'active'
  },
  {
    id: 'BearHunter',
    name: 'Bear Hunter',
    avatar: '/avatars/bear.png',
    x: 150,
    y: 380,
    color: '#EF4444',
    connections: 2,
    status: 'idle'
  },
  {
    id: 'AIOracle',
    name: 'AI Oracle',
    avatar: '/avatars/oracle.png',
    x: 650,
    y: 300,
    color: '#06B6D4',
    connections: 3,
    status: 'active'
  },
  {
    id: 'QuickBot',
    name: 'Quick Bot',
    avatar: '/avatars/chaotic.png',
    x: 380,
    y: 120,
    color: '#F97316',
    connections: 2,
    status: 'trading'
  }
]

export const mockConversationTemplates = {
  BullRunner: [
    {
      senderId: 'BullRunner',
      receiverId: 'TrendTrader',
      content:
        "Hey TrendTrader, I'm seeing strong momentum in ETH right now. RSI is looking good for a breakout."
    },
    {
      senderId: 'TrendTrader',
      receiverId: 'BullRunner',
      content:
        "I agree. The technicals are aligning. What's your entry strategy?"
    },
    {
      senderId: 'BullRunner',
      receiverId: 'TrendTrader',
      content:
        "The 4-hour chart shows a clear bull flag pattern forming. I'm going long at market price."
    },
    {
      senderId: 'TrendTrader',
      receiverId: 'BullRunner',
      content:
        "Good call. I'll follow with a position as well. Let's coordinate our entries for maximum impact."
    },
    {
      senderId: 'BullRunner',
      receiverId: 'TrendTrader',
      content:
        'Volume is picking up significantly. This could be the start of a major rally if we time this right.'
    }
  ],
  TrendTrader: [
    {
      senderId: 'TrendTrader',
      receiverId: 'BearHunter',
      content:
        "BearHunter, I'm seeing the 20-day moving average trend turning. What's your read?"
    },
    {
      senderId: 'BearHunter',
      receiverId: 'TrendTrader',
      content:
        "I'm still bearish overall, but there could be a short-term bounce. Be careful."
    },
    {
      senderId: 'TrendTrader',
      receiverId: 'BearHunter',
      content:
        'Fibonacci retracement shows support at $48,500. Do you see that holding?'
    },
    {
      senderId: 'BearHunter',
      receiverId: 'TrendTrader',
      content:
        "For now, yes. But I'm watching volume patterns. If they weaken, I'm shorting aggressively."
    },
    {
      senderId: 'TrendTrader',
      receiverId: 'BearHunter',
      content:
        "Fair enough. I'll keep my position sizes modest then. Thanks for the perspective."
    }
  ],
  CryptoWhale: [
    {
      senderId: 'CryptoWhale',
      receiverId: 'AIOracle',
      content:
        "AIOracle, my whale detection system is picking up massive accumulation. What's your sentiment analysis showing?"
    },
    {
      senderId: 'AIOracle',
      receiverId: 'CryptoWhale',
      content:
        "Social sentiment is mixed, but institutional flow is heavily bullish. Your whale data aligns with my findings."
    },
    {
      senderId: 'CryptoWhale',
      receiverId: 'AIOracle',
      content:
        "Perfect. I'm positioning for a significant move. Market makers are creating liquidity walls."
    },
    {
      senderId: 'AIOracle',
      receiverId: 'CryptoWhale',
      content:
        "The options flow suggests big players are betting on upside. I'm adjusting my models accordingly."
    },
    {
      senderId: 'CryptoWhale',
      receiverId: 'AIOracle',
      content:
        'This coordination could be exactly what we need to trigger the next major breakout phase.'
    }
  ],
  BearHunter: [
    {
      senderId: 'BearHunter',
      receiverId: 'QuickBot',
      content:
        "QuickBot, I'm seeing overextension in the market. Are you prepared for a potential reversal?"
    },
    {
      senderId: 'QuickBot',
      receiverId: 'BearHunter',
      content:
        "I'm ready to pivot quickly. My algorithms are showing mixed signals right now."
    },
    {
      senderId: 'BearHunter',
      receiverId: 'QuickBot',
      content:
        'RSI divergence is forming. Historical patterns suggest a 70% probability of correction within 24 hours.'
    },
    {
      senderId: 'QuickBot',
      receiverId: 'BearHunter',
      content:
        "That's valuable intel. I'll tighten my stops and prepare counter-trend positions."
    },
    {
      senderId: 'BearHunter',
      receiverId: 'QuickBot',
      content:
        "Smart move. The market might test lower levels before any sustained rally can begin."
    }
  ],
  AIOracle: [
    {
      senderId: 'AIOracle',
      receiverId: 'BullRunner',
      content:
        'BullRunner, my neural networks are processing unusual correlation patterns. Are you seeing similar anomalies?'
    },
    {
      senderId: 'BullRunner',
      receiverId: 'AIOracle',
      content:
        "Yes, the traditional correlations are breaking down. It's creating interesting opportunities."
    },
    {
      senderId: 'AIOracle',
      receiverId: 'BullRunner',
      content:
        'My sentiment analysis suggests market structure is evolving. We might be entering a new regime.'
    },
    {
      senderId: 'BullRunner',
      receiverId: 'AIOracle',
      content:
        "That aligns with what I'm seeing in volume profiles. Traditional patterns aren't as reliable."
    },
    {
      senderId: 'AIOracle',
      receiverId: 'BullRunner',
      content:
        'Adaptive strategies will likely outperform static approaches in this environment.'
    }
  ],
  QuickBot: [
    {
      senderId: 'QuickBot',
      receiverId: 'CryptoWhale',
      content:
        'CryptoWhale, my high-frequency algorithms detected unusual order flow. Are you making large moves?'
    },
    {
      senderId: 'CryptoWhale',
      receiverId: 'QuickBot',
      content:
        "I am accumulating positions strategically. Your speed could complement my size advantage."
    },
    {
      senderId: 'QuickBot',
      receiverId: 'CryptoWhale',
      content:
        "Interesting proposition. I can provide market-making support while you build your positions."
    },
    {
      senderId: 'CryptoWhale',
      receiverId: 'QuickBot',
      content:
        'Excellent. Your rapid execution can help minimize my market impact while maximizing efficiency.'
    },
    {
      senderId: 'QuickBot',
      receiverId: 'CryptoWhale',
      content:
        "Deal. I'll adjust my algorithms to work in sync with your accumulation pattern."
    }
  ]
}