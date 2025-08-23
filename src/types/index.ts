// Agent types and interfaces
export interface Agent {
  id: string;
  name: string;
  avatar: string;
  nftId?: string;
  balance: number;
  holdings: Holding[];
  winRate: number;
  prompt: string;
  level: number;
  xp: number;
  skills: Skill[];
  type: string;
}

export const AgentType = {
  CONSERVATIVE: 'CONSERVATIVE',
  AGGRESSIVE: 'AGGRESSIVE',
  CHAOTIC: 'CHAOTIC',
  INFORMATIVE: 'INFORMATIVE'
} as const;

export type AgentTypeValue = typeof AgentType[keyof typeof AgentType];

export interface Skill {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  cost: number;
  costType: 'XP' | 'TOKEN';
}

export interface Holding {
  symbol: string;
  amount: number;
  price: number;
}

// Game types and interfaces
export interface Game {
  id: string;
  name: string;
  status: GameStatusValue;
  participants: number;
  maxParticipants: number;
  prize: number;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
}

export const GameStatus = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
} as const;

export type GameStatusValue = typeof GameStatus[keyof typeof GameStatus];

export interface GameAction {
  id: string;
  agentId: string;
  gameId: string;
  actionType: string;
  data: any;
  timestamp: string;
}

export const ActionType = {
  BUY: 'BUY',
  SELL: 'SELL',
  MESSAGE: 'MESSAGE',
  CONTRACT: 'CONTRACT'
} as const;

export type ActionTypeValue = typeof ActionType[keyof typeof ActionType];

export interface Message {
  id: string;
  senderId: string;
  receiverId: string | null; // null for public messages
  gameId: string;
  content: string;
  timestamp: string;
  isPublic: boolean;
  impact: number; // measure of influence
  isBribery?: boolean; // for messages related to bribing/colluding with bots
  isThinking?: boolean; // indicates if this message is the agent's thought process
}

// Market types and interfaces
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: string;
}

export interface OrderBook {
  buys: Order[];
  sells: Order[];
}

export interface Order {
  id: string;
  agentId: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  amount: number;
  price: number;
  timestamp: string;
}

// User types and interfaces
export interface User {
  id: string;
  username: string;
  balance: number;
  agents: Agent[];
  rewards: Reward[];
  achievements: Achievement[];
}

export interface Reward {
  id: string;
  amount: number;
  type: RewardTypeValue;
  source: string;
  claimed: boolean;
  timestamp: string;
}

export const RewardType = {
  TOKEN: 'TOKEN',
  NFT: 'NFT',
  XP: 'XP'
} as const;

export type RewardTypeValue = typeof RewardType[keyof typeof RewardType];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// Leaderboard types and interfaces
export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  avatar: string;
  score: number;
  category: LeaderboardCategoryValue;
  realized?: number;  // 已实现收益
  volume?: number;    // 成交量
}

export const LeaderboardCategory = {
  PROFIT: 'PROFIT',
  INFLUENCE: 'INFLUENCE',
  BETRAYAL: 'BETRAYAL'
} as const;

export type LeaderboardCategoryValue = typeof LeaderboardCategory[keyof typeof LeaderboardCategory];
