import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAppContext } from '../contexts/AppContext'
import {
  mockCommunicationMessages,
  mockAgentNodes,
  mockConversationTemplates
} from '../data/agentCommunicationMockData'
import type {
  CommunicationMessage,
  AgentNode,
  ConversationMessage
} from '../data/agentCommunicationMockData'

const AgentCommunicationPage = () => {
  const { games } = useAppContext()
  const [selectedGame, setSelectedGame] = useState(games[0]?.id || '')
  const [activeView, setActiveView] = useState<
    'network' | 'timeline' | 'analysis'
  >('network')
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h')

  // Agent conversation modal states
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null)
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([])
  const [isThinking, setIsThinking] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  // Use imported mock data
  const [messages] = useState<CommunicationMessage[]>(mockCommunicationMessages)
  const [agentNodes] = useState<AgentNode[]>(mockAgentNodes)

  // Handle agent node click
  const handleAgentClick = (agent: AgentNode) => {
    setSelectedAgent(agent)
    setConversationMessages([])
    startConversation(agent)
  }

  // Start a mock real-time conversation between agents
  const startConversation = (agent: AgentNode) => {
    const templates =
      mockConversationTemplates[agent.id as keyof typeof mockConversationTemplates] ||
      []
    let messageIndex = 0

    const addMessage = () => {
      if (messageIndex < templates.length) {
        setIsThinking(true)

        // Simulate thinking time
        setTimeout(() => {
          setIsThinking(false)
          const template = templates[messageIndex]

          setConversationMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              senderId: template.senderId,
              receiverId: template.receiverId,
              content: template.content,
              timestamp: new Date().toISOString()
            }
          ])
          messageIndex++

          // Schedule next message
          setTimeout(addMessage, Math.random() * 3000 + 2000) // 2-5 seconds delay
        }, Math.random() * 2000 + 1000) // 1-3 seconds thinking
      }
    }

    // Start the conversation
    addMessage()
  }

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages, isThinking])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'trade_signal':
        return 'bg-green-500/20 text-green-400'
      case 'market_analysis':
        return 'bg-blue-500/20 text-blue-400'
      case 'coordination':
        return 'bg-purple-500/20 text-purple-400'
      case 'negotiation':
        return 'bg-orange-500/20 text-orange-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981'
      case 'trading':
        return '#F59E0B'
      case 'idle':
        return '#6B7280'
      default:
        return '#6B7280'
    }
  }

  const renderNetworkView = () => (
    <Card className="h-[500px] relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Agent Communication Network</h3>
        <div className="text-sm text-gray-400">
          Real-time • {agentNodes.filter((n) => n.status === 'active').length}{' '}
          active agents
        </div>
      </div>

      <svg width="100%" height="450" className="absolute inset-x-0 top-12">
        {/* Connection lines */}
        {messages
          .filter((m) => m.isPrivate)
          .map((msg, index) => {
            const sender = agentNodes.find((n) => n.id === msg.senderId)
            const receiver = agentNodes.find((n) => n.id === msg.receiverId)
            if (!sender || !receiver || msg.receiverId === 'ALL') return null

            return (
              <motion.line
                key={`connection-${index}`}
                x1={sender.x}
                y1={sender.y}
                x2={receiver.x}
                y2={receiver.y}
                stroke="rgba(79, 70, 229, 0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            )
          })}

        {/* Agent nodes */}
        {agentNodes.map((agent, index) => (
          <g key={agent.id} onClick={() => handleAgentClick(agent)}>
            {/* Avatar circle with image */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="cursor-pointer"
            >
              {/* Background circle */}
              <circle
                cx={agent.x}
                cy={agent.y}
                r="22"
                fill={getStatusColor(agent.status)}
                stroke={agent.color}
                strokeWidth="3"
                className="hover:stroke-white transition-colors"
              />

              {/* Avatar image */}
              <foreignObject
                x={agent.x - 18}
                y={agent.y - 18}
                width="36"
                height="36"
                className="pointer-events-none"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://via.placeholder.com/36x36?text=AI'
                    }}
                  />
                </div>
              </foreignObject>
            </motion.g>

            {/* Pulse animation ring */}
            <motion.circle
              cx={agent.x}
              cy={agent.y}
              r="28"
              fill="none"
              stroke={agent.color}
              strokeWidth="1"
              opacity="0.3"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              className="pointer-events-none"
            />

            {/* Agent name */}
            <text
              x={agent.x}
              y={agent.y + 35}
              textAnchor="middle"
              className="text-xs fill-gray-300 font-medium pointer-events-none"
            >
              {agent.name}
            </text>

            {/* Connection count */}
            <text
              x={agent.x}
              y={agent.y + 48}
              textAnchor="middle"
              className="text-xs fill-gray-500 pointer-events-none"
            >
              {agent.connections} connections
            </text>
          </g>
        ))}
      </svg>
    </Card>
  )

  const renderTimelineView = () => (
    <Card className="h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Communication Timeline</h3>
        <div className="flex gap-2">
          {(['1h', '6h', '24h'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-xs ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-l-2 border-gray-700 pl-4 relative"
          >
            <div className="absolute -left-2 top-2 w-3 h-3 bg-primary rounded-full"></div>

            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary">
                  {message.senderId}
                </span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-secondary">
                  {message.receiverId === 'ALL'
                    ? 'Broadcast'
                    : message.receiverId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${getMessageTypeColor(
                    message.messageType
                  )}`}
                >
                  {message.messageType.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-2">{message.content}</p>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Impact:</div>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${message.impact}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {message.impact}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {message.isPrivate ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                )}
                <span className="text-xs text-gray-500">
                  {message.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )

  const renderAnalysisView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg font-bold mb-4">Communication Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Messages</span>
            <span className="font-bold text-2xl">{messages.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Private Messages</span>
            <span className="font-bold text-2xl text-yellow-500">
              {messages.filter((m) => m.isPrivate).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Broadcast Messages</span>
            <span className="font-bold text-2xl text-green-500">
              {messages.filter((m) => !m.isPrivate).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Avg Impact Score</span>
            <span className="font-bold text-2xl text-primary">
              {Math.round(
                messages.reduce((sum, m) => sum + m.impact, 0) / messages.length
              )}
              %
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold mb-4">Message Types</h3>
        <div className="space-y-3">
          {[
            'trade_signal',
            'market_analysis',
            'coordination',
            'negotiation'
          ].map((type) => {
            const count = messages.filter((m) => m.messageType === type).length
            const percentage = (count / messages.length) * 100
            return (
              <div key={type}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-400">{count}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      type === 'trade_signal'
                        ? 'bg-green-500'
                        : type === 'market_analysis'
                        ? 'bg-blue-500'
                        : type === 'coordination'
                        ? 'bg-purple-500'
                        : 'bg-orange-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="md:col-span-2">
        <h3 className="text-lg font-bold mb-4">Most Active Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agentNodes
            .sort((a, b) => b.connections - a.connections)
            .slice(0, 3)
            .map((agent, index) => (
              <div key={agent.id} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  {/* Avatar image */}
                  <div
                    className="w-full h-full rounded-full overflow-hidden border-2"
                    style={{ borderColor: agent.color }}
                  >
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/64x64?text=AI'
                      }}
                    />
                  </div>
                  {/* Rank badge */}
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: agent.color }}
                  >
                    #{index + 1}
                  </div>
                </div>
                <h4 className="font-medium">{agent.name}</h4>
                <p className="text-sm text-gray-400">
                  {agent.connections} connections
                </p>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                    agent.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : agent.status === 'trading'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {agent.status}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agent Communication</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
          <Button
            text="Export Data"
            variant="outline"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {[
          { key: 'network', label: 'Network View', icon: '🕸️' },
          { key: 'timeline', label: 'Timeline', icon: '📈' },
          { key: 'analysis', label: 'Analysis', icon: '📊' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
              activeView === key
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveView(key as any)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* View Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === 'network' && renderNetworkView()}
        {activeView === 'timeline' && renderTimelineView()}
        {activeView === 'analysis' && renderAnalysisView()}
      </motion.div>

      {/* Agent Conversation Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              className="w-full max-w-2xl h-96"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: selectedAgent.color }}
                    >
                      {selectedAgent.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedAgent.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedAgent.status === 'active'
                              ? 'bg-green-500'
                              : selectedAgent.status === 'trading'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                          }`}
                        />
                        <span className="text-sm text-gray-400 capitalize">
                          {selectedAgent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-gray-500 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {conversationMessages.map((message, index) => {
                    // Find the agent info for the sender
                    const senderAgent = agentNodes.find(
                      (a) => a.id === message.senderId
                    )
                    const isSender = selectedAgent.id === message.senderId

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: isSender ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-3 ${
                          isSender ? '' : 'justify-end'
                        }`}
                      >
                        {isSender && (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{
                              backgroundColor: senderAgent?.color || '#6B7280'
                            }}
                          >
                            {message.senderId.charAt(0)}
                          </div>
                        )}
                        <div
                          className={`flex-1 ${isSender ? '' : 'text-right'}`}
                        >
                          <div
                            className={`${
                              isSender ? 'bg-gray-800/50' : 'bg-primary/30'
                            } rounded-lg p-3 ${isSender ? '' : 'ml-auto'} ${
                              isSender ? 'mr-12' : 'ml-12'
                            }`}
                          >
                            <p className="text-gray-300">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {!isSender && (
                              <>
                                <span>From: {message.senderId}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{formatTime(message.timestamp)}</span>
                            {isSender && (
                              <>
                                <span>•</span>
                                <span>To: {message.receiverId}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {!isSender && (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{
                              backgroundColor:
                                agentNodes.find(
                                  (a) => a.id === message.senderId
                                )?.color || '#6B7280'
                            }}
                          >
                            {message.senderId.charAt(0)}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}

                  {/* Thinking indicator */}
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: selectedAgent.color }}
                      >
                        {selectedAgent.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              ></div>
                            </div>
                            <span className="text-gray-400 text-sm">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={conversationEndRef} />
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>
                      Real-time AI conversation • Click outside to close
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AgentCommunicationPage
