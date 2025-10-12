import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAppContext } from '../contexts/AppContext'
import type { Agent } from '../types'
import { Link } from 'react-router-dom'
const AgentsPage = () => {
  const { user } = useAppContext()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  // Mock battle records
  const generateBattleRecords = (_agentId: string) => [
    {
      id: 1,
      game: 'Crypto Frenzy #128',
      result: 'Win',
      profit: '+$1,250',
      date: '2024-08-17',
      rank: '3/20'
    },
    {
      id: 2,
      game: 'Flash Crash Survivors',
      result: 'Loss',
      profit: '-$320',
      date: '2024-08-15',
      rank: '15/25'
    },
    {
      id: 3,
      game: 'Weekly Tournament #44',
      result: 'Win',
      profit: '+$890',
      date: '2024-08-12',
      rank: '2/30'
    },
    {
      id: 4,
      game: 'Bear Market Challenge',
      result: 'Win',
      profit: '+$540',
      date: '2024-08-10',
      rank: '7/18'
    },
    {
      id: 5,
      game: 'Volatility Masters',
      result: 'Loss',
      profit: '-$150',
      date: '2024-08-08',
      rank: '12/22'
    }
  ]

  // Generate mock wallet addresses for agents
  const generateWalletAddress = (agentId: string) => {
    const prefix = '0x'
    const hash = agentId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const address = hash.toString(16).padStart(40, '0').slice(0, 40)
    return prefix + address
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Agents</h1>
        <Link to="/agents/create">
          <Button
            text="Create Agent"
            variant="primary"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
          />
        </Link>
      </div>

      {user?.agents && user.agents.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {user.agents.map((agent) => (
            <motion.div key={agent.id} variants={itemVariants}>
              <Card className="p-6 transition-colors hover:border-primary/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/50 to-accent/50">
                    <span className="font-bold text-white">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{agent.name}</h3>
                    <p className="text-sm text-gray-400">
                      {agent.type.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="font-semibold text-green-400">
                      {(agent.winRate * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Balance</span>
                    <span className="font-semibold">
                      ${agent.balance.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="block mb-1 text-sm text-gray-400">
                      Wallet Address
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 font-mono text-xs bg-gray-800 rounded">
                        {generateWalletAddress(agent.id).slice(0, 6)}...
                        {generateWalletAddress(agent.id).slice(-4)}
                      </code>
                      <button
                        className="text-gray-400 transition-colors hover:text-white"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            generateWalletAddress(agent.id)
                          )
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-gray-700">
                  <Button
                    text="View Details"
                    variant="accent"
                    size="sm"
                    fullWidth
                    onClick={() => setSelectedAgent(agent)}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mb-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 className="mb-2 text-xl font-medium">No Agents Found</h3>
          <p className="mb-6 text-center text-gray-400">
            Create your first AI agent to start trading
          </p>
          <Button text="Create Your First Agent" variant="primary" />
        </Card>
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/50 to-accent/50">
                    <span className="text-xl font-bold text-white">
                      {selectedAgent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                    <p className="text-gray-400">
                      {selectedAgent.type.toLowerCase()} • Level{' '}
                      {selectedAgent.level}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-500 hover:text-white"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left Column - Agent Prompt */}
                <div>
                  <h3 className="mb-4 text-xl font-bold">Agent Strategy</h3>
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                    <p className="leading-relaxed text-gray-300 whitespace-pre-line">
                      {selectedAgent.prompt}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="mb-3 text-lg font-semibold">
                      Performance Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gray-800/30">
                        <p className="text-sm text-gray-400">Win Rate</p>
                        <p className="text-lg font-bold text-green-400">
                          {(selectedAgent.winRate * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-800/30">
                        <p className="text-sm text-gray-400">Balance</p>
                        <p className="text-lg font-bold">
                          ${selectedAgent.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Battle Records */}
                <div>
                  <h3 className="mb-4 text-xl font-bold">Battle Records</h3>
                  <div className="space-y-3 overflow-y-auto max-h-96">
                    {generateBattleRecords(selectedAgent.id).map((record) => (
                      <div
                        key={record.id}
                        className="p-4 border rounded-lg bg-gray-800/30 border-gray-700/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{record.game}</h4>
                          <span
                            className={`text-sm px-2 py-1 rounded-full ${
                              record.result === 'Win'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {record.result}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Rank: {record.rank}</span>
                          <span>{record.date}</span>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`font-semibold ${
                              record.profit.startsWith('+')
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {record.profit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  text="Close"
                  variant="secondary"
                  onClick={() => setSelectedAgent(null)}
                />
                <Button
                  text="Deploy to Game"
                  variant="primary"
                  onClick={() => {
                    // TODO: Navigate to games page or open game selection
                    setSelectedAgent(null)
                  }}
                />
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AgentsPage
