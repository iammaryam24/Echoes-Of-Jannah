import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiX, FiChevronDown, FiChevronUp, FiHeart, FiStar, 
  FiBookmark, FiCalendar, FiClock, FiMapPin, FiShare2, FiEdit2, 
  FiTrash2, FiChevronLeft, FiChevronRight, FiSearch, FiFilter,
  FiMoon, FiSun, FiCloud, FiWind, FiDroplet, FiZap
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { quranApi } from '../api/quranApi';

// API_CONFIG for emotions - NO DUPLICATES
const API_CONFIG = {
  EMOTIONS: [
    { id: 'grateful', name: 'Grateful', icon: '🙏', color: 'text-emerald-500', surah: 14, verse: 7, text: 'If you are grateful, I will surely increase you' },
    { id: 'joyful', name: 'Joyful', icon: '😊', color: 'text-pink-500', surah: 10, verse: 58, text: 'In the bounty of Allah and His mercy, let them rejoice' },
    { id: 'peaceful', name: 'Peaceful', icon: '🕊️', color: 'text-teal-500', surah: 13, verse: 28, text: 'In the remembrance of Allah do hearts find rest' },
    { id: 'sad', name: 'Sad', icon: '😢', color: 'text-blue-500', surah: 12, verse: 86, text: 'I only complain of my grief and sorrow to Allah' },
    { id: 'anxious', name: 'Anxious', icon: '😰', color: 'text-yellow-500', surah: 9, verse: 40, text: 'Do not grieve; indeed Allah is with us' },
    { id: 'hopeful', name: 'Hopeful', icon: '🌅', color: 'text-orange-500', surah: 39, verse: 53, text: 'Do not despair of Allah\'s mercy' },
    { id: 'blessed', name: 'Blessed', icon: '🌟', color: 'text-amber-500', surah: 14, verse: 34, text: 'If you count the blessings of Allah, you cannot enumerate them' },
    { id: 'confident', name: 'Confident', icon: '💪', color: 'text-blue-500', surah: 3, verse: 160, text: 'If Allah helps you, none can overcome you' },
    { id: 'inspired', name: 'Inspired', icon: '✨', color: 'text-purple-500', surah: 96, verse: 1, text: 'Read! In the name of your Lord' },
    { id: 'loved', name: 'Loved', icon: '💝', color: 'text-red-500', surah: 3, verse: 31, text: 'Allah loves those who follow the Prophet' },
    { id: 'compassionate', name: 'Compassionate', icon: '🤗', color: 'text-rose-500', surah: 90, verse: 14, text: 'Or feeding on a day of severe hunger' },
  ]
};

// Islamic Calendar Events Data (Hijri Dates)
const ISLAMIC_EVENTS_2025 = {
  1: { // Muharram
    1: { name: "Islamic New Year", type: "holiday", icon: "🌙" },
    10: { name: "Day of Ashura", type: "important", icon: "🕋" }
  },
  3: { // Rabi' al-awwal
    12: { name: "Mawlid al-Nabi (Prophet's Birthday)", type: "holiday", icon: "🕌" }
  },
  7: { // Rajab
    27: { name: "Al-Isra' wal-Mi'raj", type: "important", icon: "✨" }
  },
  8: { // Sha'ban
    15: { name: "Nisf Sha'ban", type: "important", icon: "🌙" }
  },
  9: { // Ramadan
    1: { name: "First Day of Ramadan", type: "ramadan", icon: "🌙" },
    27: { name: "Laylat al-Qadr", type: "important", icon: "⭐" }
  },
  10: { // Shawwal
    1: { name: "Eid al-Fitr", type: "eid", icon: "🎉" }
  },
  12: { // Dhul-Hijjah
    9: { name: "Day of Arafah", type: "important", icon: "🕋" },
    10: { name: "Eid al-Adha", type: "eid", icon: "🐏" }
  }
};

// Helper functions
const getIslamicEvent = (month, day) => {
  return ISLAMIC_EVENTS_2025[month]?.[day] || null;
};

const getArabicMonthName = (monthIndex) => {
  const arabicMonths = [
    "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
    "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"
  ];
  return arabicMonths[monthIndex];
};

const getEmotionIcon = (emotionId) => {
  const emotion = API_CONFIG.EMOTIONS.find(e => e.id === emotionId);
  return emotion?.icon || '💫';
};

const getEmotionColor = (emotionId) => {
  const emotion = API_CONFIG.EMOTIONS.find(e => e.id === emotionId);
  return emotion?.color || 'text-gray-400';
};

const getEmotionName = (emotionId) => {
  const emotion = API_CONFIG.EMOTIONS.find(e => e.id === emotionId);
  return emotion?.name || emotionId;
};

const getEventTypeColor = (type) => {
  switch(type) {
    case 'eid': return 'from-emerald-500 to-green-500';
    case 'ramadan': return 'from-purple-500 to-indigo-500';
    case 'important': return 'from-amber-500 to-orange-500';
    case 'holiday': return 'from-blue-500 to-cyan-500';
    default: return 'from-aurora to-divine';
  }
};

export default function LifeTimeline() {
  const { userId, addXP, updateActivity } = useUser();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', emotion: '', date: '', description: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Load events from localStorage
  useEffect(() => {
    loadEvents();
  }, [userId]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      generateCalendarDays(currentDate);
    }
  }, [currentDate, viewMode, events]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const savedEvents = localStorage.getItem(`timeline_events_${userId}`);
      const parsedEvents = savedEvents ? JSON.parse(savedEvents) : [];
      const sorted = parsedEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEvents(sorted);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const saveEvents = (updatedEvents) => {
    localStorage.setItem(`timeline_events_${userId}`, JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  // Filtered events
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      const searchLower = searchQuery.toLowerCase().trim();
      
      if (!searchLower && !filterEmotion) return true;
      
      const matchesSearch = !searchLower || 
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower)) ||
        (event.location && event.location.toLowerCase().includes(searchLower)) ||
        (event.emotion && getEmotionName(event.emotion).toLowerCase().includes(searchLower)) ||
        (event.date && event.date.includes(searchLower));
      
      const matchesEmotion = !filterEmotion || event.emotion === filterEmotion;
      
      return matchesSearch && matchesEmotion;
    });
  }, [events, searchQuery, filterEmotion]);

  const clearSearch = () => {
    setSearchQuery('');
    setFilterEmotion('');
    setShowSearchResults(false);
    toast.success('Search cleared');
  };

  const getSearchResultText = () => {
    if (!searchQuery && !filterEmotion) return '';
    return `Found ${filteredEvents.length} result${filteredEvents.length !== 1 ? 's' : ''}`;
  };

  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const daysArray = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDateObj = new Date(year, month, i);
      const hasEvent = events.some(event => event.date === currentDateObj.toISOString().split('T')[0] || 
        new Date(event.createdAt).toDateString() === currentDateObj.toDateString());
      const islamicMonth = (month + 1);
      const islamicEvent = getIslamicEvent(islamicMonth, i);
      daysArray.push({ 
        day: i, 
        hasEvent, 
        islamicEvent,
        fullDate: currentDateObj,
        isToday: currentDateObj.toDateString() === new Date().toDateString()
      });
    }
    setCalendarDays(daysArray);
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    setSelectedDate(null);
  };

  const getQuranVerseForEmotion = async (emotionId) => {
    const emotion = API_CONFIG.EMOTIONS.find(e => e.id === emotionId);
    if (emotion) {
      try {
        const verse = await quranApi.getVerse(emotion.surah, emotion.verse);
        return { 
          ...emotion, 
          verseText: verse?.data?.text || emotion.text, 
          arabic: verse?.data?.arabic || '',
          surahName: `Surah ${emotion.surah}`,
          verse: emotion.verse
        };
      } catch (error) {
        return { ...emotion, verseText: emotion.text, arabic: '', surahName: `Surah ${emotion.surah}`, verse: emotion.verse };
      }
    }
    return null;
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.emotion) {
      toast.error('Please fill in title and emotion');
      return;
    }
    
    const quranMatch = await getQuranVerseForEmotion(newEvent.emotion);
    const eventWithQuran = {
      ...newEvent,
      id: Date.now(),
      quranMatch,
      date: newEvent.date || new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    const updatedEvents = [eventWithQuran, ...events];
    saveEvents(updatedEvents);
    setShowAddEvent(false);
    setNewEvent({ title: '', emotion: '', date: '', description: '', location: '' });
    addXP(10);
    if (updateActivity) updateActivity(userId, 'event_added');
    
    toast.success(`✨ "${newEvent.title}" added to your timeline! +10 XP`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      saveEvents(updatedEvents);
      toast.success('Memory removed from timeline');
    }
  };

  const handleBookmark = async (event, e) => {
    e.stopPropagation();
    if (event.quranMatch) {
      toast.success(`📖 Verse from "${event.title}" saved to bookmarks! +5 XP`);
      addXP(5);
    }
  };

  const handleShare = async (event, e) => {
    e.stopPropagation();
    const shareText = `📜 ${event.title}\n💭 ${event.description || 'A sacred moment in my journey'}\n\nReflecting with Echoes of Jannah`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Spiritual Journey', text: shareText });
      } catch (error) { console.log('Error sharing:', error); }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
  };

  // Group events by month for timeline view
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = new Date(event.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(event);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-aurora border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your sacred timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 relative min-h-screen">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-4">
          <FiStar className="text-aurora animate-pulse" />
          <span className="text-sm">{filteredEvents.length} Sacred Moments</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent mb-3">
          Your Sacred Timeline
        </h2>
        <p className="text-gray-300 text-md max-w-2xl mx-auto">
          Every moment of your life has an echo in the Quran. Record your journey and see how Allah speaks to your heart.
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-aurora transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by title, description, location, emotion, or date..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-10 pr-10 py-3 bg-white/10 rounded-xl text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-aurora transition-all duration-200
                     border border-white/10 focus:border-aurora"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
        
        <select
          value={filterEmotion}
          onChange={(e) => {
            setFilterEmotion(e.target.value);
            setShowSearchResults(true);
          }}
          className="px-4 py-3 bg-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-aurora transition-all duration-200 cursor-pointer hover:bg-white/15"
        >
          <option value="">All Emotions</option>
          {API_CONFIG.EMOTIONS.map(e => (
            <option key={e.id} value={e.id}>{e.icon} {e.name}</option>
          ))}
        </select>

        {(searchQuery || filterEmotion) && (
          <button
            onClick={clearSearch}
            className="px-4 py-3 bg-aurora/20 hover:bg-aurora/30 text-aurora rounded-xl transition-all duration-200 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {(searchQuery || filterEmotion) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-gradient-to-r from-aurora/10 to-divine/10 rounded-xl border border-aurora/20"
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-aurora font-semibold">🔍 Search Results:</span>
              <span className="text-gray-300 ml-2">{getSearchResultText()}</span>
              {searchQuery && (
                <span className="text-gray-400 text-sm ml-2">
                  for "{searchQuery}"
                </span>
              )}
              {filterEmotion && (
                <span className="text-gray-400 text-sm ml-2">
                  {searchQuery ? 'with' : 'filtered by'} emotion: {getEmotionName(filterEmotion)}
                </span>
              )}
            </div>
            <button
              onClick={clearSearch}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear search
            </button>
          </div>
        </motion.div>
      )}

      {/* View Mode Selector */}
      <div className="flex justify-center gap-3 mb-8">
        {[
          { id: 'timeline', label: 'Timeline', icon: FiClock },
          { id: 'calendar', label: 'Calendar', icon: FiCalendar },
          { id: 'map', label: 'Map View', icon: FiMapPin }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={`px-5 py-2 rounded-full capitalize transition-all duration-300 flex items-center gap-2 ${
              viewMode === mode.id 
                ? 'bg-gradient-to-r from-aurora to-divine text-white font-bold shadow-lg' 
                : 'glass-card hover:bg-white/10'
            }`}
          >
            <mode.icon size={16} />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-aurora via-divine to-aurora hidden md:block"></div>
          
          <AnimatePresence mode="wait">
            {filteredEvents.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <div className="text-8xl mb-6 animate-float">
                  {(searchQuery || filterEmotion) ? '🔍' : '📜'}
                </div>
                <h3 className="text-2xl font-bold text-gray-400 mb-2">
                  {(searchQuery || filterEmotion) ? 'No matching memories found' : 'No memories yet'}
                </h3>
                <p className="text-gray-500">
                  {(searchQuery || filterEmotion) 
                    ? 'Try adjusting your search or filters' 
                    : 'Click the + button to add your first life chapter'}
                </p>
                {(searchQuery || filterEmotion) && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-6 py-2 bg-aurora/20 hover:bg-aurora/30 text-aurora rounded-xl transition-all duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </motion.div>
            ) : (
              Object.entries(groupedEvents).map(([monthYear, monthEvents], monthIdx) => (
                <div key={monthIdx} className="mb-8">
                  <div className="sticky top-24 z-10 mb-4">
                    <div className="glass-card px-4 py-2 inline-block rounded-full">
                      <h3 className="text-aurora font-semibold">{monthYear}</h3>
                    </div>
                  </div>
                  {monthEvents.map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative pl-12 md:pl-20 mb-5"
                    >
                      <div className="absolute left-0 top-5 w-8 h-8 rounded-full bg-gradient-to-r from-aurora to-divine flex items-center justify-center shadow-lg z-10">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      
                      <div
                        className="glass-card glass-card-hover cursor-pointer overflow-hidden transition-all duration-300"
                        onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`text-4xl ${getEmotionColor(event.emotion)}`}>
                              {getEmotionIcon(event.emotion)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <FiCalendar className="text-gray-400 text-xs" />
                                  <span className="text-xs text-gray-400">{event.date}</span>
                                </div>
                                <span className="text-xs text-aurora">•</span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs ${getEmotionColor(event.emotion)} capitalize`}>
                                    {getEmotionName(event.emotion)}
                                  </span>
                                </div>
                              </div>
                              {event.description && (
                                <p className="text-gray-400 text-sm mt-2">
                                  {event.description.length > 100 && selectedEvent !== event.id
                                    ? `${event.description.substring(0, 100)}...`
                                    : event.description}
                                </p>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-1 mt-2">
                                  <FiMapPin className="text-gray-500 text-xs" />
                                  <p className="text-gray-500 text-xs">{event.location}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={(e) => handleBookmark(event, e)} className="p-2 text-gray-400 hover:text-divine transition rounded-lg" title="Bookmark">
                                <FiBookmark size={16} />
                              </button>
                              <button onClick={(e) => handleShare(event, e)} className="p-2 text-gray-400 hover:text-aurora transition rounded-lg" title="Share">
                                <FiShare2 size={16} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg" title="Delete">
                                <FiTrash2 size={16} />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-white transition rounded-lg">
                                {selectedEvent === event.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {selectedEvent === event.id && event.quranMatch && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pt-4 border-t border-aurora/20"
                              >
                                <div className="bg-gradient-to-r from-aurora/10 to-divine/10 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FiHeart className="text-aurora" />
                                    <p className="text-aurora font-semibold text-sm">Allah speaks to this moment:</p>
                                  </div>
                                  <p className="font-arabic text-lg text-right mb-2 leading-loose">{event.quranMatch.arabic || '...'}</p>
                                  <p className="text-gray-300 text-sm italic">{event.quranMatch.surahName}, Verse {event.quranMatch.verse}</p>
                                  <p className="text-gray-400 text-sm mt-2">"{event.quranMatch.verseText || event.quranMatch.text}"</p>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.success(`🌙 Reflecting on "${event.title}". May Allah bless your journey!`);
                                    }}
                                    className="w-full mt-4 bg-gradient-to-r from-aurora to-divine text-white font-bold py-2 rounded-xl transition-all hover:shadow-lg text-sm"
                                  >
                                    📿 Reflect & Strengthen Connection
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10 transition">
              <FiChevronLeft size={24} />
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {getArabicMonthName(currentDate.getMonth())} {currentDate.getFullYear()} AH
              </p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10 transition">
              <FiChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-aurora font-semibold py-2 text-sm">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => day && setSelectedDate(day)}
                className={`min-h-[90px] glass-card p-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                  day?.hasEvent ? 'border-aurora/50 shadow-lg shadow-aurora/10' : ''
                } ${day?.isToday ? 'ring-2 ring-aurora' : ''}`}
              >
                {day && (
                  <div className="flex flex-col items-center h-full">
                    <span className={`text-sm font-medium ${day.hasEvent ? 'text-aurora' : 'text-gray-300'}`}>
                      {day.day}
                    </span>
                    
                    {day.islamicEvent && (
                      <div className="mt-1 flex flex-col items-center">
                        <div 
                          className={`w-6 h-6 rounded-full bg-gradient-to-r ${getEventTypeColor(day.islamicEvent.type)} flex items-center justify-center text-xs shadow-md`}
                          title={day.islamicEvent.name}
                        >
                          <span className="text-[10px]">{day.islamicEvent.icon}</span>
                        </div>
                      </div>
                    )}
                    
                    {day.hasEvent && !day.islamicEvent && (
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-aurora"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-aurora"></div>
              <span className="text-xs text-gray-400">Your Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span className="text-xs text-gray-400">Eid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
              <span className="text-xs text-gray-400">Ramadan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <span className="text-xs text-gray-400">Important</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <span className="text-xs text-gray-400">Holiday</span>
            </div>
          </div>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6 p-4 bg-gradient-to-r from-aurora/10 to-divine/10 rounded-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">
                      {selectedDate.fullDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h4>
                    {selectedDate.islamicEvent && (
                      <p className="text-aurora text-sm mt-1">
                        {selectedDate.islamicEvent.icon} {selectedDate.islamicEvent.name}
                      </p>
                    )}
                    {selectedDate.hasEvent && (
                      <p className="text-gray-400 text-sm mt-1">✨ You have a memory recorded on this day</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNewEvent({ ...newEvent, date: selectedDate.fullDate.toISOString().split('T')[0] });
                      setShowAddEvent(true);
                      setSelectedDate(null);
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-aurora to-divine text-white rounded-lg text-sm font-semibold"
                  >
                    Add Memory
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Map View Placeholder */}
      {viewMode === 'map' && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4 animate-float">🗺️</div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent mb-2">Interactive Map Coming Soon</h3>
          <p className="text-gray-400">Visualize your spiritual journey across the world with location-based memories.</p>
          <div className="mt-6 flex justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-aurora animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-divine animate-pulse delay-100"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse delay-200"></div>
          </div>
        </div>
      )}

      {/* Add Event FAB */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          onClick={() => setShowAddEvent(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-aurora to-divine text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group shadow-lg shadow-aurora/30"
        >
          <FiPlus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowAddEvent(false)}
            />
            
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-20 md:top-24 bottom-20 md:bottom-24 w-full sm:w-[420px] md:w-[480px] bg-gradient-to-br from-gray-900 via-[#0a0a1a] to-gray-900 shadow-2xl z-50 overflow-hidden border-l border-aurora/30 rounded-l-2xl"
            >
              <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="p-6 pb-8">
                  <div className="sticky top-0 bg-[#0a0a1a]/95 backdrop-blur-md -mt-2 -mx-6 px-6 pt-4 pb-4 mb-4 z-10 rounded-t-2xl border-b border-aurora/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-aurora to-divine flex items-center justify-center shadow-lg">
                          <FiPlus className="text-white" size={20} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-aurora to-divine bg-clip-text text-transparent">
                          Record a Life Moment
                        </h3>
                      </div>
                      <button 
                        onClick={() => setShowAddEvent(false)} 
                        className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 ml-12">Every moment has an echo in the Quran</p>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-2">
                        Event Title <span className="text-aurora">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 'My father's advice', 'Graduation Day'"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full bg-white/10 rounded-xl p-3 text-white placeholder-gray-500 
                                 focus:outline-none focus:ring-2 focus:ring-aurora transition-all duration-200
                                 border border-white/10 focus:border-aurora"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-2">
                        How did you feel? <span className="text-aurora">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {API_CONFIG.EMOTIONS.map(e => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => setNewEvent({...newEvent, emotion: e.id})}
                            className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-sm font-medium
                              ${newEvent.emotion === e.id
                                ? 'bg-gradient-to-r from-aurora to-divine text-white font-bold shadow-lg shadow-aurora/20 scale-[1.02]'
                                : 'bg-white/15 hover:bg-white/25 text-white border border-white/10 hover:border-aurora/50'
                              }`}
                          >
                            <span className="text-xl">{e.icon}</span>
                            <span className="font-semibold text-white">{e.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-2">Description</label>
                      <textarea
                        placeholder="Share more about this moment..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        rows="3"
                        className="w-full bg-white/10 rounded-xl p-3 text-white placeholder-gray-500 
                                 focus:outline-none focus:ring-2 focus:ring-aurora transition-all duration-200
                                 border border-white/10 focus:border-aurora resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">Date</label>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                          className="w-full bg-white/10 rounded-xl p-3 text-white 
                                   focus:outline-none focus:ring-2 focus:ring-aurora transition-all duration-200
                                   border border-white/10 focus:border-aurora"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="Where did this happen?"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                          className="w-full bg-white/10 rounded-xl p-3 text-white placeholder-gray-500 
                                   focus:outline-none focus:ring-2 focus:ring-aurora transition-all duration-200
                                   border border-white/10 focus:border-aurora"
                        />
                      </div>
                    </div>

                    <div className="bg-aurora/10 rounded-xl p-3 border border-aurora/20">
                      <div className="flex items-center gap-2">
                        <FiStar className="text-aurora text-sm" />
                        <p className="text-aurora text-xs font-medium">Quran Connection</p>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        Based on your emotion, a Quran verse will be matched to this moment automatically.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddEvent}
                        className="flex-1 bg-gradient-to-r from-aurora to-divine text-white font-bold py-3 rounded-xl 
                                 transition-all duration-200 hover:shadow-lg hover:shadow-aurora/30 text-base"
                      >
                        ✨ Save to Timeline
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddEvent(false)}
                        className="flex-1 bg-white/15 hover:bg-white/25 text-white py-3 rounded-xl 
                                 transition-all duration-200 text-base font-medium border border-white/10"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #f5b042, #9b59b6);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #f5b042cc, #9b59b6cc);
  }
  .font-arabic {
    font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', serif;
  }
`}</style>
    </div>
  );
}