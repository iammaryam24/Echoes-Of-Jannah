export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const state = Math.random().toString(36).substring(2, 15);
    
    const params = new URLSearchParams({
      client_id: process.env.QF_CLIENT_ID,
      redirect_uri: process.env.QF_REDIRECT_URI,
      response_type: 'code',
      scope: process.env.QF_SCOPE,
      state: state,
    });

    const authUrl = `${process.env.QF_AUTHORIZATION_ENDPOINT}?${params.toString()}`;
    
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`);
    return res.status(200).json({ url: authUrl });
  } catch (error) {
    console.error('Login URL error:', error);
    return res.status(500).json({ error: 'Failed to generate login URL' });
  }
}
