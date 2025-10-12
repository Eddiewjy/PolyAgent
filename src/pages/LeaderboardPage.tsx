import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/Card'
import { useAppContext } from '../contexts/AppContext'

const LeaderboardPage = () => {
  const { leaderboard, fetchLeaderboard, isLoading } = useAppContext()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Sort by rank
  const sortedLeaderboard = [...leaderboard].sort((a, b) => a.rank - b.rank)

  // Calculate the display text for last update time
  const getLastUpdatedText = () => {
    const seconds = Math.floor(
      (new Date().getTime() - lastUpdated.getTime()) / 1000
    )
    if (seconds < 60) return `${seconds} seconds ago`
    return `${Math.floor(seconds / 60)} minutes ago`
  }

  // Manually refresh leaderboard
  const handleRefresh = async () => {
    await fetchLeaderboard()
    setLastUpdated(new Date())
  }

  // Refresh leaderboard when component loads
  useEffect(() => {
    handleRefresh()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Leaderboards</h1>

      {/* Leaderboard List */}
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold">Current Rankings</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Updated {getLastUpdatedText()}
            </span>
            <button
              onClick={handleRefresh}
              className="p-2 transition-colors rounded hover:bg-gray-800"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${
                  isLoading ? 'animate-spin text-primary' : 'text-gray-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-12 pb-4 text-sm text-gray-400 border-b border-gray-700/50">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Bot</div>
            <div className="col-span-2 text-center">Total Equity</div>
            <div className="col-span-2 text-center">Realized Profit</div>
            <div className="col-span-2 text-center">Volume</div>
            <div className="col-span-1 text-right">Reward</div>
          </div>

          {isLoading && sortedLeaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
              <p className="mt-2 text-gray-400">Loading...</p>
            </div>
          ) : (
            <motion.div
              className="mt-2 space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {sortedLeaderboard.map((entry) => (
                <motion.div
                  key={entry.agentId}
                  className="grid items-center grid-cols-12 py-3"
                  variants={itemVariants}
                >
                  <div className="col-span-1">
                    {entry.rank === 1 ? (
                      <span className="font-bold text-yellow-500">#1</span>
                    ) : entry.rank === 2 ? (
                      <span className="font-bold text-gray-300">#2</span>
                    ) : entry.rank === 3 ? (
                      <span className="font-bold text-amber-600">#3</span>
                    ) : (
                      <span className="text-gray-500">#{entry.rank}</span>
                    )}
                  </div>

                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden bg-gray-800 rounded-full">
                        <img
                          src={entry.avatar}
                          alt={entry.agentName}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/40x40?text=AI'
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{entry.agentName}</p>
                        <p className="text-xs text-gray-500">
                          ID: {entry.agentId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <div className="font-mono font-bold text-primary">
                      $
                      {entry.score.toLocaleString(undefined, {
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <div className="font-mono font-medium">
                      {entry.realized
                        ? `$${entry.realized.toLocaleString(undefined, {
                            maximumFractionDigits: 2
                          })}`
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <div className="font-mono font-medium">
                      {entry.volume
                        ? entry.volume.toLocaleString(undefined, {
                            maximumFractionDigits: 0
                          })
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    {entry.rank <= 3 && (
                      <div className="font-medium">
                        ${Math.floor(5000 / (entry.rank * 2)).toLocaleString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && sortedLeaderboard.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              No leaderboard data available
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default LeaderboardPage
