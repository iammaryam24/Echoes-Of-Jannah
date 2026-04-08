// Simple API key middleware for frontend authentication
const API_KEYS = new Set([
  'dev-frontend-key-2024', // Change this to a random string
  process.env.FRONTEND_API_KEY
]);

function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !API_KEYS.has(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
}

module.exports = { validateApiKey };