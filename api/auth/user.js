export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid token provided' });
  }

  try {
    const response = await fetch(process.env.QF_USERINFO_ENDPOINT, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    const userData = await response.json();
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
