// backend/routes/quran.js
const express = require('express');
const router = express.Router();
const quranApi = require('../utils/quranApi');

// Get all surahs
router.get('/surahs', async (req, res) => {
  try {
    console.log('Fetching all surahs...');
    const surahs = await quranApi.getAllSurahs();
    console.log(`✅ Retrieved ${surahs.length} surahs`);
    res.json({ success: true, data: surahs });
  } catch (error) {
    console.error('Error in /surahs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific surah with ALL verses
router.get('/surah/:number', async (req, res) => {
  try {
    const { number } = req.params;
    console.log(`Fetching surah ${number} with all verses...`);
    const surah = await quranApi.getSurah(number);
    console.log(`✅ Retrieved surah ${number}: ${surah.versesCount} verses`);
    res.json({ success: true, data: surah });
  } catch (error) {
    console.error(`Error in /surah/${req.params.number}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tafsir for a verse
router.get('/tafsir/:surah/:verse', async (req, res) => {
  try {
    const { surah, verse } = req.params;
    const tafsir = await quranApi.getTafsir(surah, verse);
    res.json({ success: true, data: tafsir });
  } catch (error) {
    console.error('Error in /tafsir:', error);
    res.json({ success: true, data: { text: null } });
  }
});

// Search Quran
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: { results: [] } });
    }
    console.log(`Searching for: "${q}"`);
    const results = await quranApi.searchQuran(q);
    console.log(`✅ Found ${results.length} results`);
    res.json({ success: true, data: { results } });
  } catch (error) {
    console.error('Error in /search:', error);
    res.json({ success: true, data: { results: [] } });
  }
});

module.exports = router;