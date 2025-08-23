import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Message } from '../types';

interface MessageFeedProps {
  messages: Message[];
  isPublic?: boolean;
  title?: string; // Custom title for the message feed
  showThinking?: boolean; // Whether to show agent thinking messages
}

const MessageFeed = ({ messages, isPublic = true, title, showThinking = false }: MessageFeedProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 如果是显示Agent思考的Feed，则让分析动画基本常驻，只间歇性暂停
  useEffect(() => {
    if (showThinking) {
      // 初始默认开始分析状态
      setIsAnalyzing(true);
      
      // 管理分析状态的循环
      const analyzeInterval = setInterval(() => {
        // 当前是分析状态，有10%的概率暂停分析
        if (isAnalyzing && Math.random() < 0.1) {
          setIsAnalyzing(false);
          // 暂停0.5-1.5秒后继续分析
          setTimeout(() => {
            setIsAnalyzing(true);
          }, 500 + Math.random() * 1000);
        } 
        // 当前是暂停状态，需要恢复分析
        else if (!isAnalyzing) {
          setIsAnalyzing(true);
        }
      }, 2000 + Math.random() * 1500); // 每2-3.5秒检查一次状态
      
      return () => clearInterval(analyzeInterval);
    }
  }, [showThinking, isAnalyzing]);
  
  // Filter messages based on whether they are public or private, and if they're thinking messages
  const filteredMessages = messages.filter(message => {
    if (!showThinking && message.isThinking) return false;
    return message.isPublic === isPublic;
  });
  
  // Sort messages by timestamp, newest first
  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <div className="overflow-hidden border bg-surface rounded-xl border-gray-700/30">
      <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          {title || (isPublic ? 'Public Announcements' : 'Private Messages')}
          {showThinking && (
            <AnimatePresence>
              {isAnalyzing && (
                <motion.span 
                  className="flex items-center ml-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="w-2 h-2 mr-1 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  <motion.div 
                    className="w-2 h-2 mr-1 rounded-full bg-accent"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-secondary"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  />
                  <span className="ml-1 text-xs text-blue-400">analyzing market...</span>
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </h3>
        <div className="px-2 py-1 text-xs bg-gray-800 rounded-md">
          {filteredMessages.length} messages
        </div>
      </div>
      
      <div className="h-[400px] overflow-y-auto p-2">
        {sortedMessages.length > 0 ? (
          <div className="space-y-3">
            {sortedMessages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.isBribery 
                    ? 'bg-red-900/30 border border-red-700' 
                    : message.isThinking
                    ? 'bg-blue-900/20 border border-blue-700/30'
                    : 'bg-gray-800/50 border border-gray-700/30'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {message.senderId === 'SYSTEM' ? (
                      <span className="text-accent">System</span>
                    ) : (
                      <span>{message.senderId}</span>
                    )}
                    {message.isThinking && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        THINKING
                      </span>
                    )}
                    {message.isBribery && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                        BRIBERY ALERT
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <p className={`text-sm ${message.isBribery ? 'text-red-100' : ''}`}>{message.content}</p>
                
                {message.impact > 0 && (
                  <div className="flex items-center justify-end mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-secondary">Impact:</span>
                      <div className="flex">
                        {Array.from({ length: Math.min(5, Math.ceil(message.impact / 20)) }).map((_, i) => (
                          <span key={`filled-${i}`} className="text-xs text-secondary">★</span>
                        ))}
                        {Array.from({ length: 5 - Math.min(5, Math.ceil(message.impact / 20)) }).map((_, i) => (
                          <span key={`empty-${i}`} className="text-xs text-gray-600">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>No messages yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageFeed;
