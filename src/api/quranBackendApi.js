// src/api/quranBackendApi.js
// API file for backend - Fixed for Vite

// Use import.meta.env instead of process.env for Vite
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

async function callBackend(endpoint) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/quran${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      // If backend is not available, throw error to use fallback
      throw new Error(`Backend not available: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    return data.data;
  } catch (error) {
    console.warn('Backend unavailable, using fallback data:', error.message);
    throw error;
  }
}

// ============ VERSE APIs ============
export async function getVerse(surahNumber, verseNumber) {
  try {
    const result = await callBackend(`/verse/${surahNumber}/${verseNumber}/full`);
    return {
      data: {
        text: result.verse?.text,
        arabic: result.verse?.arabic,
        tafsir: result.tafsir,
        translations: result.translations
      }
    };
  } catch (error) {
    // Return fallback data when backend is unavailable
    return {
      data: {
        text: `Verse ${verseNumber} of Surah ${surahNumber}`,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        tafsir: null,
        translations: []
      }
    };
  }
}

export async function getTafsir(surahNumber, verseNumber) {
  try {
    const result = await callBackend(`/tafsir/${surahNumber}/${verseNumber}`);
    return result;
  } catch (error) {
    return { text: 'Tafsir not available at this time.' };
  }
}

export async function getTranslations(surahNumber, verseNumber) {
  try {
    const result = await callBackend(`/translations/${surahNumber}/${verseNumber}`);
    return result;
  } catch (error) {
    return [];
  }
}

// ============ SURAH APIs ============
export async function getAllSurahs() {
  try {
    const result = await callBackend(`/surahs`);
    return result;
  } catch (error) {
    // Return mock surahs data
    const surahs = [];
    for (let i = 1; i <= 114; i++) {
      surahs.push({
        number: i,
        name: `Surah ${i}`,
        englishName: `Surah ${i}`,
        versesCount: 10,
        revelationType: i <= 86 ? 'Meccan' : 'Medinan'
      });
    }
    return { success: true, data: surahs };
  }
}

export async function getSurah(surahNumber) {
  try {
    const result = await callBackend(`/surah/${surahNumber}`);
    return result;
  } catch (error) {
    return {
      data: {
        number: surahNumber,
        name: `Surah ${surahNumber}`,
        englishName: `Surah ${surahNumber}`,
        versesCount: 10,
        revelationType: surahNumber <= 86 ? 'Meccan' : 'Medinan',
        verses: []
      }
    };
  }
}

// ============ SEARCH APIs ============
export async function searchQuran(query, page = 1, limit = 20) {
  try {
    const result = await callBackend(`/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return result;
  } catch (error) {
    return { results: [], total: 0 };
  }
}

// ============ AUDIO APIs ============
export async function getAudioRecitation(surahNumber, verseNumber, reciter = 'alafasy') {
  try {
    const result = await callBackend(`/audio/${surahNumber}/${verseNumber}?reciter=${reciter}`);
    return result;
  } catch (error) {
    // Return direct CDN URL as fallback
    const surahNum = surahNumber.toString().padStart(3, '0');
    const verseNum = verseNumber.toString().padStart(3, '0');
    return { 
      success: true, 
      audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.${reciter}/${surahNum}${verseNum}.mp3` 
    };
  }
}

// ============ USER APIs (using localStorage as fallback) ============
export async function saveBookmark(userId, verseKey, surahNumber, verseNumber, notes = '') {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]');
    const existingIndex = bookmarks.findIndex(b => b.verseKey === verseKey);
    
    if (existingIndex >= 0) {
      bookmarks[existingIndex] = {
        ...bookmarks[existingIndex],
        notes,
        updatedAt: new Date().toISOString()
      };
    } else {
      bookmarks.push({
        id: Date.now(),
        verseKey,
        surahNumber,
        verseNumber,
        notes,
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarks));
    return { success: true, data: bookmarks };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getBookmarks(userId) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]');
    return { success: true, data: bookmarks };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

export async function removeBookmark(userId, bookmarkId) {
  try {
    let bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]');
    bookmarks = bookmarks.filter(b => b.id !== bookmarkId && b.verseKey !== bookmarkId);
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarks));
    return { success: true, data: bookmarks };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateActivity(userId, activityType, count = 1) {
  try {
    const activities = JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
    activities.push({
      type: activityType,
      count,
      timestamp: new Date().toISOString()
    });
    if (activities.length > 1000) activities.shift();
    localStorage.setItem(`activities_${userId}`, JSON.stringify(activities));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateStreak(userId) {
  try {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem(`lastActive_${userId}`);
    let streak = parseInt(localStorage.getItem(`streak_${userId}`) || '0');
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        streak++;
      } else {
        streak = 1;
      }
      
      localStorage.setItem(`streak_${userId}`, streak.toString());
      localStorage.setItem(`lastActive_${userId}`, today);
    }
    
    return { success: true, data: { streak } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getProfile(userId) {
  try {
    const profile = localStorage.getItem(`profile_${userId}`);
    if (!profile) {
      const newProfile = { xp: 0, level: 1, createdAt: new Date().toISOString() };
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
      return { success: true, data: newProfile };
    }
    return { success: true, data: JSON.parse(profile) };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

export async function addXP(userId, amount) {
  try {
    const profile = await getProfile(userId);
    const newXP = (profile.data?.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const updatedProfile = { xp: newXP, level: newLevel, lastUpdated: new Date().toISOString() };
    localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
    return { success: true, data: updatedProfile };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getReflections(userId) {
  try {
    const reflections = JSON.parse(localStorage.getItem(`reflections_${userId}`) || '[]');
    return { success: true, data: reflections };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

export async function saveReflection(userId, reflection) {
  try {
    const reflections = JSON.parse(localStorage.getItem(`reflections_${userId}`) || '[]');
    const newReflection = {
      id: Date.now(),
      ...reflection,
      createdAt: new Date().toISOString()
    };
    reflections.push(newReflection);
    localStorage.setItem(`reflections_${userId}`, JSON.stringify(reflections));
    return { success: true, data: newReflection };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============ POST REFLECTION (Community) ============
export async function postReflection(userId, reflection) {
  try {
    const reflections = JSON.parse(localStorage.getItem(`community_reflections_${userId}`) || '[]');
    const newReflection = {
      id: Date.now(),
      userId: userId,
      ...reflection,
      likes: 0,
      comments: [],
      createdAt: reflection.createdAt || new Date().toISOString()
    };
    reflections.push(newReflection);
    localStorage.setItem(`community_reflections_${userId}`, JSON.stringify(reflections));
    
    const globalReflections = JSON.parse(localStorage.getItem('community_reflections_all') || '[]');
    globalReflections.push(newReflection);
    localStorage.setItem('community_reflections_all', JSON.stringify(globalReflections));
    
    return newReflection;
  } catch (error) {
    console.error('Error posting reflection:', error);
    return null;
  }
}

export async function getCommunityReflections() {
  try {
    const reflections = JSON.parse(localStorage.getItem('community_reflections_all') || '[]');
    return reflections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting community reflections:', error);
    return [];
  }
}

// ============ SPIRITUAL DNA ============
export async function getSpiritualDNA(userId) {
  const profile = await getProfile(userId);
  const reflections = await getReflections(userId);
  const streak = localStorage.getItem(`streak_${userId}`) || 0;
  
  const emotionCount = {};
  (reflections.data || []).forEach(r => {
    if (r.emotion) {
      emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1;
    }
  });
  
  const sortedEmotions = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);
  const dominantTraits = sortedEmotions.slice(0, 5).map(e => e[0].charAt(0).toUpperCase() + e[0].slice(1));
  
  return {
    dominantTraits: dominantTraits.length ? dominantTraits : ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate', 'Reflective'],
    spiritualStrengths: ['Reflection Depth', 'Consistency', 'Emotional Intelligence', 'Quran Connection', 'Community Engagement'],
    recommendedSurahs: ['Al-Fatiha', 'Ar-Rahman', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'],
    areasForGrowth: ['Patience', 'Gratitude', 'Trust in Allah', 'Forgiveness'],
    spiritualScore: Math.min(100, Math.floor((profile.data?.xp || 0) / 10) + (parseInt(streak) * 2))
  };
}

// ============ EXPORT ALL ============
export default {
  getVerse,
  getTafsir,
  getTranslations,
  getAllSurahs,
  getSurah,
  searchQuran,
  getAudioRecitation,
  saveBookmark,
  getBookmarks,
  removeBookmark,
  updateActivity,
  updateStreak,
  getProfile,
  addXP,
  getReflections,
  saveReflection,
  postReflection,
  getCommunityReflections,
  getSpiritualDNA
};