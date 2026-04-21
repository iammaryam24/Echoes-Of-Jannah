// backend/routes/reflections.js
import express from 'express';
const router = express.Router();

const authenticate = (req, res, next) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.accessToken = accessToken;
  next();
};

router.post('/reflections', authenticate, async (req, res) => {
  const { verseKey, content, isPublic = false } = req.body;
  
  try {
    const noteRes = await fetch('https://api.quran.foundation/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': req.accessToken,
        'x-client-id': process.env.PRELIVE_CLIENT_ID
      },
      body: JSON.stringify({
        resource_type: 'verse',
        resource_id: verseKey,
        body: content,
        language: 'en'
      })
    });
    
    const { note } = await noteRes.json();
    
    if (isPublic) {
      await fetch(`https://api.quran.foundation/v1/notes/${note.id}/publish`, {
        method: 'POST',
        headers: {
          'x-auth-token': req.accessToken,
          'x-client-id': process.env.PRELIVE_CLIENT_ID
        }
      });
    }
    
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save reflection' });
  }
});

router.get('/reflections', authenticate, async (req, res) => {
  try {
    const response = await fetch(
      `https://api.quran.foundation/v1/notes?page=1&per_page=50`,
      {
        headers: {
          'x-auth-token': req.accessToken,
          'x-client-id': process.env.PRELIVE_CLIENT_ID
        }
      }
    );
    
    const notes = await response.json();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
});

export default router;
