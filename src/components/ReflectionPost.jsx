import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiMic, FiLoader, FiHeart, FiBookmark, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { userApi, quranApi } from '../api/quranApi';
import { useUser } from '../contexts/UserContext';
import API_CONFIG from '../api/config';

export default function ReflectionPost({ onSuccess, compact = false }) {
  const { userId, addXP, addReflection } = useUser();
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [quranResponse, setQuranResponse] = useState(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice input not supported'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast('🎤 Listening...', { icon: '🎙️' });
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setContent(transcript);
      setIsListening(false);
      toast.success('Voice captured!');
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed');
    };
    recognition.start();
  };

  const getQuranResponse = async (selectedEmotion) => {
    const emotionData = API_CONFIG.EMOTIONS.find(e => e.id === selectedEmotion);
    if (emotionData) {
      const verse = await quranApi.getVerse(emotionData.surah, emotionData.verse);
      return { ...emotionData, verseText: verse?.verse?.text || emotionData.text, arabic: verse?.verse?.arabic || '' };
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('Please share your reflection'); return; }
    if (!emotion) { toast.error('Please select how you feel'); return; }
    
    setLoading(true);
    const quranMatch = await getQuranResponse(emotion);
    setQuranResponse(quranMatch);
    
    const reflection = {
      content,
      emotion,
      verseId: quranMatch ? `${quranMatch.surah}:${quranMatch.verse}` : null,
      createdAt: new Date().toISOString()
    };
    
    await userApi.postReflection(userId, reflection);
    addReflection(reflection);
    addXP(15);
    await userApi.updateActivity(userId, 'reflection_added');
    
    toast.success('✨ Your reflection has been saved and connected to the Quran! +15 XP');
    if (onSuccess) onSuccess(reflection, quranMatch);
    setContent('');
    setEmotion('');
    setLoading(false);
  };

  if (compact) {
    return (
      <div className="glass-card p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a quick reflection..."
            className="flex-1 bg-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-aurora transition"
          />
          <button onClick={handleSubmit} disabled={loading} className="btn-primary px-4">
            {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your heart today? Share your thoughts, struggles, or gratitude..."
          className="w-full h-40 bg-white/5 rounded-xl p-4 text-white placeholder-gray-500 border border-white/10 focus:border-aurora focus:ring-1 focus:ring-aurora transition resize-none"
        />
        <button
          onClick={handleVoiceInput}
          className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 ${
            isListening ? 'bg-red-500 animate-pulse shadow-lg' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <FiMic className={isListening ? 'text-white' : 'text-aurora'} size={20} />
        </button>
      </div>
      
      <div>
        <label className="text-sm text-gray-400 block mb-2">How are you feeling?</label>
        <div className="flex flex-wrap gap-2">
          {API_CONFIG.EMOTIONS.map(e => (
            <button
              key={e.id}
              onClick={() => setEmotion(e.id)}
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                emotion === e.id
                  ? 'bg-gradient-to-r from-aurora to-divine text-cosmic font-bold shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <span>{e.icon}</span>
              <span>{e.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <><FiLoader className="animate-spin" /><span>Connecting to Quran...</span></> : <><FiSend /><span>Receive Quranic Reflection</span></>}
      </motion.button>
      
      {quranResponse && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 bg-gradient-to-r from-aurora/10 to-divine/10 rounded-xl border border-aurora/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <FiHeart className="text-aurora" />
            <p className="text-aurora text-sm font-semibold">Allah says in response:</p>
          </div>
          <p className="font-arabic text-2xl text-right mb-3 leading-loose">{quranResponse.arabic || '...'}</p>
          <p className="text-gray-300 italic">Surah {quranResponse.surahName}, Verse {quranResponse.verse}</p>
          <p className="text-gray-400 mt-3">"{quranResponse.verseText}"</p>
          
          <div className="flex gap-3 mt-4">
            <button className="flex-1 py-2 glass-card hover:bg-white/10 transition text-sm flex items-center justify-center gap-2">
              <FiBookmark size={14} /> Bookmark
            </button>
            <button className="flex-1 py-2 glass-card hover:bg-white/10 transition text-sm flex items-center justify-center gap-2">
              <FiShare2 size={14} /> Share
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}