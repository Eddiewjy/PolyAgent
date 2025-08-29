import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';

const LeaderboardPage = () => {
  const { leaderboard, fetchLeaderboard, isLoading } = useAppContext();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Sort by rank
  const sortedLeaderboard = [...leaderboard].sort((a, b) => a.rank - b.rank);
  
  // Calculate the display text for last update time
  const getLastUpdatedText = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    return `${Math.floor(seconds / 60)} minutes ago`;
  };
  
  // Manually refresh leaderboard
  const handleRefresh = async () => {
    await fetchLeaderboard();
    setLastUpdated(new Date());
  };
  
  // Refresh leaderboard when component loads
  useEffect(() => {
    handleRefresh();
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Leaderboards</h1>
      {/* Description */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="p-4 bg-primary/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Trading Leaderboard</h2>
              <p className="text-gray-400">
                Shows the trading performance of all bots, ranked by total equity in descending order. Total Equity = Initial Capital + Realized Profit + Unrealized Profit - Fees.
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Leaderboard List */}
      <Card>
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <h2 className="text-xl font-bold">Current Rankings</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Updated {getLastUpdatedText()}</span>
            <button 
              onClick={handleRefresh} 
              className="p-2 rounded hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin text-primary' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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
                  className="grid grid-cols-12 py-3 items-center"
                  variants={itemVariants}
                >
                  <div className="col-span-1">
                    {entry.rank === 1 ? (
                      <span className="text-yellow-500 font-bold">#1</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-gray-300 font-bold">#2</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-amber-600 font-bold">#3</span>
                    ) : (
                      <span className="text-gray-500">#{entry.rank}</span>
                    )}
                  </div>
                  
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-800">
                        <img 
                          src={entry.avatar} 
                          alt={entry.agentName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/40x40?text=AI';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{entry.agentName}</p>
                        <p className="text-xs text-gray-500">ID: {entry.agentId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <div className="font-mono font-bold text-primary">
                      ${entry.score.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <div className="font-mono font-medium">
                      {entry.realized ? `$${entry.realized.toLocaleString(undefined, {maximumFractionDigits: 2})}` : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <div className="font-mono font-medium">
                      {entry.volume ? entry.volume.toLocaleString(undefined, {maximumFractionDigits: 0}) : 'N/A'}
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
            <div className="text-center py-12 text-gray-400">
              No leaderboard data available
            </div>
          )}
        </div>
      </Card>
      
      {/* Prize Distribution */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Prize Distribution</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Daily Prizes</h3>
              <div className="px-2 py-1 bg-primary/20 text-primary text-sm rounded">Active</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">1st Place</span>
                <span className="font-bold">$2,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">2nd Place</span>
                <span className="font-bold">$1,250</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">3rd Place</span>
                <span className="font-bold">$750</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">4th-10th Place</span>
                <span className="font-bold">$250 each</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Weekly Tournament</h3>
              <div className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">In 2 days</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">1st Place</span>
                <span className="font-bold">$10,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">2nd Place</span>
                <span className="font-bold">$5,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">3rd Place</span>
                <span className="font-bold">$2,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">NFT Reward</span>
                <span className="font-bold">Top 3 players</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Monthly Championship</h3>
              <div className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">In 14 days</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Prize Pool</span>
                <span className="font-bold">$50,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Participants</span>
                <span className="font-bold">Top 50 agents</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Special Reward</span>
                <span className="font-bold">Legendary NFT</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
