import { useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAppContext } from '../contexts/AppContext'
import { RewardType } from '../types'

// Define asset page tabs
type AssetTabType = 'overview' | 'rewards' | 'nfts'

const AssetsPage = () => {
  const { user, claimReward, isLoading } = useAppContext()
  const [activeTab, setActiveTab] = useState<AssetTabType>('overview')

  // If user doesn't exist, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    )
  }

  // Calculate total asset value (tokens + NFT)
  const totalTokenBalance = user.balance

  // Calculate total asset value of all agents
  const agentsValue = user.agents.reduce((total, agent) => {
    // Agent's cash balance
    const agentCashBalance = agent.balance

    // Agent's holdings value
    const holdingsValue = agent.holdings.reduce((sum, holding) => {
      return sum + holding.amount * holding.price
    }, 0)

    return total + agentCashBalance + holdingsValue
  }, 0)

  // Unclaimed rewards
  const unclaimedRewards = user.rewards.filter((reward) => !reward.claimed)

  // Handle claiming a single reward
  const handleClaimReward = (rewardId: string) => {
    claimReward(rewardId)
  }

  // Claim all rewards at once
  const handleClaimAllRewards = () => {
    unclaimedRewards.forEach((reward) => {
      claimReward(reward.id)
    })
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
        {unclaimedRewards.length > 0 && (
          <Button
            text={`Claim All Rewards (${unclaimedRewards.length})`}
            variant="accent"
            onClick={handleClaimAllRewards}
            isLoading={isLoading}
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
                  d="M12 8v13m0-13V6a4 4 0 118 0v7M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v12a2 2 0 002 2h10a2 2 0 002-2V8"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* Navigation tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Assets Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'rewards'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Asset overview cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div variants={itemVariants}>
              <Card className="py-6 text-center">
                <h3 className="mb-3 text-sm text-gray-400">Token Balance</h3>
                <p className="text-4xl font-bold text-primary">
                  ${totalTokenBalance.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Available for creating and upgrading Agents
                </p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="py-6 text-center">
                <h3 className="mb-3 text-sm text-gray-400">
                  Agent Assets Value
                </h3>
                <p className="text-4xl font-bold text-secondary">
                  ${agentsValue.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Total value of all Agent assets
                </p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="py-6 text-center">
                <h3 className="mb-3 text-sm text-gray-400">
                  Unclaimed Rewards
                </h3>
                <p className="text-4xl font-bold text-accent">
                  {unclaimedRewards.length}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Number of rewards waiting to be claimed
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Reward pool distribution records */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="mb-4 text-lg font-bold">
                Reward Pool Distribution
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Time
                      </th>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Source
                      </th>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Amount
                      </th>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {user.rewards
                      .filter((reward) => reward.type === RewardType.TOKEN)
                      .map((reward) => (
                        <tr key={reward.id} className="hover:bg-gray-800/50">
                          <td className="py-3 text-sm">
                            {new Date(reward.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 text-sm">{reward.source}</td>
                          <td className="py-3 text-sm font-medium text-primary">
                            ${reward.amount}
                          </td>
                          <td className="py-3 text-sm">
                            {reward.claimed ? (
                              <span className="px-2 py-1 text-xs text-green-400 rounded-full bg-green-500/20">
                                Claimed
                              </span>
                            ) : (
                              <button
                                className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent hover:bg-accent/30"
                                onClick={() => handleClaimReward(reward.id)}
                                disabled={isLoading}
                              >
                                Claim
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                    {user.rewards.filter(
                      (reward) => reward.type === RewardType.TOKEN
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-gray-500"
                        >
                          No distribution records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Agent NFTs */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="mb-4 text-lg font-bold">Agent NFT</h3>

              {user.agents.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {user.agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-4 border rounded-lg border-gray-700/50 hover:border-primary"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-primary/50 to-accent/50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-white h-7 w-7"
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
                        <div>
                          <h4 className="font-bold">{agent.name}</h4>
                          <p className="text-xs text-gray-400">
                            Level {agent.level} • {agent.type}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Win Rate</span>
                          <span>{(agent.winRate * 100).toFixed(1)}%</span>
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
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-gray-500">
                  No Agent NFTs yet. Go to the creation page to make your first
                  Agent
                </p>
              )}
            </Card>
          </motion.div>

          {/* Equipment NFTs and Reputation SBTs */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <h3 className="mb-4 text-lg font-bold">Equipment NFTs</h3>

                <div className="space-y-3">
                  {/* Equipment examples */}
                  {user.achievements
                    .filter((a) => a.unlocked)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 border rounded-lg border-gray-700/30"
                      >
                        <div className="p-2 rounded bg-gradient-to-br from-secondary to-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-xs text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}

                  {user.achievements.filter((a) => a.unlocked).length === 0 && (
                    <p className="py-6 text-center text-gray-500">
                      No equipment NFTs yet
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <h3 className="mb-4 text-lg font-bold">Reputation SBT</h3>

                <div className="flex items-center justify-between p-4 border rounded-lg border-gray-700/30">
                  <div>
                    <h4 className="font-medium">Market Reputation</h4>
                    <p className="text-xs text-gray-400">
                      Community Contributor
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">A+</p>
                    <p className="text-xs text-gray-400">Trust Score</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeTab === 'rewards' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Pending Rewards</h3>

              {unclaimedRewards.length > 0 && (
                <Button
                  text={`Claim All (${unclaimedRewards.length})`}
                  variant="accent"
                  size="sm"
                  onClick={handleClaimAllRewards}
                  isLoading={isLoading}
                />
              )}
            </div>

            <motion.div className="space-y-4" variants={containerVariants}>
              {unclaimedRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  variants={itemVariants}
                  className="p-4 border rounded-lg border-gray-700/30 hover:border-accent"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {reward.type === RewardType.TOKEN ? (
                          <div className="p-2 rounded-full bg-primary/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="p-2 rounded-full bg-secondary/20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-secondary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                              />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold">
                            {reward.type === RewardType.TOKEN
                              ? `${reward.amount} Token`
                              : 'NFT 奖励'}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {reward.source}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Received: {new Date(reward.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      text="Claim"
                      variant="outline"
                      size="sm"
                      onClick={() => handleClaimReward(reward.id)}
                      isLoading={isLoading}
                    />
                  </div>
                </motion.div>
              ))}

              {unclaimedRewards.length === 0 && (
                <div className="py-10 text-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h4 className="mb-2 text-lg font-medium">
                    No Pending Rewards
                  </h4>
                  <p>
                    Participate in more games and activities to earn rewards
                  </p>
                </div>
              )}
            </motion.div>

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-bold">
                Claimed Rewards History
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Claim Time
                      </th>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Reward Type
                      </th>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Amount
                      </th>
                      <th className="py-3 text-sm font-medium text-left text-gray-400">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {user.rewards
                      .filter((r) => r.claimed)
                      .map((reward) => (
                        <tr key={reward.id} className="hover:bg-gray-800/50">
                          <td className="py-3 text-sm">
                            {new Date(reward.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 text-sm">
                            {reward.type === RewardType.TOKEN ? (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                                Token
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded-full text-xs">
                                NFT
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-sm">
                            {reward.type === RewardType.TOKEN
                              ? `${reward.amount} Token`
                              : 'NFT'}
                          </td>
                          <td className="py-3 text-sm">{reward.source}</td>
                        </tr>
                      ))}

                    {user.rewards.filter((r) => r.claimed).length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-gray-500"
                        >
                          No claimed rewards history
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'nfts' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Agent NFTs */}
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

          {/* 装备 NFTs */}
          <Card>
            <h3 className="mb-4 text-lg font-bold">装备 NFT 与徽章</h3>

            {user.achievements.filter((a) => a.unlocked).length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {user.achievements
                  .filter((a) => a.unlocked)
                  .map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      variants={itemVariants}
                      className="overflow-hidden transition-colors border rounded-lg border-gray-700/50 hover:border-secondary"
                    >
                      <div className="flex items-center justify-center h-32 p-4 bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="flex items-center justify-center w-20 h-20 overflow-hidden rounded-full bg-gradient-to-br from-secondary/50 to-purple-500/50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="mb-1 font-bold">{achievement.name}</h4>
                        <p className="mb-3 text-xs text-gray-400">
                          {achievement.description}
                        </p>

                        <p className="text-xs text-gray-500">
                          Unlocked:{' '}
                          {achievement.unlockedAt
                            ? new Date(
                                achievement.unlockedAt
                              ).toLocaleDateString()
                            : 'Unknown'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                No unlocked equipment or badges yet
              </p>
            )}
          </Card>

          {/* 声誉 SBT */}
          <Card>
            <h3 className="mb-4 text-lg font-bold">声誉 SBT</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <motion.div
                variants={itemVariants}
                className="overflow-hidden transition-colors border rounded-lg border-gray-700/50 hover:border-accent"
              >
                <div className="flex items-center justify-center h-32 p-4 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center justify-center w-20 h-20 overflow-hidden rounded-full bg-gradient-to-br from-accent/50 to-red-500/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">Market Participant</h4>
                    <span className="text-2xl font-bold text-accent">A+</span>
                  </div>

                  <p className="mb-3 text-sm text-gray-400">
                    Trading integrity and community contribution rating
                  </p>

                  <div className="w-full h-2 overflow-hidden bg-gray-700 rounded-full">
                    <div className="h-full w-[85%] bg-gradient-to-r from-accent to-red-500 rounded-full"></div>
                  </div>
                  <p className="mt-1 text-xs text-right text-gray-400">
                    Trust Score: 85/100
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="overflow-hidden transition-colors border rounded-lg border-gray-700/50 hover:border-primary"
              >
                <div className="flex items-center justify-center h-32 p-4 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center justify-center w-20 h-20 overflow-hidden rounded-full bg-gradient-to-br from-primary/50 to-blue-500/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">Trading Champion</h4>
                    <span className="text-2xl font-bold text-primary">B</span>
                  </div>

                  <p className="mb-3 text-sm text-gray-400">
                    Rating based on historical trading performance
                  </p>

                  <div className="w-full h-2 overflow-hidden bg-gray-700 rounded-full">
                    <div className="h-full w-[68%] bg-gradient-to-r from-primary to-blue-500 rounded-full"></div>
                  </div>
                  <p className="mt-1 text-xs text-right text-gray-400">
                    Performance: 68/100
                  </p>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default AssetsPage
