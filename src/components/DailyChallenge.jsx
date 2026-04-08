import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiCheck, FiStar, FiRefreshCw, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getVerse, updateActivity, updateStreak } from '../api/quranFoundationApi';
import { useUser } from '../contexts/UserContext';

export default function DailyChallenge({ onComplete }) {
  const { userId, addXP, userData } = useUser();
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  const challenges = [
    { id: 1, type: 'verse', title: 'Memorize a New Verse', description: 'Learn and reflect on a new verse today', xp: 25, icon: '📖' },
    { id: 2, type: 'reflection', title: 'Share Your Reflection', description: 'Post a reflection about your feelings today', xp: 20, icon: '💭' },
    { id: 3, type: 'tafsir', title: 'Read Tafsir', description: 'Read the interpretation of a verse', xp: 15, icon: '📚' },
    { id: 4, type: 'audio', title: 'Listen to Quran', description: 'Listen to 10 minutes of Quran recitation', xp: 15, icon: '🎵' },
    { id: 5, type: 'bookmark', title: 'Save a Verse', description: 'Bookmark a verse that touches your heart', xp: 10, icon: '🔖' },
  ];

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  useEffect(() => {
    if (challenge && !completed) {
      const timer = setInterval(() => {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const diff = endOfDay - now;
        
        if (diff <= 0) {
          setTimeLeft('Expired');
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [challenge, completed]);

  const loadDailyChallenge = async () => {
    setLoading(true);
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem(`daily_challenge_${userId}`);
    
    if (savedChallenge) {
      const parsed = JSON.parse(savedChallenge);
      if (parsed.date === today) {
        setChallenge(parsed.challenge);
        setCompleted(parsed.completed || false);
        setLoading(false);
        return;
      }
    }
    
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    const newChallenge = {
      ...randomChallenge,
      date: today,
    };
    
    setChallenge(newChallenge);
    localStorage.setItem(`daily_challenge_${userId}`, JSON.stringify({
      challenge: newChallenge,
      date: today,
      completed: false
    }));
    setLoading(false);
  };

  const handleComplete = async () => {
    if (completed) {
      toast.error('You already completed today\'s challenge!');
      return;
    }
    
    setCompleted(true);
    addXP(challenge.xp);
    await updateActivity(userId, 'challenge_completed', 1);
    await updateStreak(userId);
    
    localStorage.setItem(`daily_challenge_${userId}`, JSON.stringify({
      challenge,
      date: new Date().toDateString(),
      completed: true
    }));
    
    toast.success(`🎉 Challenge completed! +${challenge.xp} XP`, {
      icon: '🏆',
      duration: 4000,
    });
    
    if (onComplete) onComplete();
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-20 bg-white/5 rounded"></div>
          <div className="h-10 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-aurora/10 to-divine/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-aurora to-divine flex items-center justify-center">
              <span className="text-2xl">{challenge.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold gradient-text">Daily Challenge</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FiClock size={12} />
                <span>{timeLeft || '23h 59m'} remaining</span>
              </div>
            </div>
          </div>
          {!completed && (
            <button 
              onClick={loadDailyChallenge} 
              className="p-2 rounded-full hover:bg-white/10 transition"
              title="Refresh challenge"
            >
              <FiRefreshCw size={16} className="text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="text-xl font-bold text-white">{challenge.title}</h4>
          <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
        </div>
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-sm text-aurora">
            <FiStar size={14} />
            <span>+{challenge.xp} XP</span>
          </div>
          
          {!completed ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2"
            >
              <FiCheck size={18} />
              <span>Complete Challenge</span>
            </motion.button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 text-green-500 bg-green-500/10 py-2 rounded-xl">
              <FiCheck size={20} />
              <span className="font-semibold">Challenge Completed!</span>
              <FiStar className="text-divine" size={16} />
            </div>
          )}
        </div>

        {userData?.streak > 0 && !completed && (
          <p className="text-xs text-gray-500 text-center mt-3">
            🔥 {userData.streak} day streak! Complete daily challenges to maintain your streak
          </p>
        )}
      </div>
    </motion.div>
  );
}