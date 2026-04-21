// backend/routes/auth.js (REPLACE ENTIRE FILE)
import express from 'express';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce.js';

const router = express.Router();

// STEP 1: When user clicks "Sign In"
router.get('/auth/quran', (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  
  // Store in COOKIES (not memory)
  res.cookie('oauth_state', state, { 
    httpOnly: true, 
    secure: false, // Change to true in production
    maxAge: 600000,
    sameSite: 'lax'
  });
  res.cookie('code_verifier', codeVerifier, { 
    httpOnly: true, 
    secure: false,
    maxAge: 600000,
    sameSite: 'lax'
  });
  
  const authUrl = `https://prelive-oauth2.quran.foundation/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: process.env.PRELIVE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/auth/callback`,
    scope: 'openid offline_access note post user',
    state: state,
    nonce: nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })}`;
  
  res.redirect(authUrl);
});

// STEP 2: After user approves on Quran.Foundation
router.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  const storedState = req.cookies.oauth_state;
  const codeVerifier = req.cookies.code_verifier;
  
  if (!state || state !== storedState) {
    return res.redirect(`${process.env.FRONTEND_URL}/?error=invalid_state`);
  }
  
  try {
    const tokenResponse = await fetch('https://prelive-oauth2.quran.foundation/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.BACKEND_URL}/auth/callback`,
        client_id: process.env.PRELIVE_CLIENT_ID,
        client_secret: process.env.PRELIVE_CLIENT_SECRET,
        code_verifier: codeVerifier
      })
    });
    
    const tokens = await tokenResponse.json();
    
    // Store tokens in cookies
    res.cookie('access_token', tokens.access_token, { 
      httpOnly: true, 
      secure: false,
      maxAge: 3600000,
      sameSite: 'lax'
    });
    
    // Clear OAuth cookies
    res.clearCookie('oauth_state');
    res.clearCookie('code_verifier');
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/?error=auth_failed`);
  }
});

// STEP 3: Check if user is logged in
router.get('/auth/me', (req, res) => {
  const accessToken = req.cookies.access_token;
  
  if (!accessToken) {
    return res.json({ authenticated: false });
  }
  
  res.json({ authenticated: true });
});

// STEP 4: Logout
router.post('/auth/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ success: true });
});

export default router;
