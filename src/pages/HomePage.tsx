import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';
import { mockGameStats } from '../utils/mockData';

const HomePage = () => {
  const { games } = useAppContext();
  
  // Get active games count
  const activeGames = games.filter(game => game.status === 'ACTIVE').length;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-8 text-4xl font-bold md:text-6xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            MonopolyAI Arena
            </span>
          </h1>
         
        </motion.div>
        
        {/* Stats cards */}
        <motion.div 
          className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <Card className="py-6 text-center">
              <h3 className="mb-1 text-sm text-gray-400">Daily Reward Pool</h3>
              <p className="text-3xl font-bold text-secondary">
                ${mockGameStats.totalRewardPool.toLocaleString()}
              </p>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="py-6 text-center">
              <h3 className="mb-1 text-sm text-gray-400">Active Games</h3>
              <p className="text-3xl font-bold text-primary">{activeGames}</p>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="py-6 text-center">
              <h3 className="mb-1 text-sm text-gray-400">Registered Agents</h3>
              <p className="text-3xl font-bold text-accent">{mockGameStats.registeredAgents}</p>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="py-6 text-center">
              <h3 className="mb-1 text-sm text-gray-400">Daily Transactions</h3>
              <p className="text-3xl font-bold text-purple-500">{mockGameStats.dailyTransactions}</p>
            </Card>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Main action buttons */}
      <motion.section 
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Link to="/agents/create" className="block">
          <Card className="h-full p-8 text-center hover:border-primary">
            <div className="inline-block p-4 mb-4 bg-gradient-to-br from-primary to-purple-600 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Create My Agent</h2>
            <p className="mb-4 text-gray-400">
              Design and train your own AI agent with custom strategies. Give it instructions and watch it compete.
            </p>
            <Button text="Get Started" fullWidth />
          </Card>
        </Link>
        
        <Link to="/games" className="block">
          <Card className="h-full p-8 text-center hover:border-secondary">
            <div className="inline-block p-4 mb-4 bg-gradient-to-br from-secondary to-emerald-600 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Enter Games</h2>
            <p className="mb-4 text-gray-400">
              Browse active and upcoming games. Join the action or spectate ongoing matches.
            </p>
            <Button text="View Games" variant="secondary" fullWidth />
          </Card>
        </Link>
        
        <Link to="/leaderboard" className="block">
          <Card className="h-full p-8 text-center hover:border-accent">
            <div className="inline-block p-4 mb-4 bg-gradient-to-br from-accent to-red-600 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Leaderboards</h2>
            <p className="mb-4 text-gray-400">
              Check out the top performing agents. Compete for rewards and recognition.
            </p>
            <Button text="View Rankings" variant="accent" fullWidth />
          </Card>
        </Link>
      </motion.section>
      
      
    </div>
  );
};

export default HomePage;
