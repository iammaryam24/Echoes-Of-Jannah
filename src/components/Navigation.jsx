import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiHeart, FiDroplet, FiUsers, FiBookOpen, 
  FiAward, FiMenu, FiX, FiBarChart2, FiTrendingUp, FiZap,
  FiLogIn, FiLogOut, FiUser, FiCheckCircle
} from 'react-icons/fi';
import { useQuranAuth } from '../contexts/QuranAuthContext';

const navItems = [
  { id: 'timeline', label: 'Timeline', icon: FiCalendar, gradient: 'from-amber-500 to-pink-500', description: 'Your sacred journey' },
  { id: 'mirror', label: 'Heart Mirror', icon: FiHeart, gradient: 'from-pink-500 to-rose-500', description: 'Emotions to Quran' },
  { id: 'quran', label: 'Quran', icon: FiBookOpen, gradient: 'from-blue-500 to-cyan-500', description: 'Read & explore' },
  { id: 'journey', label: 'Journey', icon: FiTrendingUp, gradient: 'from-green-500 to-emerald-500', description: 'Track progress' },
  { id: 'dna', label: 'Spiritual DNA', icon: FiDroplet, gradient: 'from-teal-500 to-cyan-500', description: 'Your profile' },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2, gradient: 'from-indigo-500 to-purple-500', description: 'Deep insights' },
  { id: 'community', label: 'Community', icon: FiUsers, gradient: 'from-orange-500 to-red-500', description: 'Share & grow' },
];

export default function Navigation({ currentView, setCurrentView, userData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, login, logout, isLoading, isAuthenticated } = useQuranAuth();
  
  const safeUserData = {
    streak: userData?.streak || 0,
    level: userData?.level || 1,
    xp: userData?.xp || 0,
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-3 md:px-4 py-2">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('timeline')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
                  Echoes of Jannah
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    currentView === item.id 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <item.icon size={12} className="inline mr-1" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiTrendingUp className="text-orange-400 text-[10px]" />
                    <span className="text-[10px] text-orange-400">{safeUserData.streak}d</span>
                  </div>
                  <div className="bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiAward className="text-purple-400 text-[10px]" />
                    <span className="text-[10px] text-purple-400">Lv.{safeUserData.level}</span>
                  </div>
                  <div className="bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiZap className="text-amber-400 text-[10px]" />
                    <span className="text-[10px] text-amber-400">{safeUserData.xp}</span>
                  </div>
                </div>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiUser className="text-green-400 text-[10px]" />
                    <span className="text-[10px] text-green-400 hidden sm:inline">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-white/10 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-red-500/20 transition"
                  >
                    <FiLogOut className="text-red-400 text-[10px]" />
                    <span className="text-[10px] text-red-400 hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  disabled={isLoading}
                  className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-500/20 transition"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiLogIn className="text-emerald-400 text-[10px]" />
                  )}
                  <span className="text-[10px] text-emerald-400">
                    {isLoading ? 'Connecting...' : 'Sign in'}
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden bg-white/10 p-2 rounded-lg">
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="lg:hidden border-t border-white/10 overflow-hidden">
              <div className="p-3 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false); }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-sm ${
                      currentView === item.id ? 'bg-gradient-to-r ' + item.gradient : 'bg-white/10'
                    }`}
                  >
                    <item.icon size={14} className="inline mr-2" />
                    {item.label}
                  </button>
                ))}
                
                {isAuthenticated ? (
                  <button onClick={logout} className="w-full px-3 py-2 rounded-xl text-left text-sm bg-red-500/20 text-red-400">
                    <FiLogOut className="inline mr-2" size={14} /> Logout ({user?.name})
                  </button>
                ) : (
                  <button onClick={login} disabled={isLoading} className="w-full px-3 py-2 rounded-xl text-left text-sm bg-emerald-500/20 text-emerald-400">
                    <FiLogIn className="inline mr-2" size={14} /> {isLoading ? 'Connecting...' : 'Sign in with Quran Foundation'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-14"></div>
    </>
  );
}