// src/components/SpiritualDNA.jsx - Complete Working Version
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, FiAward, FiCalendar, FiHeart, FiStar, FiTarget, 
  FiBookmark, FiRefreshCw, FiShield, FiCompass, FiBookOpen,
  FiShare2, FiUsers, FiActivity, FiSun, FiCloud, FiWind, FiMoon,
  FiChevronRight, FiX, FiClock, FiGrid, FiList, FiZap, FiEye,
  FiChevronLeft, FiInfo, FiGift
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { useQuranAuth } from '../contexts/QuranAuthContext';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // On Vercel, use proxy
  : 'http://localhost:3001';

// ============ PROPHET STORIES DATA ============
const PROPHETS = [
  {
    id: 1,
    name: "Prophet Muhammad ﷺ",
    nameAr: "محمد",
    image: "🕌",
    title: "The Seal of Prophets",
    description: "The final messenger who brought the Quran and completed the message of Islam.",
    fullStory: `Prophet Muhammad ﷺ was born in Mecca in 570 CE. He was known as Al-Amin (the trustworthy) even before prophethood. At age 40, he received the first revelation from Angel Jibreel in the cave of Hira. He spent 23 years spreading the message of Islam, facing persecution, migration to Madinah, and finally conquering Mecca peacefully. He taught compassion, justice, and mercy to all mankind.`,
    miracles: ["The Quran - The greatest miracle", "Splitting of the moon", "Night Journey (Isra and Mi'raj)", "Water flowing from his fingers", "Food multiplication"],
    teachings: ["Treat everyone with kindness", "Seek knowledge", "Forgive others", "Be honest", "Show mercy"],
    verses: ["And We have not sent you, [O Muhammad], except as a mercy to the worlds. (21:107)"],
    lessons: ["Patience in adversity", "Forgiveness over revenge", "Mercy to all creation", "Steadfastness in faith"],
    timeline: [
      { year: "570 CE", event: "Born in Mecca" },
      { year: "610 CE", event: "First revelation" },
      { year: "622 CE", event: "Hijrah to Madinah" },
      { year: "630 CE", event: "Conquest of Mecca" },
      { year: "632 CE", event: "Farewell pilgrimage" }
    ],
    color: "from-amber-500 to-orange-500",
    recommendedFor: ["Grateful", "Hopeful", "Peaceful"]
  },
  {
    id: 2,
    name: "Prophet Ibrahim (Abraham)",
    nameAr: "إبراهيم",
    image: "🕋",
    title: "Friend of Allah (Khalilullah)",
    description: "The father of prophets who rebuilt the Kaaba and was tested with great trials.",
    fullStory: `Prophet Ibrahim (AS) was born in Babylon. He questioned idol worship and broke the idols, leading to him being thrown into a fire which Allah made cool for him. He was commanded to leave his wife Hajar and son Isma'il in the desert, where Zamzam miraculously appeared. He was tested with the command to sacrifice his son, which he was about to fulfill when Allah replaced Isma'il with a ram.`,
    miracles: ["Fire became cool", "Zamzam water", "The ram from Paradise", "Reviving dead birds"],
    teachings: ["Absolute submission to Allah", "Trust Allah completely", "Hospitality", "Stand against falsehood"],
    verses: ["And who is better in religion than one who submits himself to Allah... (4:125)"],
    lessons: ["Complete faith", "Sacrifice for Allah", "Standing for truth", "Patience in trials"],
    timeline: [
      { year: "~2000 BCE", event: "Born in Babylon" },
      { year: "~1950 BCE", event: "Thrown into fire" },
      { year: "~1900 BCE", event: "Building of Kaaba" },
      { year: "~1850 BCE", event: "Sacrifice test" }
    ],
    color: "from-emerald-500 to-teal-500",
    recommendedFor: ["Confident", "Trusting", "Faithful"]
  },
  {
    id: 3,
    name: "Prophet Musa (Moses)",
    nameAr: "موسى",
    image: "🌊",
    title: "Kalimullah (One who spoke to Allah)",
    description: "The prophet who confronted Pharaoh and led the Children of Israel to freedom.",
    fullStory: `Prophet Musa (AS) was born in Egypt during Pharaoh's rule. He was saved by being placed in a basket in the Nile and raised in Pharaoh's palace. He fled to Madyan, married, and was chosen by Allah with miracles: staff turning into a serpent, hand shining white, and parting of the Red Sea. He confronted Pharaoh, led the Israelites out of Egypt, and received the Torah on Mount Sinai.`,
    miracles: ["Staff to serpent", "Radiant hand", "Parting Red Sea", "Water from rock", "Manna and Salwa"],
    teachings: ["Justice against oppression", "Patience", "Trust in Allah", "Speak truth to power"],
    verses: ["Indeed, I am Allah. There is no deity except Me... (20:14)"],
    lessons: ["Courage against tyranny", "Leadership with patience", "Repentance", "Trust in divine help"],
    timeline: [
      { year: "~1400 BCE", event: "Born in Egypt" },
      { year: "~1370 BCE", event: "Fled to Madyan" },
      { year: "~1350 BCE", event: "Received prophethood" },
      { year: "~1310 BCE", event: "Exodus from Egypt" }
    ],
    color: "from-blue-500 to-cyan-500",
    recommendedFor: ["Courageous", "Justice-seeking", "Patient"]
  },
  {
    id: 4,
    name: "Prophet Isa (Jesus)",
    nameAr: "عيسى",
    image: "⭐",
    title: "Messiah (Al-Masih)",
    description: "The miracle-working prophet born to Maryam (Mary) without a father.",
    fullStory: `Prophet Isa (AS) was miraculously born to Maryam (AS) without a father. He spoke in the cradle defending his mother. He was given the Injeel and performed many miracles by Allah's permission: healing the blind and lepers, raising the dead, and creating birds from clay. He called people to worship Allah alone and was raised to heaven.`,
    miracles: ["Speaking in cradle", "Healing blind/lepers", "Raising dead", "Creating birds from clay"],
    teachings: ["Worship Allah alone", "Humility", "Love for poor", "Forgiveness"],
    verses: ["Indeed, the example of Jesus in the sight of Allah is like that of Adam... (3:59)"],
    lessons: ["Miracles from Allah", "Humility", "Compassion", "Faith in divine power"],
    timeline: [
      { year: "~4 BCE", event: "Miraculous birth" },
      { year: "~27 CE", event: "Became prophet" },
      { year: "~30 CE", event: "Raised to heaven" },
      { year: "Future", event: "Second coming" }
    ],
    color: "from-purple-500 to-pink-500",
    recommendedFor: ["Compassionate", "Merciful", "Humble"]
  },
  {
    id: 5,
    name: "Prophet Yusuf (Joseph)",
    nameAr: "يوسف",
    image: "🌟",
    title: "The Beautiful Prophet",
    description: "Known for his beauty, patience, and ability to interpret dreams.",
    fullStory: `Prophet Yusuf (AS) was the beloved son of Prophet Yaqub. His jealous brothers threw him into a well. He was sold into slavery in Egypt, falsely accused, and imprisoned. He interpreted the king's dream, was released, and became treasurer of Egypt. He was reunited with his family after decades of separation, showing patience, forgiveness, and divine wisdom.`,
    miracles: ["Dream interpretation", "Forgiveness after betrayal", "Reunion with family"],
    teachings: ["Patience in trials", "Forgiveness", "Trust Allah's plan", "Maintain dignity"],
    verses: ["Indeed, my Lord is Subtle in what He wills... (12:100)"],
    lessons: ["Patience brings reward", "Forgiveness heals", "Allah's plan is perfect", "Stay true to faith"],
    timeline: [
      { year: "~1700 BCE", event: "Dream of stars" },
      { year: "~1680 BCE", event: "Thrown into well" },
      { year: "~1650 BCE", event: "Imprisoned" },
      { year: "~1630 BCE", event: "Reunited with family" }
    ],
    color: "from-yellow-500 to-amber-500",
    recommendedFor: ["Patient", "Forgiving", "Hopeful"]
  },
  {
    id: 6,
    name: "Prophet Nuh (Noah)",
    nameAr: "نوح",
    image: "⛵",
    title: "The Patient Preacher",
    description: "Preached for 950 years and built the ark to save believers from the flood.",
    fullStory: `Prophet Nuh (AS) was sent to his people who worshipped idols. He preached for 950 years, but only a few believed. He was commanded to build an ark, and his people mocked him. When the flood came, he took pairs of animals and believers onto the ark. The ark settled on Mount Judi, and Nuh's mission saved humanity from destruction.`,
    miracles: ["Building the ark", "Survival of flood", "950 years preaching", "Animals coming in pairs"],
    teachings: ["Patience in preaching", "Trust Allah's timing", "Never give up"],
    verses: ["And We sent Noah to his people, and he remained among them a thousand years minus fifty... (29:14)"],
    lessons: ["Never give up", "Trust Allah's plan", "Save your family", "Patience is key"],
    timeline: [
      { year: "~2500 BCE", event: "Sent as prophet" },
      { year: "~2000 BCE", event: "Building ark" },
      { year: "~1990 BCE", event: "The great flood" },
      { year: "~1980 BCE", event: "Ark settled" }
    ],
    color: "from-indigo-500 to-purple-500",
    recommendedFor: ["Persistent", "Patient", "Steadfast"]
  },
  {
    id: 7,
    name: "Prophet Yunus (Jonah)",
    nameAr: "يونس",
    image: "🐋",
    title: "Dhun-Nun (Man of the Whale)",
    description: "Swallowed by a whale and saved through repentance and glorifying Allah.",
    fullStory: `Prophet Yunus (AS) was sent to the people of Nineveh. When they rejected his message, he left in anger without Allah's permission. He boarded a ship, and when a storm came, he was thrown overboard and swallowed by a great fish. In the darkness of the fish's belly, he prayed "La ilaha illa Anta, subhanaka inni kuntu minaz-zalimin." Allah accepted his repentance and the fish released him.`,
    miracles: ["Surviving inside the whale", "Repentance accepted", "People of Nineveh believed"],
    teachings: ["Never lose hope", "Repentance is powerful", "Patience with people"],
    verses: ["And [mention] the man of the fish, when he went off in anger... (21:87)"],
    lessons: ["Never despair", "Repent sincerely", "Trust Allah's mercy"],
    timeline: [
      { year: "~800 BCE", event: "Sent to Nineveh" },
      { year: "~790 BCE", event: "Swallowed by whale" },
      { year: "~789 BCE", event: "Repented and released" }
    ],
    color: "from-cyan-500 to-blue-500",
    recommendedFor: ["Repentant", "Hopeful", "Forgiven"]
  },
  {
    id: 8,
    name: "Prophet Ayyub (Job)",
    nameAr: "أيوب",
    image: "🌿",
    title: "The Epitome of Patience",
    description: "Tested with loss of wealth, children, and health, yet remained grateful.",
    fullStory: `Prophet Ayyub (AS) was a wealthy, pious man with many children. Allah tested him by taking away his wealth, causing his children to die, and afflicting him with a severe disease that lasted for years. Throughout all this, he remained patient and grateful. When he finally made dua, Allah cured him, restored his wealth, and blessed him with more children.`,
    miracles: ["Patience during extreme trials", "Restoration of health", "Spring of healing water"],
    teachings: ["Patience in hardship", "Gratitude in all states", "Never complain to anyone but Allah"],
    verses: ["Indeed, We found him patient, an excellent servant... (38:44)"],
    lessons: ["Patience brings reward", "Gratitude despite trials", "Allah tests those He loves"],
    timeline: [
      { year: "~1500 BCE", event: "Blessed with wealth" },
      { year: "~1480 BCE", event: "Severe trials begin" },
      { year: "~1460 BCE", event: "Years of patience" },
      { year: "~1450 BCE", event: "Healed and restored" }
    ],
    color: "from-green-500 to-emerald-500",
    recommendedFor: ["Patient", "Grateful", "Steadfast"]
  },
  {
    id: 9,
    name: "Prophet Sulayman (Solomon)",
    nameAr: "سليمان",
    image: "👑",
    title: "The Wise King",
    description: "Given kingdom, wisdom, control over wind and jinn, and understanding of animal speech.",
    fullStory: `Prophet Sulayman (AS) was the son of Prophet Dawud. Allah granted him a kingdom unlike any other - control over the wind, jinn, and animals, and the ability to understand the speech of birds and ants. Despite his immense power, he remained humble and grateful. He judged wisely between people, understood the ant's warning, and communicated with the Hoopoe bird who brought news of Queen Bilqis.`,
    miracles: ["Control over wind", "Command over jinn", "Understanding animal speech", "The glass floor palace"],
    teachings: ["Gratitude for blessings", "Wisdom in leadership", "Humility despite power"],
    verses: ["This is from the favor of my Lord to test me whether I will be grateful or ungrateful... (27:40)"],
    lessons: ["Power comes from Allah", "Be grateful for blessings", "Use wisdom in judgment"],
    timeline: [
      { year: "~1000 BCE", event: "Inherited from Dawud" },
      { year: "~980 BCE", event: "Queen of Sheba accepts Islam" },
      { year: "~960 BCE", event: "Completion of Temple" },
      { year: "~940 BCE", event: "Passed away standing" }
    ],
    color: "from-amber-500 to-yellow-500",
    recommendedFor: ["Wise", "Grateful", "Leader"]
  },
  {
    id: 10,
    name: "Prophet Adam",
    nameAr: "آدم",
    image: "🌍",
    title: "The First Prophet",
    description: "The first human, created from clay, taught all names, and father of mankind.",
    fullStory: `Prophet Adam (AS) was the first human created by Allah from clay. Allah taught him all the names and commanded the angels to prostrate to him. Iblis refused and was cursed. Adam and Hawwa lived in Paradise but were deceived by Shaytan and ate from the forbidden tree. They repented, and Allah forgave them but sent them to Earth as His vicegerents. Adam was the first prophet, teaching his children about Allah.`,
    miracles: ["Created from clay", "Taught all names", "Angels prostrated to him"],
    teachings: ["Repentance is accepted", "Shaytan is our enemy", "Earth is our temporary home"],
    verses: ["And He taught Adam the names - all of them... (2:31)"],
    lessons: ["Repent sincerely", "Beware of Shaytan", "Allah forgives those who repent"],
    timeline: [
      { year: "Beginning", event: "Created from clay" },
      { year: "Paradise", event: "Lived with Hawwa" },
      { year: "Earth", event: "Sent as vicegerent" }
    ],
    color: "from-stone-500 to-neutral-500",
    recommendedFor: ["Repentant", "Humble", "Forgiven"]
  }
];

// ============ TRAITS DATA ============
const ALL_TRAITS = [
  { name: 'Grateful', color: '#10B981', icon: '🙏', description: 'Thankful and appreciative of blessings' },
  { name: 'Peaceful', color: '#00F2FE', icon: '🕊️', description: 'Inner calm and serenity' },
  { name: 'Hopeful', color: '#FFD700', icon: '🌅', description: 'Optimistic about the future' },
  { name: 'Compassionate', color: '#EC4899', icon: '🤗', description: 'Caring and empathetic towards others' },
  { name: 'Reflective', color: '#8B5CF6', icon: '💭', description: 'Deep thinker and contemplative' },
  { name: 'Joyful', color: '#F59E0B', icon: '😊', description: 'Full of happiness and positivity' },
  { name: 'Confident', color: '#3B82F6', icon: '💪', description: 'Self-assured and trusting in Allah' },
  { name: 'Content', color: '#14B8A6', icon: '😌', description: 'Satisfied with Allah\'s decree' },
  { name: 'Forgiving', color: '#F43F5E', icon: '🤲', description: 'Willing to forgive others' },
  { name: 'Trusting', color: '#06B6D4', icon: '🤝', description: 'Complete reliance on Allah' },
  { name: 'Wise', color: '#D97706', icon: '🦉', description: 'Sound judgment and understanding' },
  { name: 'Patient', color: '#059669', icon: '🌿', description: 'Enduring hardship with grace' },
  { name: 'Devoted', color: '#7C3AED', icon: '🕌', description: 'Dedicated to worship and faith' },
  { name: 'Humble', color: '#6B7280', icon: '🌱', description: 'Modest and unassuming' },
  { name: 'Generous', color: '#D4AF37', icon: '🎁', description: 'Giving freely to others' },
  { name: 'Growing', color: '#34D399', icon: '🌱', description: 'Actively developing spiritually' },
  { name: 'Seeking', color: '#60A5FA', icon: '🔍', description: 'Searching for knowledge and truth' },
  { name: 'Learning', color: '#A78BFA', icon: '📚', description: 'Acquiring Islamic knowledge' },
  { name: 'Improving', color: '#FBBF24', icon: '📈', description: 'Making positive changes' },
  { name: 'Repentant', color: '#FB7185', icon: '🕋', description: 'Turning back to Allah' },
  { name: 'Striving', color: '#38BDF8', icon: '🏃', description: 'Working hard in faith' },
  { name: 'Awakening', color: '#C084FC', icon: '✨', description: 'Becoming more spiritually aware' },
  { name: 'Transforming', color: '#FB923C', icon: '🦋', description: 'Undergoing spiritual change' },
  { name: 'Spiritual Master', color: '#FFD700', icon: '👑', description: 'High level of spiritual achievement' },
  { name: 'Enlightened', color: '#EAB308', icon: '☀️', description: 'Deep spiritual understanding' },
  { name: 'Righteous', color: '#22C55E', icon: '⭐', description: 'Consistently doing good deeds' },
  { name: 'Steadfast', color: '#0284C7', icon: '🏔️', description: 'Unwavering in faith' },
  { name: 'Pious', color: '#4F46E5', icon: '🌟', description: 'God-conscious and devout' },
  { name: 'Sincere', color: '#0EA5E9', icon: '💎', description: 'Genuine in worship and actions' },
  { name: 'Blessed', color: '#D946EF', icon: '✨', description: 'Recipient of divine favor' }
];

// ============ SPIRITUAL STRENGTHS ============
const ALL_STRENGTHS = [
  { name: 'Quran Connection', icon: '📖' }, { name: 'Salah Consistency', icon: '🕌' },
  { name: 'Dhikr Practice', icon: '📿' }, { name: 'Charity & Giving', icon: '🎁' },
  { name: 'Fasting Devotion', icon: '🌙' }, { name: 'Knowledge Seeking', icon: '📚' },
  { name: 'Good Character', icon: '💝' }, { name: 'Family Relations', icon: '👨‍👩‍👧‍👦' },
  { name: 'Community Service', icon: '🤝' }, { name: 'Patience in Trials', icon: '🌿' },
  { name: 'Gratitude Practice', icon: '🙏' }, { name: 'Repentance Habit', icon: '🕋' },
  { name: 'Dua Consistency', icon: '🤲' }, { name: 'Tahajjud Prayer', icon: '🌌' },
  { name: 'Truthfulness', icon: '💎' }
];

// ============ RECOMMENDED SURAHS ============
const ALL_SURAHS = [
  { name: 'Al-Fatiha', number: 1, benefit: 'The Opening - Cure for all ailments' },
  { name: 'Al-Baqarah', number: 2, benefit: 'Protection from Shaytan' },
  { name: 'Ali Imran', number: 3, benefit: 'Strengthens faith in Allah' },
  { name: 'Al-Kahf', number: 18, benefit: 'Protection from Dajjal' },
  { name: 'Ya-Sin', number: 36, benefit: 'The heart of the Quran' },
  { name: 'Ar-Rahman', number: 55, benefit: 'Gratitude for blessings' },
  { name: 'Al-Waqiah', number: 56, benefit: 'Protection from poverty' },
  { name: 'Al-Mulk', number: 67, benefit: 'Protection in grave' },
  { name: 'Al-Ikhlas', number: 112, benefit: 'Pure monotheism' },
  { name: 'Al-Falaq', number: 113, benefit: 'Protection from evil' },
  { name: 'An-Nas', number: 114, benefit: 'Protection from whispers' },
  { name: 'Yusuf', number: 12, benefit: 'Patience and forgiveness' },
  { name: 'Maryam', number: 19, benefit: 'Trust in Allah\'s power' },
  { name: 'Ad-Duha', number: 93, benefit: 'Comfort in difficulty' },
  { name: 'Ash-Sharh', number: 94, benefit: 'Ease after hardship' }
];

// ============ AREAS FOR GROWTH ============
const GROWTH_AREAS = [
  { name: 'Patience', icon: '🌿' }, { name: 'Gratitude', icon: '🙏' },
  { name: 'Trust in Allah', icon: '🤝' }, { name: 'Forgiveness', icon: '💝' },
  { name: 'Humility', icon: '🌱' }, { name: 'Generosity', icon: '🎁' },
  { name: 'Quran Recitation', icon: '📖' }, { name: 'Night Prayer', icon: '🌙' }
];

// ============ PROPHET CARD COMPONENT ============
const ProphetCard = ({ prophet, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(prophet)}
      className={`cursor-pointer glass-card p-5 hover:border-aurora/40 transition-all duration-300 group bg-gradient-to-br ${prophet.color} bg-opacity-10`}
    >
      <div className="flex items-start gap-4">
        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{prophet.image}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">{prophet.name}</h3>
          <p className="text-aurora text-xs font-arabic mb-1">{prophet.nameAr}</p>
          <p className="text-gray-400 text-xs line-clamp-2">{prophet.description}</p>
          <div className="mt-2 flex items-center gap-1 text-aurora text-xs">
            <span>Read Story</span>
            <FiChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============ PROPHET MODAL COMPONENT ============
const ProphetModal = ({ prophet, onClose }) => {
  const [activeTab, setActiveTab] = useState('story');

  if (!prophet) return null;

  const tabs = [
    { id: 'story', label: 'Story', icon: FiBookOpen },
    { id: 'miracles', label: 'Miracles', icon: FiStar },
    { id: 'teachings', label: 'Teachings', icon: FiCompass },
    { id: 'timeline', label: 'Timeline', icon: FiClock }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto glass-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition z-10">
          <FiX size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="text-8xl mb-3">{prophet.image}</div>
          <h2 className="text-3xl font-bold text-white">{prophet.name}</h2>
          <p className="text-aurora text-lg font-arabic">{prophet.nameAr}</p>
          <p className="text-divine text-sm mt-1">{prophet.title}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-aurora to-divine text-cosmic'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={14} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'story' && (
            <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <p className="text-gray-300 leading-relaxed">{prophet.fullStory}</p>
              <div className="mt-4 p-4 bg-gradient-to-r from-aurora/10 to-divine/10 rounded-lg">
                <h4 className="font-semibold text-aurora mb-2">📜 Key Quranic Reference</h4>
                <p className="text-gray-400 italic">{prophet.verses[0]}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">🌟 Lessons to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {prophet.lessons.map((lesson, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">{lesson}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'miracles' && (
            <motion.div key="miracles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prophet.miracles.map((miracle, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <span className="text-gray-300 text-sm">{miracle}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'teachings' && (
            <motion.div key="teachings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="grid gap-3">
                {prophet.teachings.map((teaching, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 bg-gradient-to-r from-aurora/10 to-divine/10 rounded-lg">
                    <p className="text-gray-300 text-sm">💭 {teaching}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="relative">
                {prophet.timeline.map((event, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex gap-4 mb-4 relative">
                    <div className="w-24 text-aurora font-bold text-sm">{event.year}</div>
                    <div className="flex-1 p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-300 text-sm">{event.event}</p>
                    </div>
                    {idx < prophet.timeline.length - 1 && <div className="absolute left-12 top-10 w-0.5 h-8 bg-aurora/30" />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-center text-xs text-gray-500">May Allah's peace and blessings be upon all the prophets</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============ MAIN COMPONENT ============
export default function SpiritualDNA() {
  const { userId, userData, addXP } = useUser();
  const { accessToken, isAuthenticated } = useQuranAuth();
  const [loading, setLoading] = useState(true);
  const [spiritualScore, setSpiritualScore] = useState(0);
  const [activeSection, setActiveSection] = useState('dna');
  const [selectedProphet, setSelectedProphet] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [userStats, setUserStats] = useState({
    reflections: 0,
    bookmarks: 0,
    streak: 0,
    xp: 0,
    level: 1,
    readingSessions: [],
    goals: []
  });
  
  const [dnaData, setDnaData] = useState({
    dominantTraits: [],
    spiritualStrengths: [],
    recommendedSurahs: [],
    areasForGrowth: [],
    recommendedProphet: null
  });

  // Fetch user data from Quran Foundation API
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserDataFromQuranAPI();
    } else {
      // Fallback to local userData
      loadSpiritualDNA();
    }
  }, [isAuthenticated, accessToken]);

  const fetchUserDataFromQuranAPI = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      // Fetch user streaks
      const streaksResponse = await fetch(`${API_BASE_URL}/api/user/streaks`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      // Fetch user bookmarks
      const bookmarksResponse = await fetch(`${API_BASE_URL}/api/user/bookmarks`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      // Fetch reading sessions
      const sessionsResponse = await fetch(`${API_BASE_URL}/api/user/reading-sessions`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const profileData = await profileResponse.json();
      const streaksData = await streaksResponse.json();
      const bookmarksData = await bookmarksResponse.json();
      const sessionsData = await sessionsResponse.json();
      
      const updatedStats = {
        reflections: profileData.reflections?.length || 0,
        bookmarks: bookmarksData.bookmarks?.length || 0,
        streak: streaksData.currentStreak || 0,
        xp: profileData.totalXP || 0,
        level: profileData.level || 1,
        readingSessions: sessionsData.sessions || [],
        goals: profileData.goals || []
      };
      
      setUserStats(updatedStats);
      
      // Calculate spiritual score based on real data
      const score = Math.min(100, Math.floor(
        updatedStats.reflections * 2.5 + 
        updatedStats.bookmarks * 1.5 + 
        updatedStats.streak * 2 + 
        updatedStats.xp / 10
      ));
      setSpiritualScore(score);
      
      // Generate DNA based on real stats
      generateSpiritualDNA(updatedStats, score);
      
    } catch (error) {
      console.error('Error fetching user data from Quran API:', error);
      toast.error('Could not fetch spiritual data. Using local data.');
      loadSpiritualDNA();
    } finally {
      setLoading(false);
    }
  };

  const loadSpiritualDNA = () => {
    setLoading(true);
    
    const reflections = userData?.reflections?.length || 0;
    const bookmarks = userData?.bookmarks?.length || 0;
    const streak = userData?.streak || 0;
    const xp = userData?.xp || 0;
    
    const score = Math.min(100, Math.floor(
      reflections * 2.5 + 
      bookmarks * 1.5 + 
      streak * 2 + 
      xp / 10
    ));
    setSpiritualScore(score);
    generateSpiritualDNA(userStats, score);
  };

  const generateSpiritualDNA = (stats, score) => {
    let selectedTraits = [];
    if (score >= 80) {
      selectedTraits = ALL_TRAITS.filter(t => ['Spiritual Master', 'Enlightened', 'Righteous', 'Steadfast', 'Pious', 'Sincere', 'Blessed', 'Wise'].includes(t.name)).slice(0, 5);
    } else if (score >= 60) {
      selectedTraits = ALL_TRAITS.filter(t => ['Growing', 'Seeking', 'Learning', 'Improving', 'Reflective', 'Confident', 'Trusting', 'Devoted'].includes(t.name)).slice(0, 5);
    } else if (score >= 40) {
      selectedTraits = ALL_TRAITS.filter(t => ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate', 'Patient', 'Content', 'Humble'].includes(t.name)).slice(0, 5);
    } else {
      selectedTraits = ALL_TRAITS.filter(t => ['Seeking', 'Learning', 'Growing', 'Awakening', 'Repentant'].includes(t.name)).slice(0, 5);
    }
    
    const selectedStrengths = ALL_STRENGTHS.sort(() => Math.random() - 0.5).slice(0, 6);
    const selectedSurahs = ALL_SURAHS.sort(() => Math.random() - 0.5).slice(0, 8);
    const selectedGrowth = GROWTH_AREAS.sort(() => Math.random() - 0.5).slice(0, 4);
    
    let recommendedProphet = null;
    if (selectedTraits.length > 0) {
      const traitNames = selectedTraits.map(t => t.name);
      for (const prophet of PROPHETS) {
        if (prophet.recommendedFor?.some(t => traitNames.includes(t))) {
          recommendedProphet = prophet;
          break;
        }
      }
      if (!recommendedProphet) recommendedProphet = PROPHETS[0];
    }
    
    setDnaData({
      dominantTraits: selectedTraits,
      spiritualStrengths: selectedStrengths,
      recommendedSurahs: selectedSurahs,
      areasForGrowth: selectedGrowth,
      recommendedProphet
    });
    
    setTimeout(() => setLoading(false), 800);
  };

  const refreshDNA = async () => {
    setLoading(true);
    toast.success('🧬 Analyzing your spiritual journey...');
    
    if (isAuthenticated && accessToken) {
      addXP(10);
      await fetchUserDataFromQuranAPI();
    } else {
      addXP(10);
      setTimeout(() => {
        loadSpiritualDNA();
        toast.success('✨ Your Spiritual DNA has been updated! +10 XP');
      }, 1500);
    }
  };

  const getSpiritualWeather = () => {
    const streak = userStats.streak || userData?.streak || 0;
    const reflections = userStats.reflections || userData?.reflections?.length || 0;
    
    if (streak >= 7) return { icon: FiSun, message: 'Divine Light Shining', color: '#FFD700' };
    else if (streak >= 3) return { icon: FiWind, message: 'Gentle Breeze of Growth', color: '#00F2FE' };
    else if (reflections > 0) return { icon: FiCloud, message: 'Clouds of Reflection', color: '#8B5CF6' };
    else return { icon: FiMoon, message: 'Beginning Your Journey', color: '#6B7280' };
  };

  const weather = getSpiritualWeather();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-6xl mb-4">🧬</motion.div>
          <p className="text-gray-400">Decoding your spiritual essence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      {/* Authentication Status Banner */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-center">
          <p className="text-amber-300 text-sm">✨ Sign in with Quran Foundation to save your streaks and spiritual progress! ✨</p>
        </div>
      )}
      
      {isAuthenticated && (
        <div className="mb-4 p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-center">
          <p className="text-emerald-300 text-sm">✅ Connected to Quran Foundation • Your progress is being saved!</p>
        </div>
      )}
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-4">
          <weather.icon style={{ color: weather.color }} />
          <span className="text-sm text-gray-300">{weather.message}</span>
        </div>
        <h2 className="text-4xl font-bold gradient-text mb-2">Your Spiritual DNA 🧬</h2>
        <p className="text-gray-400">A unique reflection of your spiritual journey</p>
      </motion.div>

      <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
        {[
          { id: 'dna', label: '🧬 Spiritual DNA', icon: FiActivity },
          { id: 'prophets', label: '📖 Stories of Prophets', icon: FiBookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
              activeSection === tab.id
                ? 'bg-gradient-to-r from-aurora to-divine text-cosmic shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSection === 'dna' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
            <div className="relative inline-block">
              <svg className="w-48 h-48">
                <circle cx="96" cy="96" r="84" fill="none" stroke="#1F2937" strokeWidth="10" />
                <motion.circle cx="96" cy="96" r="84" fill="none" stroke="url(#scoreGradient)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 84}`} strokeDashoffset={`${2 * Math.PI * 84 * (1 - spiritualScore / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 84 * (1 - spiritualScore / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }} transform="rotate(-90 96 96)" />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F2FE" /><stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div><div className="text-5xl font-bold gradient-text">{spiritualScore}%</div><div className="text-xs text-gray-400">Spiritual Score</div></div>
              </div>
            </div>
            <div className="mt-4"><p className="text-white text-lg">Level {userStats.level || userData?.level || 1}</p><p className="text-gray-400 text-sm">Keep reflecting to grow!</p></div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FiHeart, label: 'Reflections', value: userStats.reflections || userData?.reflections?.length || 0, color: 'text-pink-400' },
              { icon: FiBookmark, label: 'Bookmarks', value: userStats.bookmarks || userData?.bookmarks?.length || 0, color: 'text-aurora' },
              { icon: FiActivity, label: 'Streak', value: `${userStats.streak || userData?.streak || 0} days`, color: 'text-emerald-400' },
              { icon: FiAward, label: 'XP', value: userStats.xp || userData?.xp || 0, color: 'text-divine' }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4 text-center">
                <stat.icon className={`${stat.color} text-xl mx-auto mb-2`} />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-lg font-bold gradient-text mb-4 flex items-center gap-2"><FiStar className="text-aurora" />Your Dominant Traits</h3>
            <div className="flex flex-wrap gap-3">
              {dnaData.dominantTraits.map((trait, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="relative group">
                  <div className="px-5 py-3 rounded-xl text-center min-w-[100px]" style={{ background: `${trait.color}20`, border: `1px solid ${trait.color}40` }}>
                    <span className="text-2xl block mb-1">{trait.icon}</span>
                    <span className="text-sm font-medium block" style={{ color: trait.color }}>{trait.name}</span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition">{trait.description}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={refreshDNA} className="bg-white/10 hover:bg-white/20 py-3 rounded-xl flex items-center justify-center gap-2 transition">
              <FiRefreshCw />Refresh DNA (+10 XP)
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveSection('prophets')} className="bg-gradient-to-r from-amber-500 to-pink-500 py-3 rounded-xl flex items-center justify-center gap-2 transition">
              <FiBookOpen />Explore All Prophets
            </motion.button>
          </div>
        </motion.div>
      )}

      {activeSection === 'prophets' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-8 text-center bg-gradient-to-r from-aurora/20 via-divine/20 to-aurora/20">
            <div className="text-7xl mb-4">📖</div>
            <h2 className="text-3xl font-bold text-white mb-3">Stories of the Prophets</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Discover the inspiring stories of Allah's messengers - their trials, triumphs, and timeless lessons</p>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={() => setActiveSection('dna')} className="flex items-center gap-2 text-gray-400 hover:text-aurora transition">
              <FiChevronLeft /> Back to DNA
            </button>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-aurora/20 text-aurora' : 'text-gray-400'}`}><FiGrid /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-aurora/20 text-aurora' : 'text-gray-400'}`}><FiList /></button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
            {PROPHETS.map((prophet, idx) => (
              <motion.div key={prophet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <ProphetCard prophet={prophet} onClick={setSelectedProphet} />
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-6 text-center bg-gradient-to-r from-aurora/5 to-divine/5">
            <p className="text-aurora text-sm mb-3 flex items-center justify-center gap-2"><FiStar /> Featured Quranic Verse</p>
            <p className="font-arabic text-xl text-right mb-3 leading-loose">وَكُلًّا نَّقُصُّ عَلَيْكَ مِنْ أَنۢبَآءِ ٱلرُّسُلِ مَا نُثَبِّتُ بِهِۦ فُؤَادَكَ</p>
            <p className="text-gray-400 text-sm">"And each story of the messengers We relate to you to strengthen your heart thereby..."</p>
            <p className="text-gray-500 text-xs mt-2">(Surah Hud, 11:120)</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>{selectedProphet && <ProphetModal prophet={selectedProphet} onClose={() => setSelectedProphet(null)} />}</AnimatePresence>
    </div>
  );
}
