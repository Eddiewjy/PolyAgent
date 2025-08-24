import { motion } from 'framer-motion'
import Card from '../components/Card'
import { useAppContext } from '../contexts/AppContext'

const AssetsPage = () => {
  const { user } = useAppContext()

  // If user doesn't exist, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    )
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Assets</h1>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Agent NFTs */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="mb-4 text-lg font-bold">Agent NFT</h3>

            {user.agents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {user.agents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    variants={itemVariants}
                    className="overflow-hidden transition-colors border rounded-lg border-gray-700/50 hover:border-primary"
                  >
                    <div className="flex items-center justify-center h-40 p-4 bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="flex items-center justify-center w-24 h-24 overflow-hidden rounded-full bg-gradient-to-br from-primary/50 to-accent/50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white h-14 w-14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{agent.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          LV {agent.level}
                        </span>
                      </div>

                      <p className="mb-3 text-xs text-gray-400">
                        NFT ID:{' '}
                        {agent.nftId || `nft-${agent.id.substring(0, 8)}`}
                      </p>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type</span>
                          <span>{agent.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate</span>
                          <span>{(agent.winRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Experience</span>
                          <span>{agent.xp} XP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Holdings Value</span>
                          <span>
                            $
                            {agent.holdings
                              .reduce((sum, h) => sum + h.amount * h.price, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                No Agent NFTs yet. Go to the creation page to make your first
                Agent
              </p>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AssetsPage
