import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const EMOTIONS = [
  { id: 'grateful', name: 'Grateful', icon: '🙏', color: 'text-emerald-500' },
  { id: 'hopeful', name: 'Hopeful', icon: '🌅', color: 'text-aurora' },
  { id: 'joyful', name: 'Joyful', icon: '✨', color: 'text-pink-500' },
  { id: 'sad', name: 'Sad', icon: '💔', color: 'text-blue-400' },
  { id: 'anxious', name: 'Anxious', icon: '🕯️', color: 'text-purple-400' },
  { id: 'stressed', name: 'Stressed', icon: '😰', color: 'text-red-400' },
  { id: 'lonely', name: 'Lonely', icon: '😢', color: 'text-indigo-400' },
  { id: 'lost', name: 'Lost', icon: '🧭', color: 'text-teal-400' },
  { id: 'guilty', name: 'Guilty', icon: '😔', color: 'text-yellow-500' },
  { id: 'confused', name: 'Confused', icon: '🤔', color: 'text-cyan-400' }
];

export default function ReflectionModal({ isOpen, onClose, onSuccess }) {
  const { userId, addXP } = useUser();
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write your reflection');
      return;
    }

    if (!selectedEmotion) {
      toast.error('Please select an emotion');
      return;
    }

    setSubmitting(true);
    try {
      const reflection = {
        id: Date.now(),
        userId,
        content: content.trim(),
        emotion: selectedEmotion,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      };

      // Save to localStorage
      const savedReflections = localStorage.getItem(`reflections_${userId}`);
      const reflections = savedReflections ? JSON.parse(savedReflections) : [];
      reflections.unshift(reflection);
      localStorage.setItem(`reflections_${userId}`, JSON.stringify(reflections));

      addXP(15);
      toast.success('Reflection shared! +15 XP', { icon: '✨' });
      
      // Reset form
      setContent('');
      setSelectedEmotion('');
      
      // Call onSuccess callback
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Failed to save reflection');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#0a0a1a]/95 backdrop-blur-md p-6 border-b border-aurora/20 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Share Your Reflection</h2>
              <p className="text-gray-400 text-sm mt-1">Connect with the community</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Emotion Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                How are you feeling? <span className="text-aurora">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => setSelectedEmotion(emotion.id)}
                    className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${
                      selectedEmotion === emotion.id
                        ? 'bg-gradient-to-r from-aurora to-divine text-white shadow-lg scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{emotion.icon}</span>
                    <span className="text-xs">{emotion.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Reflection <span className="text-aurora">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share what's on your heart, what you've learned, or how Allah has guided you today..."
                rows="5"
                maxLength="500"
                className="w-full bg-white/10 rounded-xl p-4 text-white placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-aurora transition-all
                         border border-white/10 focus:border-aurora resize-none"
              />
              <p className="text-right text-xs text-gray-500 mt-1">
                {content.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting || !content.trim() || !selectedEmotion}
              className="w-full bg-gradient-to-r from-aurora to-divine text-white font-bold py-3 rounded-xl 
                       transition-all duration-200 hover:shadow-lg hover:shadow-aurora/30 disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <FiSend /> Share with Community
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}