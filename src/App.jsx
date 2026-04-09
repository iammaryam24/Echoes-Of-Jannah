import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiHome, FiHeart, FiMusic, FiDroplet, FiMenu, FiX,
  FiCalendar, FiUsers, FiBookOpen, FiAward, FiBarChart2,
  FiStar, FiTrendingUp, FiCompass
} from 'react-icons/fi';
import ParticleBackground from './components/ParticleBackground';
import Navigation from './components/Navigation';
import LifeTimeline from './components/LifeTimeline';
import EmotionMirror from './components/EmotionMirror';
import QuranBrowser from './components/QuranBrowser';
import SpiritualDNA from './components/SpiritualDNA';
import DailyChallenge from './components/DailyChallenge';
import CommunityHub from './components/CommunityHub';
import QuranJourney from './components/QuranJourney';
import ReflectionPost from './components/ReflectionPost';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import AuthCallback from './pages/AuthCallback';
import { useUser } from './contexts/UserContext';
import { useQuranAuth } from './contexts/QuranAuthContext';

// Simple QuranPlayer component if missing
const QuranPlayer = ({ userId }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
      <div className="text-6xl mb-4">🎧</div>
      <h2 className="text-xl font-semibold text-white mb-2">Sacred Audio</h2>
      <p className="text-gray-400">Quran recitations coming soon...</p>
      <p className="text-xs text-gray-500 mt-4">This feature is under development</p>
    </div>
  );
};

function AppContent() {
  const [currentView, setCurrentView] = useState('timeline');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMobileTip, setShowMobileTip] = useState(true);
  const { userId, userData, updateStreak, loading } = useUser();
  const { user: qfUser, isAuthenticated } = useQuranAuth();

  // Safe userData with fallbacks
  const safeUserData = {
    streak: userData?.streak || 0,
    level: userData?.level || 1,
    xp: userData?.xp || 0,
    reflections: userData?.reflections || [],
    ...userData
  };

  useEffect(() => {
    if (userId) {
      updateStreak();
    }
    
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    
    const mobileTipTimer = setTimeout(() => {
      setShowMobileTip(false);
    }, 10000);
    
    if (!loading && userId && safeUserData.streak > 0) {
      toast.success(`Welcome back! 🔥 ${safeUserData.streak} day streak!`, {
        icon: '🌙',
        duration: 4000,
        style: {
          background: '#1A1B3A',
          color: '#fff',
          border: '1px solid #00F2FE',
        },
      });
    }
    
    // Show login reminder if not authenticated
    if (!loading && !isAuthenticated && !showWelcome) {
      setTimeout(() => {
        toast('✨ Sign in with Quran Foundation to save your progress!', {
          icon: '🔐',
          duration: 5000,
        });
      }, 2000);
    }
    
    return () => {
      clearTimeout(timer);
      clearTimeout(mobileTipTimer);
    };
  }, [userId, loading, isAuthenticated]);

  const renderView = () => {
    switch (currentView) {
      case 'timeline':
        return <LifeTimeline userId={userId} />;
      case 'mirror':
        return <EmotionMirror userId={userId} />;
      case 'quran':
        return <QuranBrowser userId={userId} />;
      case 'audio':
        return <QuranPlayer userId={userId} />;
      case 'journey':
        return <QuranJourney userId={userId} />;
      case 'dna':
        return <SpiritualDNA userId={userId} />;
      case 'analytics':
        return <AdvancedAnalytics userId={userId} />;
      case 'community':
        return <CommunityHub userId={userId} />;
      default:
        return <LifeTimeline userId={userId} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black relative overflow-hidden">
      <ParticleBackground />
      
      {/* Welcome Banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500/20 to-pink-500/20 backdrop-blur-md border-b border-amber-500/30"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 flex items-center justify-center animate-bounce">
                    <span className="text-white font-bold text-xl">E</span>
                  </div>
                  <div>
                    <h2 className="font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">Welcome to Echoes of Jannah</h2>
                    <p className="text-xs text-gray-300">Your sacred journey begins here</p>
                  </div>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-gray-400 hover:text-white transition">
                  <FiX size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        userData={safeUserData}
      />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {currentView !== 'community' && currentView !== 'quran' && currentView !== 'audio' && currentView !== 'analytics' && currentView !== 'journey' ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {renderView()}
                </div>
                <div className="hidden lg:block space-y-6">
                  <DailyChallenge userId={userId} />
                  <ReflectionPost userId={userId} compact={true} />
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                      <FiStar className="text-amber-400" /> Quick Stats
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Today's Progress</span>
                        <span className="text-amber-400">{safeUserData.reflections?.length || 0} reflections</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Streak</span>
                        <span className="text-pink-400">{safeUserData.streak} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Spiritual Level</span>
                        <span className="text-emerald-400">{safeUserData.level}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total XP</span>
                        <span className="text-amber-400">{safeUserData.xp} XP</span>
                      </div>
                      {isAuthenticated && (
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                          <span className="text-gray-400">Quran Foundation</span>
                          <span className="text-green-400">✓ Connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              renderView()
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Tip */}
      <AnimatePresence>
        {showMobileTip && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-20 right-4 z-30 lg:hidden"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 max-w-xs border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiCompass className="text-amber-400" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white">Tap the menu icon to navigate</p>
                  <p className="text-xs text-gray-400">Explore all features!</p>
                </div>
                <button onClick={() => setShowMobileTip(false)} className="text-gray-400">
                  <FiX size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB for Daily Challenge */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-2xl flex items-center justify-center z-30 hover:scale-110 transition-transform duration-300"
        onClick={() => {
          toast('✨ Daily Challenge: Complete today\'s task for +XP!', {
            icon: '🏆',
            duration: 5000,
            style: {
              background: '#1A1B3A',
              color: '#fff',
              border: '1px solid #FFD700',
            },
          });
        }}
      >
        <FiAward size={24} />
      </motion.button>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-xs border-t border-white/5 mt-12">
        <p>© 2026 Echoes of Jannah - Transforming hearts through the words of Allah</p>
        <p className="mt-1">Powered by Quran Foundation API</p>
        {isAuthenticated && <p className="mt-1 text-green-600">✓ Authenticated with Quran Foundation</p>}
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
}

export default App;