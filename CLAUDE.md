# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs Vite dev server with HMR)
- **Build for production**: `npm run build` (TypeScript compilation + Vite build)  
- **Lint code**: `npm run lint` (ESLint with TypeScript support)
- **Preview production build**: `npm run preview`

## Architecture Overview

This is a React trading game application called "PolyAgent" where AI agents compete in simulated trading matches. The application integrates with a backend service called "perp-bot-mvp" that provides real-time trading data via WebSocket.

### Core Architecture Components

**Frontend Structure**:
- **React 19** with TypeScript and Vite for build tooling
- **TailwindCSS** for styling with custom components
- **Framer Motion** for animations and transitions
- **React Router** for client-side routing
- **Context API** (`AppContext`) for global state management

**Key Pages & Features**:
- `CombinedGamePage`: Main game interface with dual-mode support (main-match vs real-time)
- `LeaderboardPage`: Rankings and prize distribution
- `AgentsPage`/`CreateAgentPage`: Agent management and creation
- `GamesPage`: Game lobby and selection

### Backend Integration

**API Layer** (`src/utils/api.ts`):
- Base URL: `http://localhost:3000` for HTTP API
- WebSocket: `ws://localhost:3000/ws` for real-time data
- Integrates with "perp-bot-mvp" backend service
- Handles game state, agent management, and leaderboard data

**WebSocket Data Format**:
```typescript
interface PerpTickData {
  tick: number;
  price: number;
  buyVol: number;
  sellVol: number;
  net: number;
  announcements: Array<{
    agentId: string;
    text: string;
    stance?: string;
  }>;
}
```

### State Management

**Global Context** (`AppContext`):
- User authentication and profile
- Game state and active game management  
- Agent management (create, update prompts)
- Leaderboard data fetching
- Mock data integration for development

**Local State Patterns**:
- Games use multiple `useState` hooks for WebSocket data, UI state, and real-time updates
- Heavy use of `useEffect` for WebSocket lifecycle management
- Real-time price charts with historical data buffering

### Component Architecture

**Shared Components** (`src/components/`):
- `Card`: Base container component with consistent styling
- `Button`: Styled button with variant support
- `PriceChart`/`RealTimePriceChart`: Trading chart components using Recharts
- `MessageFeed`: Real-time message display with analysis states
- `GameResultModal`: End-game leaderboard modal with backend data integration

**Key Patterns**:
- Components use TypeScript interfaces for prop typing
- Framer Motion for consistent animations
- TailwindCSS utility classes with custom color schemes
- Mock data fallbacks during development

### Data Flow

1. **Game Initialization**: 
   - Load game data via HTTP API
   - Establish WebSocket connection to perp-bot-mvp
   - Initialize price history and agent states

2. **Real-time Updates**:
   - WebSocket receives `PerpTickData` with price/volume updates
   - Updates local state for charts and UI
   - Processes announcements for agent activities

3. **Game Completion**:
   - WebSocket disconnects after max tick count (15 ticks)
   - Fetches final leaderboard from backend API
   - Displays results modal with ranking data

### Development Notes

**Mock Data**: The app includes comprehensive mock data (`src/utils/mockData.ts`) for development when the backend is unavailable.

**WebSocket Handling**: Games implement automatic reconnection logic but stop reconnecting after reaching maximum tick count.

**Type Safety**: Extensive use of TypeScript interfaces in `src/types/index.ts` for agents, games, market data, and API responses.

**Styling**: Custom Tailwind configuration with primary/secondary color schemes, consistent with a dark gaming theme.