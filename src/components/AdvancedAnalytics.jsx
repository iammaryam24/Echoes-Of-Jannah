import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, CartesianGrid, Legend
} from 'recharts';
import { 
  FiTrendingUp, FiCalendar, FiSmile, FiBook, FiHeart, FiActivity, 
  FiBarChart2, FiPieChart, FiStar, FiClock, FiThumbsUp, FiUsers, 
  FiAward, FiAlertCircle, FiTrendingDown, FiDownload, FiShare2,
  FiZap, FiTarget, FiCompass, FiMoon, FiSun, FiCloud, FiBattery,
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiGrid, FiList,
  FiCompass as FiCompassIcon, FiDollarSign, FiGift, FiPlus, FiMinus
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { userApi, quranApi } from '../api/quranApi';
import toast from 'react-hot-toast';

// Spiritual Compass Game Component
const SpiritualCompassGame = ({ onScoreUpdate, spiritualGrowth }) => {
  const [gameState, setGameState] = useState('start'); // start, playing, result
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [dailyBonus, setDailyBonus] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameComplete, setGameComplete] = useState(false);

  // Quran and Islamic knowledge questions
  const questions = {
    easy: [
      { question: "What is the first Surah of the Quran?", options: ["Al-Fatiha", "Al-Baqarah", "Al-Ikhlas", "An-Nas"], correct: 0, fact: "Al-Fatiha is known as 'The Opening' and is recited in every prayer." },
      { question: "How many Surahs are in the Quran?", options: ["99", "104", "114", "124"], correct: 2, fact: "The Quran contains 114 Surahs (chapters)." },
      { question: "Which angel brought revelation to Prophet Muhammad (PBUH)?", options: ["Mika'il", "Israfil", "Jibreel", "Azra'il"], correct: 2, fact: "Angel Jibreel (Gabriel) was responsible for delivering Allah's messages." },
      { question: "What is the holy book of Islam?", options: ["Torah", "Bible", "Quran", "Psalms"], correct: 2, fact: "The Quran is the final revelation from Allah to humanity." },
      { question: "Which direction do Muslims face when praying?", options: ["East", "West", "North", "Mecca (Kaaba)"], correct: 3, fact: "Muslims face the Kaaba in Mecca, Saudi Arabia during prayer." }
    ],
    medium: [
      { question: "Which Surah is known as the 'Heart of the Quran'?", options: ["Yasin", "Rahman", "Mulk", "Fatiha"], correct: 0, fact: "Surah Yasin is often referred to as the heart of the Quran." },
      { question: "What does 'Bismillah' mean?", options: ["Praise be to Allah", "In the name of Allah", "Allah is Great", "Thanks to Allah"], correct: 1, fact: "Bismillah means 'In the name of Allah' and is recited before actions." },
      { question: "Which Prophet is known as the 'Father of Prophets'?", options: ["Musa", "Isa", "Ibrahim", "Nuh"], correct: 2, fact: "Prophet Ibrahim (Abraham) is considered the father of many prophets." },
      { question: "What is Laylatul Qadr?", options: ["Night of Power", "Night of Forgiveness", "Night of Ascension", "Night of Migration"], correct: 0, fact: "Laylatul Qadr is better than a thousand months." },
      { question: "Which companion of the Prophet was known as 'The Lion of Allah'?", options: ["Umar", "Ali", "Hamza", "Khalid"], correct: 2, fact: "Hamza ibn Abdul-Muttalib was known for his bravery in battle." }
    ],
    hard: [
      { question: "Which Surah mentions the longest verse (Ayatul Kursi)?", options: ["Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Maidah"], correct: 0, fact: "Ayatul Kursi is verse 255 of Surah Al-Baqarah." },
      { question: "How many prophets are mentioned by name in the Quran?", options: ["25", "28", "30", "35"], correct: 0, fact: "The Quran mentions 25 prophets by name." },
      { question: "Which battle was known as 'The Decisive Battle'?", options: ["Badr", "Uhud", "Khandaq", "Tabuk"], correct: 0, fact: "The Battle of Badr was a turning point for early Muslims." },
      { question: "What is the Islamic concept of 'Tawheed'?", options: ["Prayer", "Charity", "Oneness of Allah", "Fasting"], correct: 2, fact: "Tawheed is the fundamental belief in the absolute oneness of Allah." },
      { question: "Which Surah has 'Bismillah' twice?", options: ["Al-Fatiha", "Al-Naml", "Yasin", "Rahman"], correct: 1, fact: "Surah Al-Naml contains Bismillah at its beginning and within the chapter." }
    ]
  };

  const difficultySettings = {
    easy: { time: 20, points: 10, bonus: 5 },
    medium: { time: 15, points: 20, bonus: 10 },
    hard: { time: 10, points: 30, bonus: 15 }
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && currentQuestion && timeLeft > 0 && !showFeedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, currentQuestion, timeLeft, showFeedback]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setGameComplete(false);
    setDailyBonus(0);
    loadNewQuestion();
  };

  const loadNewQuestion = () => {
    const questionSet = questions[difficulty];
    const randomQuestion = { ...questionSet[Math.floor(Math.random() * questionSet.length)] };
    setCurrentQuestion(randomQuestion);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(difficultySettings[difficulty].time);
  };

  const handleTimeout = () => {
    if (!showFeedback && currentQuestion) {
      setShowFeedback(true);
      setStreak(0);
      toast.error(`Time's up! The correct answer was: ${currentQuestion.options[currentQuestion.correct]}`);
      setTimeout(() => {
        if (questionsAnswered + 1 >= 10) {
          endGame();
        } else {
          setQuestionsAnswered(prev => prev + 1);
          loadNewQuestion();
        }
      }, 2000);
    }
  };

  const handleAnswer = (selectedIndex) => {
    if (showFeedback) return;
    
    setSelectedAnswer(selectedIndex);
    setShowFeedback(true);
    const isCorrect = selectedIndex === currentQuestion.correct;
    
    if (isCorrect) {
      const pointsEarned = difficultySettings[difficulty].points + (streak * difficultySettings[difficulty].bonus);
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      onScoreUpdate?.(pointsEarned);
      toast.success(`✓ Correct! +${pointsEarned} points (${streak} streak bonus!)`);
    } else {
      setStreak(0);
      toast.error(`✗ Wrong! The correct answer was: ${currentQuestion.options[currentQuestion.correct]}`);
    }
    
    setTimeout(() => {
      if (questionsAnswered + 1 >= 10) {
        endGame();
      } else {
        setQuestionsAnswered(prev => prev + 1);
        loadNewQuestion();
      }
    }, 2000);
  };

  const endGame = () => {
    setGameComplete(true);
    const bonus = Math.floor(score / 100) * 10;
    setDailyBonus(bonus);
    setGameState('result');
    toast.success(`Game Complete! You earned ${bonus} bonus XP!`);
    onScoreUpdate?.(bonus);
  };

  const resetGame = () => {
    setGameState('start');
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setGameComplete(false);
    setDailyBonus(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-4 border border-purple-500/30"
    >
      {gameState === 'start' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-3">🧭</div>
          <h4 className="text-xl font-bold text-white mb-2">Spiritual Compass Challenge</h4>
          <p className="text-gray-400 text-sm mb-4">Test your Quran & Islamic knowledge!</p>
          
          <div className="space-y-3 mb-4">
            <div className="flex gap-2 justify-center">
              {['easy', 'medium', 'hard'].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-1 rounded-full text-xs capitalize transition ${
                    difficulty === level 
                      ? 'bg-gradient-to-r from-aurora to-divine text-white' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <div>🏆 {difficultySettings[difficulty].points} pts/q</div>
              <div>⏱️ {difficultySettings[difficulty].time}s</div>
              <div>🎯 10 questions</div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-3 bg-gradient-to-r from-aurora to-divine rounded-xl font-semibold hover:opacity-90 transition"
          >
            Begin Journey 🧭
          </button>
        </motion.div>
      )}

      {gameState === 'playing' && currentQuestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Game Header */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <FiStar className="text-yellow-400" />
              <span className="text-white font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-aurora" />
              <span className="text-aurora font-bold">Streak: {streak}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-divine" />
              <span className={`font-bold ${timeLeft < 5 ? 'text-red-400 animate-pulse' : 'text-divine'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-aurora to-divine"
              initial={{ width: `${(questionsAnswered / 10) * 100}%` }}
              animate={{ width: `${(questionsAnswered / 10) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">Question {questionsAnswered + 1}/10</p>
          
          {/* Question */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white font-medium text-center">{currentQuestion.question}</p>
          </div>
          
          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                  showFeedback
                    ? idx === currentQuestion.correct
                      ? 'bg-green-500/30 border-green-500'
                      : selectedAnswer === idx
                      ? 'bg-red-500/30 border-red-500'
                      : 'bg-white/5 border-white/10'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <span className="text-gray-300">{String.fromCharCode(65 + idx)}. {option}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Fact Popup */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-aurora/20 border border-aurora/30"
              >
                <p className="text-xs text-aurora">📖 Did you know? {currentQuestion.fact}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {gameState === 'result' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl mb-2">🏆</div>
          <h4 className="text-xl font-bold text-white">Challenge Complete!</h4>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-aurora">{score} XP</p>
            <p className="text-sm text-gray-400">+{dailyBonus} bonus XP earned!</p>
            <div className="flex justify-center gap-4 text-xs">
              <div>📊 Accuracy: {Math.round((score / (difficultySettings[difficulty].points * 10)) * 100)}%</div>
              <div>🔥 Max Streak: {streak}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetGame}
              className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameState('start')}
              className="flex-1 py-2 bg-gradient-to-r from-aurora to-divine rounded-lg hover:opacity-90 transition"
            >
              New Game
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function AdvancedAnalytics() {
  const { userId, addXP } = useUser();
  const [activities, setActivities] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [emotionDistribution, setEmotionDistribution] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [spiritualGrowth, setSpiritualGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [showInsights, setShowInsights] = useState(true);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0, percentage: 0 });
  const [achievements, setAchievements] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [animatedValue, setAnimatedValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [gameXP, setGameXP] = useState(0);

  useEffect(() => {
    if (userId) {
      loadAnalytics();
      calculateStreak();
      loadAchievements();
      generatePredictions();
    } else {
      setLoading(false);
      setError('User not authenticated');
    }
  }, [timeRange, userId]);

  // Animate counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValue(prev => {
        if (prev < 100) return prev + 1;
        clearInterval(interval);
        return 100;
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let activitiesData = [];
      let reflectionsData = [];
      
      try {
        activitiesData = await userApi.getUserActivities(userId);
        activitiesData = Array.isArray(activitiesData) ? activitiesData : [];
      } catch (err) {
        console.error('Error loading activities:', err);
        activitiesData = [];
      }
      
      try {
        reflectionsData = await userApi.getUserReflections(userId);
        reflectionsData = Array.isArray(reflectionsData) ? reflectionsData : [];
      } catch (err) {
        console.error('Error loading reflections:', err);
        reflectionsData = [];
      }
      
      setActivities(activitiesData);
      setReflections(reflectionsData);
      
      // Emotion distribution
      const emotionCount = {};
      if (Array.isArray(reflectionsData)) {
        reflectionsData.forEach(r => {
          if (r && r.emotion) {
            emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1;
          }
        });
      }
      
      const distribution = Object.entries(emotionCount).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value,
      }));
      setEmotionDistribution(distribution);
      
      // Weekly activity
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekly = days.map(day => ({ day, verses: 0, reflections: 0, xp: 0 }));
      
      if (Array.isArray(activitiesData)) {
        activitiesData.forEach(a => {
          if (a && a.timestamp) {
            try {
              const date = new Date(a.timestamp);
              const dayIndex = date.getDay();
              if (a.activityType === 'verse_completed') {
                weekly[dayIndex].verses++;
                weekly[dayIndex].xp += 10;
              }
              if (a.activityType === 'reflection_added') {
                weekly[dayIndex].reflections++;
                weekly[dayIndex].xp += 15;
              }
            } catch (err) {
              console.error('Error processing activity date:', err);
            }
          }
        });
      }
      
      if (Array.isArray(reflectionsData)) {
        reflectionsData.forEach(r => {
          if (r && r.createdAt) {
            try {
              const date = new Date(r.createdAt);
              const dayIndex = date.getDay();
              weekly[dayIndex].reflections++;
              weekly[dayIndex].xp += 5;
            } catch (err) {
              console.error('Error processing reflection date:', err);
            }
          }
        });
      }
      setWeeklyActivity(weekly);
      
      // Monthly trend
      const trends = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trends.push({ date: dayStr, activities: 0, xp: 0 });
      }
      
      if (Array.isArray(activitiesData)) {
        activitiesData.forEach(a => {
          if (a && a.timestamp) {
            try {
              const activityDate = new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const trend = trends.find(t => t.date === activityDate);
              if (trend) {
                trend.activities++;
                trend.xp += 10;
              }
            } catch (err) {
              console.error('Error processing trend date:', err);
            }
          }
        });
      }
      setMonthlyTrend(trends);
      
      // Spiritual growth radar
      const totalVerses = Array.isArray(activitiesData) 
        ? activitiesData.filter(a => a && a.activityType === 'verse_completed').length 
        : 0;
      const totalBookmarks = Array.isArray(activitiesData) 
        ? activitiesData.filter(a => a && a.activityType === 'bookmark_added').length 
        : 0;
      const totalReflections = Array.isArray(reflectionsData) ? reflectionsData.length : 0;
      const streakDays = Array.isArray(activitiesData) 
        ? activitiesData.filter(a => a && a.activityType === 'daily_checkin').length 
        : 0;
      const uniqueEmotions = Object.keys(emotionCount).length;
      
      setSpiritualGrowth([
        { subject: 'Quran Reading', value: Math.min(100, totalVerses * 2), fullMark: 100, color: '#00F2FE' },
        { subject: 'Reflection', value: Math.min(100, totalReflections * 5), fullMark: 100, color: '#F472B6' },
        { subject: 'Consistency', value: Math.min(100, streakDays * 3.33), fullMark: 100, color: '#10B981' },
        { subject: 'Emotional IQ', value: Math.min(100, uniqueEmotions * 10), fullMark: 100, color: '#8B5CF6' },
        { subject: 'Knowledge', value: Math.min(100, totalBookmarks * 4), fullMark: 100, color: '#F59E0B' },
      ]);
      
    } catch (error) {
      console.error('Error in loadAnalytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = () => {
    const today = new Date().toDateString();
    const checkins = activities.filter(a => a.activityType === 'daily_checkin');
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < checkins.length; i++) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }
    
    currentStreak = checkins.filter(c => new Date(c.timestamp).toDateString() === today).length > 0 ? tempStreak : 0;
    const percentage = (currentStreak / Math.max(longestStreak, 1)) * 100;
    
    setStreakData({ current: currentStreak, longest: longestStreak, percentage });
  };

  const loadAchievements = () => {
    const totalActivities = activities.length;
    const totalReflections = reflections.length;
    const totalVerses = activities.filter(a => a.activityType === 'verse_completed').length;
    
    const achievementsList = [
      { id: 1, name: 'First Steps', icon: '🌱', requirement: 1, current: totalActivities, unlocked: totalActivities >= 1, xp: 50 },
      { id: 2, name: 'Consistent Seeker', icon: '📿', requirement: 7, current: streakData.current, unlocked: streakData.current >= 7, xp: 100 },
      { id: 3, name: 'Reflection Master', icon: '💭', requirement: 10, current: totalReflections, unlocked: totalReflections >= 10, xp: 150 },
      { id: 4, name: 'Quran Lover', icon: '📖', requirement: 30, current: totalVerses, unlocked: totalVerses >= 30, xp: 200 },
      { id: 5, name: 'Emotional Healer', icon: '💝', requirement: 5, current: Object.keys(emotionDistribution).length, unlocked: Object.keys(emotionDistribution).length >= 5, xp: 250 },
    ];
    setAchievements(achievementsList);
  };

  const generatePredictions = () => {
    const avgDaily = activities.length / 30;
    const projectedMonthly = Math.round(avgDaily * 30);
    const consistency = streakData.percentage;
    const predictedGrowth = Math.min(100, Math.round(consistency * 1.2));
    
    setPredictions({
      projectedActivities: projectedMonthly,
      growthPotential: predictedGrowth,
      nextMilestone: projectedMonthly > 100 ? 'Expert Level' : 'Advanced Level',
      encouragement: consistency > 70 ? 'Amazing consistency! Keep going!' : 'Small steps daily lead to big results!'
    });
  };

  const handleGameScore = (points) => {
    setGameXP(prev => prev + points);
    addXP?.(points);
    toast.success(`+${points} XP from Spiritual Compass!`);
  };

  const handleExport = () => {
    const data = {
      activities,
      reflections,
      spiritualGrowth,
      streakData,
      achievements,
      gameXP,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiritual-journey-${userId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Your spiritual journey exported!');
  };

  const handleShare = async () => {
    const shareText = `My spiritual journey on Echoes of Jannah: ${reflections.length} reflections, ${streakData.current} day streak! +${gameXP} game XP! 🕌✨`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Spiritual Journey', text: shareText });
      } catch (error) { console.log('Error sharing:', error); }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
  };

  const emotionColors = {
    grateful: '#10B981',
    hopeful: '#00F2FE',
    joyful: '#F472B6',
    sad: '#3B82F6',
    anxious: '#8B5CF6',
    stressed: '#EF4444',
    lonely: '#6366F1',
    lost: '#14B8A6',
    guilty: '#F59E0B',
    confused: '#06B6D4'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-aurora border-t-transparent mx-auto mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-400"
          >
            Loading your spiritual journey...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="glass-card p-8 text-center">
          <FiAlertCircle className="text-red-400 text-5xl mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Unable to Load Analytics</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="px-6 py-2 bg-gradient-to-r from-aurora to-divine rounded-lg hover:opacity-90 transition flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-deeper-blue to-dark-bg pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-6">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full mb-4 border border-white/10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiBarChart2 className="text-aurora" />
            </motion.div>
            <span className="text-sm text-gray-300">Deep Spiritual Insights</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-aurora via-divine to-aurora bg-clip-text text-transparent mb-4 animate-gradient">
            Spiritual Analytics
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Visualize your spiritual growth and discover patterns in your journey</p>
        </motion.div>

        {/* Time Range Selector & Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-between items-center gap-4"
        >
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((range, idx) => (
              <motion.button
                key={range}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2 rounded-full capitalize transition-all duration-300 font-medium ${
                  timeRange === range 
                    ? 'bg-gradient-to-r from-aurora to-divine text-white shadow-lg shadow-aurora/20' 
                    : 'glass-card hover:bg-white/10 text-gray-300'
                }`}
              >
                {range}
              </motion.button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-full glass-card hover:bg-white/10 text-gray-300"
              title={viewMode === 'grid' ? 'List View' : 'Grid View'}
            >
              {viewMode === 'grid' ? <FiList /> : <FiGrid />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="p-2 rounded-full glass-card hover:bg-white/10 text-gray-300"
              title="Export Data"
            >
              <FiDownload />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2 rounded-full glass-card hover:bg-white/10 text-gray-300"
              title="Share Progress"
            >
              <FiShare2 />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FiActivity, label: 'Total Activities', value: activities.length, color: 'aurora', gradient: 'from-cyan-500 to-blue-500', bgGradient: 'from-cyan-500/20 to-blue-500/20' },
            { icon: FiHeart, label: 'Reflections', value: reflections.length, color: 'pink', gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-500/20 to-rose-500/20' },
            { icon: FiSmile, label: 'Emotions Felt', value: Object.keys(emotionDistribution).length, color: 'yellow', gradient: 'from-yellow-500 to-orange-500', bgGradient: 'from-yellow-500/20 to-orange-500/20' },
            { icon: FiAward, label: 'Verses Completed', value: activities.filter(a => a.activityType === 'verse_completed').length, color: 'emerald', gradient: 'from-emerald-500 to-green-500', bgGradient: 'from-emerald-500/20 to-green-500/20' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`glass-card p-5 text-center bg-gradient-to-br ${stat.bgGradient} border border-white/10 backdrop-blur-xl`}
            >
              <stat.icon className={`text-${stat.color}-400 text-3xl mx-auto mb-3`} />
              <motion.div 
                className="text-3xl font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.3, type: "spring", stiffness: 200 }}
              >
                {stat.value}
              </motion.div>
              <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Streak Card with Progress Ring */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 bg-gradient-to-r from-aurora/10 to-divine/10 border border-white/10"
        >
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <motion.div 
                  className="text-6xl"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                >
                  🔥
                </motion.div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-aurora rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Current Streak</h3>
                <p className="text-4xl font-bold text-white mt-1">{streakData.current} <span className="text-lg text-gray-400">days</span></p>
                <p className="text-sm text-gray-500 mt-1">Longest: {streakData.longest} days</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Consistency Rate</span>
                <span>{Math.round(streakData.percentage)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-aurora to-divine rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${streakData.percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {streakData.percentage > 70 ? '🌟 Amazing dedication!' : '💪 Keep the momentum going!'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Weekly Activity Chart */}
        {weeklyActivity.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent flex items-center gap-2">
                <FiCalendar className="text-aurora" /> Weekly Activity & XP
              </h3>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">Verses</span>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Reflections</span>
                <span className="text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-400">XP Earned</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" />
                  <YAxis yAxisId="right" orientation="right" stroke="#F472B6" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 27, 58, 0.95)', 
                      border: '1px solid #00F2FE', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="verses" fill="#00F2FE" radius={[4, 4, 0, 0]} name="📖 Verses Read" />
                  <Bar yAxisId="left" dataKey="reflections" fill="#FFD700" radius={[4, 4, 0, 0]} name="💭 Reflections" />
                  <Line yAxisId="right" type="monotone" dataKey="xp" stroke="#F472B6" strokeWidth={2} name="⭐ XP Earned" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Two Column Layout - Spiritual Radar + Game */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Spiritual Radar */}
          {spiritualGrowth.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6 border border-white/10"
            >
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <FiTarget className="text-emerald-400" /> Spiritual Growth Compass
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={spiritualGrowth}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#666' }} />
                    <Radar 
                      name="Your Progress" 
                      dataKey="value" 
                      stroke="#00F2FE" 
                      fill="#00F2FE" 
                      fillOpacity={0.3}
                      animationBegin={0}
                      animationDuration={1500}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(26, 27, 58, 0.95)', 
                        border: '1px solid #00F2FE',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Spiritual Compass Game */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6 border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                <FiCompassIcon className="text-purple-400" /> Spiritual Compass Game
              </h3>
              {gameXP > 0 && (
                <div className="flex items-center gap-1 text-xs bg-aurora/20 px-2 py-1 rounded-full">
                  <FiZap className="text-aurora" size={12} />
                  <span className="text-aurora font-bold">+{gameXP} XP</span>
                </div>
              )}
            </div>
            <SpiritualCompassGame onScoreUpdate={handleGameScore} spiritualGrowth={spiritualGrowth} />
          </motion.div>
        </div>

        {/* Emotion Distribution - Full Width */}
        {emotionDistribution.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <FiPieChart className="text-pink-400" /> Emotional Landscape
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#666', strokeWidth: 1 }}
                  >
                    {emotionDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={emotionColors[entry.name.toLowerCase()] || '#00F2FE'}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 27, 58, 0.95)', 
                      border: '1px solid #00F2FE',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Monthly Trend with Predictions */}
        {monthlyTrend.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass-card p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-divine" /> Growth Trajectory
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00F2FE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#666" angle={-45} textAnchor="end" height={60} fontSize={10} />
                  <YAxis stroke="#666" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 27, 58, 0.95)', 
                      border: '1px solid #00F2FE',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="#00F2FE" 
                    fill="url(#colorActivities)" 
                    fillOpacity={0.3}
                    animationDuration={1500}
                    name="Daily Activities"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Predictions Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mt-6 p-5 bg-gradient-to-r from-aurora/5 to-divine/5 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <FiZap className="text-aurora" />
                <p className="text-aurora font-semibold">AI-Powered Prediction</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Projected Monthly</p>
                  <p className="text-2xl font-bold text-white">{predictions.projectedActivities || 0} <span className="text-sm text-gray-400">activities</span></p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Growth Potential</p>
                  <p className="text-2xl font-bold text-divine">{predictions.growthPotential || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Next Milestone</p>
                  <p className="text-lg font-semibold text-aurora">{predictions.nextMilestone || 'Beginner Level'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3 italic">✨ {predictions.encouragement || 'Every step brings you closer to your goal!'}</p>
            </motion.div>
          </motion.div>
        )}

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="glass-card p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <FiAward className="text-yellow-400" /> Achievements Unlocked
          </h3>
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-1'} gap-4`}>
            {achievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl text-center transition-all cursor-pointer ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-aurora/20 to-divine/20 border border-aurora/30 shadow-lg shadow-aurora/10' 
                    : 'bg-white/5 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="text-sm font-semibold text-white">{achievement.name}</p>
                <p className="text-xs text-gray-400 mt-1">{achievement.current}/{achievement.requirement}</p>
                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-xs text-aurora mt-2 font-medium"
                  >
                    +{achievement.xp} XP
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full glass-card p-5 text-left flex justify-between items-center border border-white/10 hover:border-aurora/30 transition-all duration-300"
          >
            <span className="text-xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent flex items-center gap-2">
              ✨ Spiritual Insights
            </span>
            <motion.div animate={{ rotate: showInsights ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <FiChevronLeft className="transform text-gray-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-6 mt-2 bg-gradient-to-r from-aurora/5 to-divine/5 border border-white/10 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <FiHeart className="text-aurora mb-2 text-xl" />
                    <p className="text-gray-300 text-sm">
                      You've shared <span className="text-aurora font-bold text-lg">{reflections.length}</span> reflections, 
                      touching hearts and inspiring <span className="text-divine font-bold">{Math.floor(reflections.length * 2.5)}</span> fellow seekers!
                    </p>
                  </motion.div>
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <FiStar className="text-divine mb-2 text-xl" />
                    <p className="text-gray-300 text-sm">
                      Best day: <span className="text-divine font-bold">
                        {weeklyActivity.length > 0 && weeklyActivity.reduce((max, day) => day.verses > max.verses ? day : max, weeklyActivity[0])?.day}
                      </span> - You were on fire! 🔥
                    </p>
                  </motion.div>
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <FiCompass className="text-emerald-400 mb-2 text-xl" />
                    <p className="text-gray-300 text-sm">
                      Your spiritual compass shows <span className="text-emerald-400 font-bold">{spiritualGrowth[0]?.value || 0}%</span> alignment with Quranic teachings.
                      Keep going! 🕌
                    </p>
                  </motion.div>
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <FiBattery className="text-purple-400 mb-2 text-xl" />
                    <p className="text-gray-300 text-sm">
                      Spiritual energy: <span className="text-purple-400 font-bold">{Math.min(100, Math.floor(reflections.length * 10))}%</span> charged.
                      You're on a blessed path! ✨
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}