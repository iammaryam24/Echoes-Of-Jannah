import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTrophy, FiZap, FiHeart, FiBookOpen, FiUsers, FiCalendar, FiSun, FiMoon, FiCompass, FiDroplet } from 'react-icons/fi';

const achievementIcons = {
  first_step: FiHeart,
  seeker: FiStar,
  devoted: FiTrophy,
  consistent_7: FiCalendar,
  consistent_30: FiZap,
  reflective: FiBookOpen,
  wisdom_collector: FiAward,
  community_contributor: FiUsers,
  quran_lover: FiBookOpen,
  light_seeker: FiSun,
  night_prayer: FiMoon,
  truth_seeker: FiCompass,
  spiritual_healer: FiDroplet
};

const achievementColors = {
  bronze: 'from-amber-600 to-amber-400',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-cyan-400 to-blue-300',
  diamond: 'from-purple-500 to-pink-500'
};

export default function AchievementBadge({ achievement, size = 'md', showTooltip = true, onClick }) {
  const Icon = achievementIcons[achievement.id] || FiAward;
  
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
    xl: 'w-32 h-32 text-5xl'
  };

  const getColor = (xp) => {
    if (xp >= 200) return 'diamond';
    if (xp >= 100) return 'platinum';
    if (xp >= 50) return 'gold';
    if (xp >= 25) return 'silver';
    return 'bronze';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className={`rounded-full bg-gradient-to-r ${achievementColors[getColor(achievement.xp)]} ${sizes[size]} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-aurora/30`}>
        <Icon className="text-cosmic" size={size === 'xl' ? 40 : size === 'lg' ? 32 : size === 'md' ? 20 : 14} />
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
          <div className="glass-card p-3 whitespace-nowrap border border-aurora/30">
            <p className="text-sm font-bold gradient-text">{achievement.name}</p>
            <p className="text-xs text-gray-400">{achievement.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <FiStar className="text-aurora text-xs" />
              <p className="text-xs text-aurora">+{achievement.xp} XP</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-aurora/20 to-divine/20 blur-xl -z-10"></div>
    </motion.div>
  );
}