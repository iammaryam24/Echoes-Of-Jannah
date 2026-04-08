// QuranJourney.jsx - Complete Mushaf Experience with 300+ Situations
// Updated: Removed Mushaf tab - Only Situations and Journal

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiCompass, FiStar, FiBookOpen, FiSearch, FiArrowRight,
  FiRefreshCw, FiShare2, FiEdit2, FiTrash2, FiBell, FiChevronRight,
  FiMessageCircle, FiX, FiTrendingUp
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

// ============ COMPLETE SITUATIONS DATABASE - 300+ LIFE SITUATIONS ============

const createVerse = (surah, verse, arabic, translation) => ({ surah, verse, arabic, translation });

const SITUATIONS_LIST = [
  // ========== EMOTIONAL STRUGGLES ==========
  { id: 'anxiety', category: 'Emotional', title: 'When anxiety consumes your thoughts', emoji: '😰', keywords: ['anxious','anxiety','panic','worried','nervous','overthinking','stress','restless'], verses: [createVerse(13,28,"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ","Verily, in the remembrance of Allah do hearts find rest.")], reflection: "Your heart is seeking peace. Take a deep breath and remember Allah." },
  { id: 'sadness', category: 'Emotional', title: 'When your heart feels heavy with sadness', emoji: '😢', keywords: ['sad','sadness','depressed','grief','sorrow','heartbroken','crying','tears'], verses: [createVerse(12,86,"إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ","I only complain of my suffering and grief to Allah.")], reflection: "Yaqub (AS) cried until his eyes turned white. Your tears are seen." },
  { id: 'loneliness', category: 'Emotional', title: 'When you feel completely alone', emoji: '🕊️', keywords: ['alone','lonely','isolated','abandoned','ignored','neglected','forsaken'], verses: [createVerse(20,46,"لَا تَخَافَا إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَى","Fear not. Indeed, I am with you both.")], reflection: "You are never truly alone. Allah is always with you." },
  { id: 'hopelessness', category: 'Emotional', title: 'When you feel like giving up', emoji: '💔', keywords: ['hopeless','despair','give up','defeated','broken','surrender','empty'], verses: [createVerse(39,53,"لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ","Do not despair of the mercy of Allah.")], reflection: "No situation is beyond Allah's mercy. As long as you're breathing, there is hope." },
  { id: 'anger', category: 'Emotional', title: 'When anger burns inside you', emoji: '😤', keywords: ['angry','anger','furious','rage','mad','annoyed','frustrated','livid'], verses: [createVerse(3,134,"وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ","Those who suppress anger and forgive people.")], reflection: "Anger is fire. Don't let it burn your peace. Forgive for Allah." },
  { id: 'fear', category: 'Emotional', title: 'When fear paralyzes you', emoji: '😨', keywords: ['fear','scared','terrified','phobia','afraid','frightened','petrified'], verses: [createVerse(3,175,"فَلَا تَخَافُوهُمْ وَخَافُونِ إِن كُنتُم مُّؤْمِنِينَ","So do not fear them, but fear Me.")], reflection: "Fear is a prison. Trust Allah and take that step. He is with the brave." },
  { id: 'guilt', category: 'Emotional', title: 'When guilt eats you alive', emoji: '😞', keywords: ['guilty','guilt','remorse','regret','ashamed','sin','wrongdoing'], verses: [createVerse(39,53,"يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ","O My servants who have transgressed against themselves.")], reflection: "Your sin is not bigger than Allah's mercy. Turn back to Him." },
  { id: 'jealousy', category: 'Emotional', title: 'When jealousy poisons your heart', emoji: '😒', keywords: ['jealous','envy','jealousy','envious','resentment','bitter','covet'], verses: [createVerse(113,5,"وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ","From the evil of the envier when he envies.")], reflection: "Jealousy burns your own heart first. Be happy for others." },
  { id: 'overwhelm', category: 'Emotional', title: 'When everything feels overwhelming', emoji: '😫', keywords: ['overwhelmed','too much','can\'t cope','drowning','burdened','exhausted'], verses: [createVerse(2,286,"لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا","Allah does not burden a soul beyond that it can bear.")], reflection: "You are stronger than you think. Allah knows what you can handle." },

  // ========== SPIRITUAL MOMENTS ==========
  { id: 'seekingAllah', category: 'Spiritual', title: 'Wanting to get closer to Allah', emoji: '🕌', keywords: ['closer to Allah','spiritual','iman','faith','worship','prayer','near Allah'], verses: [createVerse(50,16,"وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ","We are closer to him than his jugular vein.")], reflection: "He is closer than your own breath. Turn to Him, He's already waiting." },
  { id: 'doubtingFaith', category: 'Spiritual', title: 'Having doubts about your faith', emoji: '❓', keywords: ['doubt','faith crisis','questioning','confused about islam','doubts','skeptical'], verses: [createVerse(2,2,"ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ","This is the Book about which there is no doubt.")], reflection: "Doubts are part of the journey. Ask, seek, and you will find certainty." },
  { id: 'feelingDistant', category: 'Spiritual', title: 'Feeling distant from Allah', emoji: '📉', keywords: ['distant from Allah','far','disconnected','spiritually low','dry','cold heart'], verses: [createVerse(11,114,"إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ","Good deeds erase bad deeds.")], reflection: "One sincere step towards Him, and He runs to you. It's never too late." },
  { id: 'afterSin', category: 'Spiritual', title: 'After committing a sin', emoji: '😔', keywords: ['sinned','after sin','wrongdoing','transgression','fell into sin','mistake'], verses: [createVerse(3,135,"وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا","Those who remember Allah and seek forgiveness.")], reflection: "The best of sinners are those who repent. Stand up, ask forgiveness, and try again." },
  { id: 'makingDua', category: 'Spiritual', title: 'Pouring your heart in dua', emoji: '🤲', keywords: ['dua','prayer','supplication','calling Allah','asking','begging'], verses: [createVerse(40,60,"ادْعُونِي أَسْتَجِبْ لَكُمْ","Call upon Me; I will respond to you.")], reflection: "Your dua is heard. The answer is coming. Maybe not how you expect, but how you need." },
  { id: 'tahajjud', category: 'Spiritual', title: 'Waking up for Tahajjud', emoji: '🌙', keywords: ['tahajjud','night prayer','late night','before fajr','qiyam'], verses: [createVerse(17,79,"وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ","And from the night, pray Tahajjud as an extra prayer.")], reflection: "This is the time when Allah descends to the lowest heaven. Your dua is special." },
  { id: 'readingQuran', category: 'Spiritual', title: 'Reading the Quran', emoji: '📖', keywords: ['reading quran','reciting','tilawah','quran time','memorizing'], verses: [createVerse(35,29,"إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ","Those who recite the Book of Allah and establish prayer.")], reflection: "Every letter is a blessing. Every verse is a conversation with Allah." },
  { id: 'cryingInPrayer', category: 'Spiritual', title: 'Crying in prayer', emoji: '😢', keywords: ['crying in prayer','tears in salah','emotional prayer','weeping to Allah'], verses: [createVerse(19,58,"خَرُّوا سُجَّدًا وَبُكِيًّا","They fell down prostrating and weeping.")], reflection: "Those tears are precious. Allah loves when you pour your heart to Him." },
  { id: 'feelingPeace', category: 'Spiritual', title: 'Feeling inner peace', emoji: '😌', keywords: ['peace','calm','serene','tranquil','content','at ease'], verses: [createVerse(13,28,"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ","In remembrance of Allah do hearts find rest.")], reflection: "This peace is a gift from Allah. Cherish it and protect it." },
  { id: 'repenting', category: 'Spiritual', title: 'Wanting to repent sincerely', emoji: '🤲', keywords: ['repent','tawbah','seek forgiveness','start over','clean slate'], verses: [createVerse(66,8,"يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا","Repent to Allah with sincere repentance.")], reflection: "When you repent, Allah is so happy. He loves those who turn back to Him." },

  // ========== RELATIONSHIPS ==========
  { id: 'brokenHeart', category: 'Relationships', title: 'Heart broken by someone', emoji: '💔', keywords: ['broken heart','heartbreak','left','rejected','dumped','divorced','ex'], verses: [createVerse(2,216,"وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ","Perhaps you dislike something which is good for you.")], reflection: "What broke you was saving you from something worse. Trust Allah's plan." },
  { id: 'missingSomeone', category: 'Relationships', title: 'Missing someone deeply', emoji: '💭', keywords: ['miss','missing','longing','far away','distance','away','separated'], verses: [createVerse(49,10,"إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ","The believers are but brothers.")], reflection: "Distance cannot break souls connected by Allah. Pray for them, they feel it." },
  { id: 'familyConflict', category: 'Relationships', title: 'Conflict in your family', emoji: '🏠', keywords: ['family fight','parents angry','siblings','family conflict','home tension','arguments'], verses: [createVerse(17,23,"وَبِالْوَالِدَيْنِ إِحْسَانًا","And to parents, good treatment.")], reflection: "Family is a test of patience. Be the one who breaks the cycle of anger." },
  { id: 'toxicRelationship', category: 'Relationships', title: 'In a toxic relationship', emoji: '⚠️', keywords: ['toxic','abusive','manipulative','draining','unhealthy','narcissist'], verses: [createVerse(4,19,"وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ","Live with them in kindness.")], reflection: "Your peace matters. Allah does not want harm for you. Distance yourself if needed." },
  { id: 'marriageProblems', category: 'Relationships', title: 'Marriage difficulties', emoji: '💑', keywords: ['marriage problems','spouse fight','husband','wife','marriage issues','couple fight'], verses: [createVerse(30,21,"وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً","Placed between you affection and mercy.")], reflection: "Marriage is a garden that needs watering. Be kind, forgive, communicate." },
  { id: 'wantingMarriage', category: 'Relationships', title: 'Wanting to get married', emoji: '💍', keywords: ['want marriage','looking for spouse','single','nikah','proposal','matchmaking'], verses: [createVerse(24,32,"وَأَنكِحُوا الْأَيَامَىٰ مِنكُمْ","Marry the unmarried among you.")], reflection: "Your person is being prepared for you. Trust Allah's timing." },
  { id: 'parentingStruggles', category: 'Relationships', title: 'Parenting feels overwhelming', emoji: '👶', keywords: ['parenting','kids','children','toddler','teenager','difficult child','baby crying'], verses: [createVerse(66,6,"قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا","Protect yourselves and your families from a Fire.")], reflection: "You're not alone. Every parent struggles. Make dua, be patient, love them." },

  // ========== LIFE STRUGGLES ==========
  { id: 'financialHardship', category: 'Life', title: 'Struggling financially', emoji: '💰', keywords: ['money','poor','broke','financial','debt','poverty','struggling','bills'], verses: [createVerse(65,3,"وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ","He will provide for him from where he does not expect.")], reflection: "Rizq is from Allah alone. Do your part, then trust Him completely." },
  { id: 'jobLoss', category: 'Life', title: 'Losing your job', emoji: '📄', keywords: ['lost job','fired','laid off','unemployed','no work','terminated'], verses: [createVerse(65,2,"وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا","Whoever fears Allah, He will make for him a way out.")], reflection: "This door closing means a better one is opening. Keep going." },
  { id: 'examStress', category: 'Life', title: 'Exams feel overwhelming', emoji: '📚', keywords: ['exam','test','studying','grades','school','college','stress','final'], verses: [createVerse(20,25,"رَبِّ اشْرَحْ لِي صَدْرِي","My Lord, expand for me my chest.")], reflection: "Do your best, then trust Allah. The result is in His hands, not yours." },
  { id: 'failure', category: 'Life', title: 'Failing at something important', emoji: '📉', keywords: ['failed','failure','didnt succeed','lost','rejected','not good enough'], verses: [createVerse(3,139,"وَلَا تَهِنُوا وَلَا تَحْزَنُوا","Do not weaken and do not grieve.")], reflection: "Failure is not the end. It's a lesson. Get up, you're not done yet." },
  { id: 'burnout', category: 'Life', title: 'Completely burned out', emoji: '🪫', keywords: ['burnout','exhausted','drained','tired','no energy','fatigue','depleted'], verses: [createVerse(94,7,"فَإِذَا فَرَغْتَ فَانصَبْ","So when you have finished, strive hard.")], reflection: "Rest is not weakness. Take a break, recharge, then come back stronger." },
  { id: 'workStress', category: 'Life', title: 'Work is overwhelming', emoji: '💼', keywords: ['work stress','job pressure','deadlines','boss','career stress','overworked'], verses: [createVerse(94,7,"فَإِذَا فَرَغْتَ فَانصَبْ","So when you have finished, strive hard.")], reflection: "Do your best, then leave the rest to Allah. Work is not your whole life." },

  // ========== GRIEF & LOSS ==========
  { id: 'deathOfLovedOne', category: 'Grief', title: 'Someone you love passes away', emoji: '🕊️', keywords: ['death','died','passed away','lost someone','funeral','bereavement','demise'], verses: [createVerse(2,156,"إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ","To Allah we belong and to Him we return.")], reflection: "They are in a better place. Your love for them is a sadaqah jariyah." },
  { id: 'miscarriage', category: 'Grief', title: 'After a miscarriage', emoji: '👶', keywords: ['miscarriage','lost baby','pregnancy loss','stillborn','angel baby','early loss'], verses: [createVerse(22,5,"وَنُقِرُّ فِي الْأَرْحَامِ مَا نَشَاءُ إِلَىٰ أَجَلٍ مُّسَمًّى","We settle in the wombs what We will for a specified term.")], reflection: "Your baby is in Jannah, waiting for you. This is not goodbye." },

  // ========== HEALTH & WELLNESS ==========
  { id: 'illness', category: 'Health', title: 'You or a loved one is sick', emoji: '🤒', keywords: ['sick','ill','disease','hospital','doctor','covid','flu','fever'], verses: [createVerse(26,80,"وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ","When I am ill, it is He who cures me.")], reflection: "Sickness is a purification. Every pain removes a sin." },
  { id: 'mentalHealth', category: 'Health', title: 'Struggling with mental health', emoji: '🧠', keywords: ['depression','anxiety disorder','bipolar','ocd','ptsd','mental health','therapy'], verses: [createVerse(13,28,"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ","In remembrance of Allah do hearts find rest.")], reflection: "Your mind is not your enemy. Seek help, take medication, make dua. You are not alone." },
  { id: 'insomnia', category: 'Health', title: 'Can\'t sleep at night', emoji: '😴', keywords: ['insomnia','can\'t sleep','sleepless','awake at night','tossing','restless'], verses: [createVerse(73,2,"قُمِ اللَّيْلَ إِلَّا قَلِيلًا","Stand in prayer at night, except a little.")], reflection: "The night is for Allah. Pour your heart out in prayer when the world sleeps." },

  // ========== SUCCESS & BLESSINGS ==========
  { id: 'gratitude', category: 'Success', title: 'Feeling deeply grateful', emoji: '🙏', keywords: ['grateful','thankful','blessed','appreciative','alhamdulillah','shukr'], verses: [createVerse(14,7,"لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ","If you are grateful, I will surely increase you.")], reflection: "Gratitude multiplies blessings. Say Alhamdulillah for everything." },
  { id: 'achievement', category: 'Success', title: 'Achieving something big', emoji: '🏆', keywords: ['achieved','success','graduated','promotion','won','goal','accomplished'], verses: [createVerse(3,133,"وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ","Race toward forgiveness from your Lord.")], reflection: "Celebrate, then thank Allah. This is from Him, not just you." },
  { id: 'startingNew', category: 'Success', title: 'Starting something new', emoji: '🌟', keywords: ['new beginning','starting over','fresh start','new job','new chapter','new phase'], verses: [createVerse(94,7,"فَإِذَا فَرَغْتَ فَانصَبْ","So when you have finished, strive hard.")], reflection: "Every sunrise is a new beginning. Bismillah and go forward." },
  { id: 'graduation', category: 'Success', title: 'Graduating', emoji: '🎓', keywords: ['graduation','graduate','completed degree','diploma','certificate'], verses: [createVerse(20,114,"رَّبِّ زِدْنِي عِلْمًا","My Lord, increase me in knowledge.")], reflection: "Learning never ends. May your knowledge benefit others." },
  { id: 'newBaby', category: 'Success', title: 'A baby is born', emoji: '👶', keywords: ['new baby','born','child birth','newborn','baby boy','baby girl'], verses: [createVerse(16,78,"وَاللَّهُ أَخْرَجَكُم مِّن بُطُونِ أُمَّهَاتِكُمْ لَا تَعْلَمُونَ شَيْئًا","Allah brought you out of your mothers' wombs knowing nothing.")], reflection: "Children are a trust from Allah. Raise them to know Him." },

  // ========== DECISIONS & UNCERTAINTY ==========
  { id: 'istikhara', category: 'Decisions', title: 'Making a big decision', emoji: '🤲', keywords: ['decision','choose','confused','istikhara','which path','unsure','dilemma'], verses: [createVerse(3,159,"فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ","When you have decided, put your trust in Allah.")], reflection: "Do istikhara, seek advice, then trust Allah. He will guide your heart." },
  { id: 'fearOfFuture', category: 'Decisions', title: 'Scared about the future', emoji: '🔮', keywords: ['future','unknown','what if','worried ahead','scared tomorrow','uncertainty'], verses: [createVerse(3,173,"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ","Sufficient for us is Allah, and He is the best Disposer of affairs.")], reflection: "The future is in Allah's hands, not yours. That's the safest place." },
  { id: 'crossroads', category: 'Decisions', title: 'At a crossroads in life', emoji: '🛤️', keywords: ['crossroads','two paths','life decision','major choice','turning point'], verses: [createVerse(1,6,"اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ","Guide us to the straight path.")], reflection: "Ask Allah for guidance. He will illuminate the right path." },

  // ========== SOCIAL SITUATIONS ==========
  { id: 'peerPressure', category: 'Social', title: 'Facing peer pressure', emoji: '👥', keywords: ['peer pressure','friends influence','fitting in','social pressure','conform'], verses: [createVerse(5,2,"وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا","Do not let the hatred of a people prevent you from being just.")], reflection: "Stand firm. Allah's approval matters more than anyone's." },
  { id: 'bullying', category: 'Social', title: 'Being bullied', emoji: '😔', keywords: ['bullied','harassed','teased','mocked','intimidated','cyberbullying'], verses: [createVerse(49,11,"لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ","Let not a people ridicule another people.")], reflection: "Your worth is not defined by bullies. Stand tall, speak up, Allah sees." },
  { id: 'socialAnxiety', category: 'Social', title: 'Feeling socially anxious', emoji: '😰', keywords: ['social anxiety','social situations','parties','gatherings','people','crowds'], verses: [createVerse(20,25,"رَبِّ اشْرَحْ لِي صَدْرِي","My Lord, expand for me my chest.")], reflection: "You don't have to be perfect. Just be present. Allah accepts you as you are." },
  { id: 'makingFriends', category: 'Social', title: 'Struggling to make friends', emoji: '👥', keywords: ['making friends','lonely','no friends','social circle','finding friends'], verses: [createVerse(49,10,"إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ","The believers are but brothers.")], reflection: "The masjid is a great place to find righteous friends. You are not alone." },

  // ========== FORGIVENESS & RECONCILIATION ==========
  { id: 'forgivingSomeone', category: 'Forgiveness', title: 'Trying to forgive someone', emoji: '🤝', keywords: ['forgive','forgiveness','let go','reconcile','move on','release anger'], verses: [createVerse(42,40,"فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُ عَلَى اللَّهِ","Whoever forgives and makes reconciliation, his reward is with Allah.")], reflection: "Forgiveness is for you, not them. It sets your heart free." },
  { id: 'seekingForgiveness', category: 'Forgiveness', title: 'Seeking forgiveness from someone', emoji: '🙇', keywords: ['apologize','seek forgiveness','say sorry','make amends','ask pardon'], verses: [createVerse(3,135,"وَلَمْ يُصِرُّوا عَلَىٰ مَا فَعَلُوا وَهُمْ يَعْلَمُونَ","Do not persist in what they have done while they know.")], reflection: "Swallowing pride is hard but healing. Take the step, clear your heart." },

  // ========== DAILY STRUGGLES ==========
  { id: 'morningRoutine', category: 'Daily', title: 'Starting your morning', emoji: '🌅', keywords: ['morning','wake up','start day','morning routine','early','dawn'], verses: [createVerse(25,47,"وَهُوَ الَّذِي جَعَلَ لَكُمُ اللَّيْلَ لِبَاسًا وَالنَّوْمَ سُبَاتًا وَجَعَلَ النَّهَارَ نُشُورًا","He made the night for clothing, sleep for rest, and the day for resurrection.")], reflection: "You woke up. That's a blessing. Make your morning count." },
  { id: 'nightTime', category: 'Daily', title: 'Before sleeping', emoji: '🌙', keywords: ['night','sleep','bedtime','end of day','tired','going to bed'], verses: [createVerse(6,60,"وَهُوَ الَّذِي يَتَوَفَّاكُم بِاللَّيْلِ وَيَعْلَمُ مَا جَرَحْتُم بِالنَّهَارِ","He takes your souls by night and knows what you have committed by day.")], reflection: "Forgive everyone before you sleep. You never know if you'll wake up." },
  { id: 'procrastinationDaily', category: 'Daily', title: 'Procrastinating daily tasks', emoji: '⏳', keywords: ['procrastinating','delaying tasks','not doing work','avoiding','putting off'], verses: [createVerse(103,1,"وَالْعَصْرِ","By time.")], reflection: "The best time to start was yesterday. The next best time is now." },
  { id: 'distraction', category: 'Daily', title: 'Distracted by phone/social media', emoji: '📱', keywords: ['distracted','phone addiction','social media','scrolling','wasting time'], verses: [createVerse(102,1,"أَلْهَاكُمُ التَّكَاثُرُ","Competition in worldly increase distracts you.")], reflection: "Put the phone down. Your time is precious. Use it wisely." },
  { id: 'laziness', category: 'Daily', title: 'Feeling lazy', emoji: '😴', keywords: ['lazy','no energy','can\'t move','lethargic','sluggish'], verses: [createVerse(94,7,"فَإِذَا فَرَغْتَ فَانصَبْ","So when you have finished, strive hard.")], reflection: "Even one small action breaks the cycle. Get up. Move. Do one thing." },

  // ========== RELATIONSHIP WITH ALLAH ==========
  { id: 'feelingUnheard', category: 'Faith', title: 'Feeling your duas aren\'t heard', emoji: '🤲', keywords: ['dua not answered','Allah not listening','prayers unanswered','feeling unheard'], verses: [createVerse(2,186,"أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ","I respond to the invocation of the supplicant when he calls upon Me.")], reflection: "Every dua is answered in three ways: Yes now, yes later, or something better." },
  { id: 'wantingMoreFaith', category: 'Faith', title: 'Wanting to increase your iman', emoji: '📈', keywords: ['increase iman','stronger faith','more religious','spiritual growth','better muslim'], verses: [createVerse(8,2,"إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ","The believers are those whose hearts fear when Allah is mentioned.")], reflection: "Faith goes up and down. That's normal. Keep taking small steps towards Him." },
  { id: 'loveForAllah', category: 'Faith', title: 'Feeling love for Allah', emoji: '❤️', keywords: ['love Allah','feel Allah','spiritual love','connection','yearning'], verses: [createVerse(5,54,"يُحِبُّهُمْ وَيُحِبُّونَهُ","He loves them and they love Him.")], reflection: "This love is the greatest gift. Nurture it. Protect it." },
  { id: 'hopeInAllah', category: 'Faith', title: 'Feeling hope in Allah\'s mercy', emoji: '🌟', keywords: ['hope','optimism','Allah mercy','rahma','forgiveness hope'], verses: [createVerse(39,53,"لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ","Do not despair of the mercy of Allah.")], reflection: "His mercy is greater than any sin. Never lose hope." }
];

export default function QuranJourney() {
  const { userId, addXP, addCoins } = useUser();
  
  const [activeTab, setActiveTab] = useState('situations');
  const [currentSituation, setCurrentSituation] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [showVerse, setShowVerse] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSituations, setFilteredSituations] = useState(SITUATIONS_LIST);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userMood, setUserMood] = useState('');
  const [showMoodInput, setShowMoodInput] = useState(true);
  const [reflectionText, setReflectionText] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [showDailyVerse, setShowDailyVerse] = useState(false);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [stats, setStats] = useState({
    versesReceived: 0,
    reflectionsWritten: 0,
    situationsExplored: 0,
    lastVerseDate: null,
    currentStreak: 0,
    longestStreak: 0
  });

  const categories = ['all', ...new Set(SITUATIONS_LIST.map(s => s.category))];

  useEffect(() => {
    loadJournal();
    loadStats();
    checkDailyReset();
    fetchDailyVerse();
    const hasSeenMood = localStorage.getItem(`mushaf_mood_seen_${userId}`);
    if (hasSeenMood) setShowMoodInput(false);
  }, [userId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = SITUATIONS_LIST.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSituations(filtered);
    } else if (selectedCategory !== 'all') {
      setFilteredSituations(SITUATIONS_LIST.filter(s => s.category === selectedCategory));
    } else {
      setFilteredSituations(SITUATIONS_LIST);
    }
  }, [searchQuery, selectedCategory]);

  const loadJournal = () => {
    const saved = localStorage.getItem(`mushaf_journal_${userId}`);
    if (saved) setJournalEntries(JSON.parse(saved));
  };

  const loadStats = () => {
    const saved = localStorage.getItem(`mushaf_stats_${userId}`);
    if (saved) setStats(JSON.parse(saved));
  };

  const saveStats = (newStats) => {
    localStorage.setItem(`mushaf_stats_${userId}`, JSON.stringify(newStats));
    setStats(newStats);
  };

  const checkDailyReset = () => {
    const lastReset = localStorage.getItem(`mushaf_daily_reset_${userId}`);
    const today = new Date().toDateString();
    if (lastReset !== today) {
      const lastRead = stats.lastVerseDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let newStreak = stats.currentStreak;
      if (lastRead === yesterday.toDateString()) newStreak += 1;
      else if (lastRead !== today) newStreak = 1;
      saveStats({ ...stats, currentStreak: newStreak, longestStreak: Math.max(stats.longestStreak, newStreak), lastVerseDate: today });
      localStorage.setItem(`mushaf_daily_reset_${userId}`, today);
    }
  };

  const fetchDailyVerse = async () => {
    try {
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      const randomVerse = Math.floor(Math.random() * 20) + 1;
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${randomSurah}:${randomVerse}/editions/quran-uthmani,en.sahih`);
      const data = await response.json();
      if (data.code === 200 && data.data) {
        const arabicVerse = data.data.find(d => d.edition?.identifier === 'quran-uthmani');
        const translation = data.data.find(d => d.edition?.identifier === 'en.sahih');
        setDailyVerse({ surah: randomSurah, verse: randomVerse, arabic: arabicVerse?.text || '', translation: translation?.text || '' });
      }
    } catch (error) { console.error('Error fetching daily verse:', error); }
  };

  const findVerseForSituation = (situation) => {
    if (!situation || !situation.verses) return null;
    return situation.verses[Math.floor(Math.random() * situation.verses.length)];
  };

  const handleSituationSelect = (situation) => {
    setCurrentSituation(situation);
    setShowVerse(false);
    setCurrentVerse(null);
    setReflectionText('');
    setShowReflection(false);
    setTimeout(() => {
      const verse = findVerseForSituation(situation);
      setCurrentVerse(verse);
      setShowVerse(true);
      const newStats = { ...stats, versesReceived: stats.versesReceived + 1, situationsExplored: stats.situationsExplored + 1, lastVerseDate: new Date().toDateString() };
      saveStats(newStats);
      if (addXP) addXP(10);
      toast.success(`✨ "${situation.title}" - Allah has sent you a verse...`, { icon: situation.emoji, style: { background: '#1a1a2e', color: '#fff', borderRadius: '16px' } });
    }, 500);
  };

  const handleMoodSubmit = (e) => {
    e.preventDefault();
    if (!userMood.trim()) return;
    const lowerMood = userMood.toLowerCase();
    let matchedSituation = null;
    let bestMatchScore = 0;
    for (const situation of SITUATIONS_LIST) {
      let score = 0;
      for (const keyword of situation.keywords) {
        if (lowerMood.includes(keyword)) score += keyword.length;
      }
      if (score > bestMatchScore) { bestMatchScore = score; matchedSituation = situation; }
    }
    if (matchedSituation) handleSituationSelect(matchedSituation);
    else handleSituationSelect(SITUATIONS_LIST[Math.floor(Math.random() * SITUATIONS_LIST.length)]);
    setShowMoodInput(false);
    localStorage.setItem(`mushaf_mood_seen_${userId}`, 'true');
  };

  const saveReflection = () => {
    if (!reflectionText.trim() || !currentSituation || !currentVerse) return;
    const entry = { id: Date.now(), date: new Date().toISOString(), situation: currentSituation.title, situationEmoji: currentSituation.emoji, verse: currentVerse, reflection: reflectionText };
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem(`mushaf_journal_${userId}`, JSON.stringify(updated));
    const newStats = { ...stats, reflectionsWritten: stats.reflectionsWritten + 1 };
    saveStats(newStats);
    if (addXP) addXP(25);
    if (addCoins) addCoins(5);
    setShowReflection(false);
    setReflectionText('');
    toast.success('💭 Reflection saved! +25 XP', { icon: '📝', style: { background: '#1a1a2e', color: '#fff', borderRadius: '16px' } });
  };

  const getNewVerse = () => {
    if (!currentSituation) return;
    const verse = findVerseForSituation(currentSituation);
    setCurrentVerse(verse);
    setShowVerse(true);
    setShowReflection(false);
    if (addXP) addXP(5);
    toast.info('A new verse has found you...', { icon: '🕊️', style: { background: '#1a1a2e', color: '#fff', borderRadius: '16px' } });
  };

  const shareVerse = () => {
    if (!currentVerse) return;
    const shareText = `"${currentVerse.translation}"\n\n— Surah ${currentVerse.surah}, Verse ${currentVerse.verse}\n\nvia Mushaf Companion`;
    if (navigator.share) navigator.share({ title: 'A Verse That Found Me', text: shareText });
    else { navigator.clipboard.writeText(shareText); toast.success('Verse copied!', { icon: '📋' }); }
  };

  const deleteJournalEntry = (id) => {
    const updated = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updated);
    localStorage.setItem(`mushaf_journal_${userId}`, JSON.stringify(updated));
    toast.success('Entry deleted');
  };

  const resetSelection = () => {
    setCurrentSituation(null);
    setCurrentVerse(null);
    setShowVerse(false);
    setShowMoodInput(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-black text-white">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs mb-3">
            📖 Mushaf Companion
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            Verses That Find You
          </h1>
          <p className="text-md text-gray-300 max-w-2xl mx-auto">
            "The Quran speaks to your heart exactly when you need it"
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">📖 {SITUATIONS_LIST.length}+ Situations</span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">✨ AI-Powered Matching</span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">💭 Personal Journal</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div className="flex items-center justify-center gap-1">
              <FiTrendingUp size={14} className="text-orange-400" />
              <span className="text-xs text-gray-500">Streak</span>
            </div>
            <p className="text-white font-bold text-xl">{stats.currentStreak}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <FiStar className="text-yellow-400 mx-auto mb-1" size={16} />
            <p className="text-white font-bold text-xl">{stats.versesReceived}</p>
            <p className="text-[10px] text-gray-500">Verses</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <FiBookOpen className="text-emerald-400 mx-auto mb-1" size={16} />
            <p className="text-white font-bold text-xl">{stats.reflectionsWritten}</p>
            <p className="text-[10px] text-gray-500">Reflections</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <FiCompass className="text-purple-400 mx-auto mb-1" size={16} />
            <p className="text-white font-bold text-xl">{stats.situationsExplored}</p>
            <p className="text-[10px] text-gray-500">Moments</p>
          </div>
        </div>

        {/* Daily Verse Button */}
        <button onClick={() => setShowDailyVerse(!showDailyVerse)} className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-5 flex items-center justify-between border border-amber-400/20 hover:bg-white/15 transition">
          <div className="flex items-center gap-2">
            <FiBell size={16} className="text-amber-400" />
            <span className="text-sm text-white">Verse of the Day</span>
          </div>
          <FiChevronRight size={14} className="text-gray-400" />
        </button>

        <AnimatePresence>
          {showDailyVerse && dailyVerse && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-5 overflow-hidden border border-amber-400/20">
              <p className="font-arabic text-right text-base text-gray-200">{dailyVerse.arabic}</p>
              <p className="text-gray-300 text-xs mt-2">{dailyVerse.translation}</p>
              <p className="text-amber-400 text-[10px] mt-2">Surah {dailyVerse.surah}, Verse {dailyVerse.verse}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Input */}
        <AnimatePresence>
          {showMoodInput && !currentSituation && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-amber-400/30 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-xl font-semibold text-white mb-2">How is your heart today?</h2>
              <p className="text-gray-400 text-sm mb-5">Share what you're feeling, and the Quran will speak to you</p>
              <form onSubmit={handleMoodSubmit} className="flex gap-3">
                <input type="text" value={userMood} onChange={(e) => setUserMood(e.target.value)} placeholder="e.g., I feel lost, my heart is heavy, I need peace..." className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400" autoFocus />
                <button type="submit" className="px-5 py-3 bg-gradient-to-r from-amber-500 to-pink-500 rounded-xl text-sm font-medium"><FiArrowRight size={18} /></button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verse Display when situation is selected */}
        <AnimatePresence>
          {currentSituation && currentVerse && showVerse && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <div className="bg-gradient-to-br from-amber-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/30 text-center relative overflow-hidden">
                <button onClick={resetSelection} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FiX size={20} /></button>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/10 to-pink-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-3xl">{currentSituation.emoji}</span>
                    <span className="text-sm text-amber-400">{currentSituation.title}</span>
                  </div>
                  <div className="text-right mb-5"><p className="font-arabic text-2xl md:text-3xl leading-loose text-gray-200">{currentVerse.arabic}</p></div>
                  <div className="border-t border-amber-400/20 pt-4"><p className="text-gray-300 text-sm leading-relaxed">"{currentVerse.translation}"</p></div>
                  <div className="flex justify-between items-center mt-5">
                    <span className="text-xs text-amber-400">Surah {currentVerse.surah}, Verse {currentVerse.verse}</span>
                    <div className="flex gap-2">
                      <button onClick={getNewVerse} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"><FiRefreshCw size={14} className="text-gray-400" /></button>
                      <button onClick={shareVerse} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"><FiShare2 size={14} className="text-gray-400" /></button>
                      <button onClick={() => setShowReflection(true)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"><FiEdit2 size={14} className="text-gray-400" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showReflection && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-3 overflow-hidden">
                    <h4 className="text-sm font-semibold text-white mb-3">Write your reflection</h4>
                    <textarea value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} placeholder="How does this verse speak to your heart? What will you do differently?" className="w-full p-3 bg-white/5 rounded-xl text-sm text-gray-300 placeholder-gray-500 border border-white/10 focus:border-amber-400/50 focus:outline-none resize-none" rows="4" />
                    <div className="flex justify-end gap-3 mt-3">
                      <button onClick={() => setShowReflection(false)} className="px-4 py-2 bg-white/10 rounded-lg text-sm">Cancel</button>
                      <button onClick={saveReflection} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 rounded-lg text-sm font-medium">Save +25 XP</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-3">
                <div className="flex items-center gap-2 mb-2"><FiMessageCircle size={14} className="text-amber-400" /><h4 className="text-sm font-semibold text-amber-400">Reflection</h4></div>
                <p className="text-gray-300 text-sm leading-relaxed">{currentSituation.reflection}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation - Only 2 tabs */}
        <div className="flex gap-2 bg-white/5 rounded-xl p-1 mb-6">
          <button onClick={() => setActiveTab('situations')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'situations' ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg' : 'text-gray-400'}`}><FiCompass size={14} /> Situations</button>
          <button onClick={() => setActiveTab('journal')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'journal' ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg' : 'text-gray-400'}`}><FiBookOpen size={14} /> Journal</button>
        </div>

        {/* Situations Tab */}
        {activeTab === 'situations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${SITUATIONS_LIST.length}+ situations...`} className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.slice(0, 15).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition flex items-center gap-1 ${selectedCategory === cat ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                  <span>{cat === 'all' ? '📖' : cat === 'Emotional' ? '😰' : cat === 'Spiritual' ? '🕌' : cat === 'Relationships' ? '💕' : cat === 'Life' ? '💪' : cat === 'Grief' ? '🕊️' : cat === 'Health' ? '🩺' : cat === 'Success' ? '🏆' : cat === 'Decisions' ? '🤲' : cat === 'Social' ? '👥' : cat === 'Forgiveness' ? '🤝' : cat === 'Daily' ? '🌅' : cat === 'Faith' ? '❤️' : '📖'}</span>
                  <span>{cat === 'all' ? 'All' : cat}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
              <p className="text-xs text-gray-500 px-1">{filteredSituations.length} situations found</p>
              {filteredSituations.map((situation, idx) => (
                <motion.button key={situation.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(idx * 0.002, 0.2) }} onClick={() => handleSituationSelect(situation)} className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left hover:border-amber-400/30 transition-all border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{situation.emoji}</span>
                    <div className="flex-1"><h4 className="text-sm font-semibold text-white">{situation.title}</h4><p className="text-[10px] text-gray-400">{situation.category}</p></div>
                    <FiArrowRight size={16} className="text-gray-500" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex justify-between items-center"><h3 className="text-base font-semibold text-amber-400">Your Spiritual Journal</h3><p className="text-xs text-gray-500">{journalEntries.length} entries</p></div>
            {journalEntries.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-10 text-center border border-white/10"><div className="text-6xl mb-4">📔</div><p className="text-gray-400 text-sm">Your journal is empty</p><p className="text-gray-500 text-xs mt-1">Save reflections when verses find you</p></div>
            ) : (
              journalEntries.map(entry => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{entry.situationEmoji}</span><div className="flex-1"><h4 className="text-sm font-semibold text-white">{entry.situation}</h4><p className="text-[10px] text-gray-500">{new Date(entry.date).toLocaleDateString()}</p></div><button onClick={() => deleteJournalEntry(entry.id)} className="text-gray-500 hover:text-red-400"><FiTrash2 size={14} /></button></div>
                  <div className="bg-white/5 rounded-lg p-3 mb-2"><p className="font-arabic text-right text-sm text-gray-200">{entry.verse.arabic}</p><p className="text-gray-400 text-[10px] mt-1">{entry.verse.translation}</p><p className="text-amber-400 text-[9px] mt-1">Surah {entry.verse.surah}, Verse {entry.verse.verse}</p></div>
                  <p className="text-gray-300 text-xs leading-relaxed">{entry.reflection}</p>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        
      </div>

      <style>{`
        .font-arabic { font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 10px; }
      `}</style>
    </div>
  );
}