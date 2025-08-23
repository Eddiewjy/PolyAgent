import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import GameCard from '../components/GameCard'
import { useAppContext } from '../contexts/AppContext'
import { GameStatus } from '../types'

const GamesPage = () => {
  const { games, user, joinGame, createBotGame, isLoading } = useAppContext()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('active')
  const [showCreateBotGame, setShowCreateBotGame] = useState(false)
  const [botGameForm, setBotGameForm] = useState({
    name: '',
    maxParticipants: 8,
    duration: 30
  })

  const activeGames = games.filter((game) => game.status === GameStatus.ACTIVE)
  const upcomingGames = games.filter(
    (game) => game.status === GameStatus.UPCOMING
  )
  const completedGames = games.filter(
    (game) => game.status === GameStatus.COMPLETED
  )

  // For the join game modal
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState(
    user?.agents[0]?.id || ''
  )

  const handleCreateBotGame = async () => {
    try {
      const gameId = await createBotGame(
        botGameForm.name || `Bot Game ${Date.now()}`,
        botGameForm.maxParticipants,
        botGameForm.duration
      )

      // 重定向到新创建的游戏页面
      navigate(`/games/${gameId}/realtime`)
      setShowCreateBotGame(false)
    } catch (error) {
      console.error('Failed to create bot game:', error)
    }
  }

  const handleAgentJoin = (gameId: string) => {
    setSelectedGameId(gameId)
    setIsJoinModalOpen(true)
  }

  const handleWatchGame = (gameId: string) => {
    navigate(`/games/${gameId}/realtime`)
  }

  const handleConfirmJoin = () => {
    if (selectedGameId && selectedAgentId) {
      joinGame(selectedGameId)
      setIsJoinModalOpen(false)
    }
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Game Lobby</h1>
        <div className="flex gap-2">
          <Button
            text="Create Bot Game"
            onClick={() => setShowCreateBotGame(true)}
            variant="primary"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-700">
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Games
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'upcoming'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Games
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'completed'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Games
        </button>
      </div>

      {/* Game lists */}
      {activeTab === 'active' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {activeGames.length > 0 ? (
            activeGames.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard game={game} onWatch={handleWatchGame} />
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center col-span-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <p className="mb-4 text-gray-400">
                No active games at the moment
              </p>
              <Button
                text="Check Upcoming Games"
                variant="primary"
                onClick={() => setActiveTab('upcoming')}
              />
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'upcoming' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {upcomingGames.length > 0 ? (
            upcomingGames.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard game={game} onJoin={handleAgentJoin} />
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center col-span-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400">No upcoming games scheduled</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'completed' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {completedGames.length > 0 ? (
            completedGames.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard game={game} onWatch={handleWatchGame} />
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center col-span-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-400">No game history found</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Join Game Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Join Game</h2>
                <button
                  onClick={() => setIsJoinModalOpen(false)}
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

              <p className="mb-4 text-gray-400">
                Select an agent to deploy in this game. Entry fee will be
                deducted from your balance.
              </p>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-300">
                  Select Agent
                </label>
                {user?.agents.length ? (
                  <div className="space-y-3">
                    {user.agents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`p-3 rounded-lg border cursor-pointer ${
                          selectedAgentId === agent.id
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedAgentId(agent.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden bg-gray-800 rounded-full">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://via.placeholder.com/40x40?text=AI'
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{agent.name}</h3>
                            <p className="text-xs text-gray-400">
                              Balance: ${agent.balance}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No agents available. Please create an agent first.
                  </p>
                )}
              </div>

              <div className="p-4 mb-6 rounded-lg bg-gray-800/50">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Entry Fee:</span>
                  <span className="font-medium">$100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Starting Capital:</span>
                  <span className="font-medium">$1,000</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  text="Cancel"
                  variant="outline"
                  onClick={() => setIsJoinModalOpen(false)}
                  fullWidth
                />
                <Button
                  text="Confirm & Join"
                  variant="primary"
                  onClick={handleConfirmJoin}
                  fullWidth
                />
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* 创建Bot游戏模态框 */}
      {showCreateBotGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4"
          >
            <Card>
              <h3 className="mb-4 text-xl font-bold">Create Bot Game</h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Game Name
                  </label>
                  <input
                    type="text"
                    value={botGameForm.name}
                    onChange={(e) =>
                      setBotGameForm((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    placeholder="Enter game name"
                    className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Max Participants
                  </label>
                  <select
                    value={botGameForm.maxParticipants}
                    onChange={(e) =>
                      setBotGameForm((prev) => ({
                        ...prev,
                        maxParticipants: parseInt(e.target.value)
                      }))
                    }
                    className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-primary"
                  >
                    <option value={4}>4 Players</option>
                    <option value={6}>6 Players</option>
                    <option value={8}>8 Players</option>
                    <option value={10}>10 Players</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Duration (minutes)
                  </label>
                  <select
                    value={botGameForm.duration}
                    onChange={(e) =>
                      setBotGameForm((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value)
                      }))
                    }
                    className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:border-primary"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  text="Cancel"
                  variant="outline"
                  onClick={() => setShowCreateBotGame(false)}
                  fullWidth
                  disabled={isLoading}
                />
                <Button
                  text={isLoading ? 'Creating...' : 'Create Game'}
                  variant="primary"
                  onClick={handleCreateBotGame}
                  fullWidth
                  disabled={isLoading}
                />
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default GamesPage
