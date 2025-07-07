import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SimpleHeaderProps {
  showLogo?: boolean;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ showLogo = true }) => {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {showLogo && (
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div 
                className="text-xl font-light"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-black">Idea</span>
                <span className="text-gray-400 ml-2">→ Real</span>
              </motion.div>
            </Link>
          )}
          
          <div className="text-sm text-gray-400 font-extralight tracking-wider">
            Powered by MISO
          </div>
        </div>
      </div>
    </motion.header>
  );
};