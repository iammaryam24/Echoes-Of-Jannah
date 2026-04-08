import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiHeart, FiDroplet, FiUsers, FiBookOpen, 
  FiAward, FiMenu, FiX, FiBarChart2, FiHome, FiStar, FiTrendingUp, FiZap
} from 'react-icons/fi';

const navItems = [
  { id: 'timeline', label: 'Timeline', icon: FiCalendar, gradient: 'from-aurora to-divine', description: 'Your sacred journey' },
  { id: 'mirror', label: 'Heart Mirror', icon: FiHeart, gradient: 'from-pink-500 to-rose-500', description: 'Emotions to Quran' },
  { id: 'quran', label: 'Quran', icon: FiBookOpen, gradient: 'from-blue-500 to-cyan-500', description: 'Read & explore' },
  { id: 'journey', label: 'Journey', icon: FiTrendingUp, gradient: 'from-green-500 to-emerald-500', description: 'Track progress' },
  { id: 'dna', label: 'Spiritual DNA', icon: FiDroplet, gradient: 'from-teal-500 to-cyan-500', description: 'Your profile' },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2, gradient: 'from-indigo-500 to-purple-500', description: 'Deep insights' },
  { id: 'community', label: 'Community', icon: FiUsers, gradient: 'from-orange-500 to-red-500', description: 'Share & grow' },
];

export default function Navigation({ currentView, setCurrentView, userData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Safe userData with fallbacks
  const safeUserData = {
    streak: userData?.streak || 0,
    level: userData?.level || 1,
    xp: userData?.xp || 0,
    ...userData
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-aurora/20">
        <div className="container mx-auto px-3 md:px-4 py-1.5 md:py-2">
          <div className="flex justify-between items-center">
            {/* Logo - Smaller */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-1.5 md:gap-2 cursor-pointer group"
              onClick={() => setCurrentView('timeline')}
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-aurora to-divine flex items-center justify-center animate-glow group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm md:text-base">E</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent">
                  Echoes of Jannah
                </h1>
                <p className="text-[10px] md:text-xs text-gray-400 hidden lg:block">Your Sacred Journey with Quran</p>
              </div>
            </motion.div>

            {/* Desktop Navigation - Compact */}
            <div className="hidden lg:flex gap-0.5">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    console.log('Navigating to:', item.id);
                    setCurrentView(item.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 text-xs font-medium ${
                    currentView === item.id 
                      ? `bg-gradient-to-r ${item.gradient} text-white font-bold shadow-lg` 
                      : 'glass-card hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <item.icon size={12} />
                  <span className="hidden xl:inline">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* User Stats - Compact */}
            <div className="hidden md:flex items-center gap-2">
              <div className="glass-card px-2 py-1 rounded-full flex items-center gap-1">
                <FiTrendingUp className="text-orange-500 text-[10px]" />
                <span className="text-[10px] text-orange-400">{safeUserData.streak}d</span>
              </div>
              <div className="glass-card px-2 py-1 rounded-full flex items-center gap-1">
                <FiAward className="text-purple-400 text-[10px]" />
                <span className="text-[10px] text-purple-400">Lv.{safeUserData.level}</span>
              </div>
              <div className="glass-card px-2 py-1 rounded-full flex items-center gap-1">
                <FiZap className="text-aurora text-[10px]" />
                <span className="text-[10px] text-aurora">{safeUserData.xp}</span>
              </div>
            </div>

            {/* Mobile Menu Button - Smaller */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass-card p-1.5"
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Compact */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-aurora/20 overflow-hidden"
            >
              <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log('Mobile navigating to:', item.id);
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl transition-all flex items-center gap-2 text-sm ${
                      currentView === item.id 
                        ? `bg-gradient-to-r ${item.gradient} text-white font-bold shadow-lg` 
                        : 'glass-card hover:bg-white/10'
                    }`}
                  >
                    <item.icon size={16} />
                    <div className="text-left flex-1">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="text-[10px] opacity-70">{item.description}</span>
                    </div>
                    {currentView === item.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </motion.button>
                ))}
                
                {/* Mobile User Stats - Compact */}
                <div className="pt-2 border-t border-white/10 mt-2">
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="glass-card p-1.5 rounded-lg">
                      <FiTrendingUp className="text-orange-500 text-[10px] mx-auto mb-0.5" />
                      <span className="text-[10px] text-orange-400">{safeUserData.streak}d</span>
                    </div>
                    <div className="glass-card p-1.5 rounded-lg">
                      <FiAward className="text-purple-400 text-[10px] mx-auto mb-0.5" />
                      <span className="text-[10px] text-purple-400">Lv.{safeUserData.level}</span>
                    </div>
                    <div className="glass-card p-1.5 rounded-lg">
                      <FiZap className="text-aurora text-[10px] mx-auto mb-0.5" />
                      <span className="text-[10px] text-aurora">{safeUserData.xp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed nav - Reduced height */}
      <div className="h-12 md:h-14"></div>
    </>
  );
}