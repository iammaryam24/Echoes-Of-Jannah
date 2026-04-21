import express from 'express';
import axios from 'axios';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ============================================
// CONFIGURATION - USING YOUR TEST CREDENTIALS
// ============================================
const PORT = process.env.PORT || 3001;

// USE YOUR TEST CREDENTIALS (Pre-production)
const CLIENT_ID = process.env.CLIENT_ID || '911c5b21-975f-4610-be81-f7158e7e6047';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'oESUyMXqqRSkQP8HBRmATrZlwp';

// IMPORTANT: Fix redirect URI for Vercel
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? `${process.env.BACKEND_URL}/api/auth/callback`  // FIXED: Use backend URL, not frontend
  : 'http://localhost:3001/api/auth/callback';

const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';
const API_BASE_URL = 'https://api.quran.foundation/api/v1';

console.log('🔐 Quran Foundation Auth Server');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Redirect URI: ${REDIRECT_URI}`);
console.log(`   Client ID: ${CLIENT_ID}`);

// REMOVED: tempAuthStore - NO MORE IN-MEMORY STORAGE!

function generatePkcePair() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
    return { codeVerifier, codeChallenge };
}

function randomString(bytes = 16) {
    return crypto.randomBytes(bytes).toString('hex');
}

// ============================================
// ENDPOINT 1: Get Login URL (FIXED - No memory storage)
// ============================================
app.get('/api/auth/login-url', (req, res) => {
    console.log('[API] GET /api/auth/login-url');
    
    const { codeVerifier, codeChallenge } = generatePkcePair();
    const state = randomString(16);
    const nonce = randomString(16);

    // STORE IN COOKIES instead of memory
    res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600000, // 10 minutes
        sameSite: 'lax'
    });
    res.cookie('code_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600000,
        sameSite: 'lax'
    });
    res.cookie('oauth_nonce', nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600000,
        sameSite: 'lax'
    });

    const authUrl = `${AUTH_BASE_URL}/oauth2/auth?` + new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid offline_access note post user', // ADDED: note and post scopes
        state: state,
        nonce: nonce,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    });

    res.json({ url: authUrl });
});

// ============================================
// ENDPOINT 2: Callback Handler (NEW - Vercel compatible)
// ============================================
app.get('/api/auth/callback', async (req, res) => {
    console.log('[API] GET /api/auth/callback');
    const { code, state } = req.query;

    // Get from COOKIES (not memory)
    const storedState = req.cookies.oauth_state;
    const codeVerifier = req.cookies.code_verifier;
    const expectedNonce = req.cookies.oauth_nonce;

    if (!state || state !== storedState) {
        console.error('State mismatch:', { received: state, stored: storedState });
        return res.redirect(`${process.env.FRONTEND_URL}/?error=invalid_state`);
    }

    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/?error=no_code`);
    }

    try {
        // Exchange code for tokens
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', REDIRECT_URI);
        params.append('code_verifier', codeVerifier);

        const tokenResponse = await axios.post(
            `${AUTH_BASE_URL}/oauth2/token`,
            params.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                auth: { username: CLIENT_ID, password: CLIENT_SECRET },
            }
        );

        const tokenData = tokenResponse.data;
        
        // Verify nonce
        const idTokenPayload = JSON.parse(
            Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString()
        );

        if (idTokenPayload.nonce !== expectedNonce) {
            return res.redirect(`${process.env.FRONTEND_URL}/?error=invalid_nonce`);
        }

        // Store tokens in HTTP-Only cookies
        res.cookie('access_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
            sameSite: 'lax'
        });
        
        res.cookie('refresh_token', tokenData.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2592000000, // 30 days
            sameSite: 'lax'
        });

        // Clear OAuth state cookies
        res.clearCookie('oauth_state');
        res.clearCookie('code_verifier');
        res.clearCookie('oauth_nonce');

        console.log(`[AUTH] User ${idTokenPayload.sub} logged in successfully`);
        
        // Redirect to frontend dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

    } catch (error) {
        console.error('[AUTH] Exchange failed:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}/?error=auth_failed`);
    }
});

// ============================================
// ENDPOINT 3: Get Current User (NEW)
// ============================================
app.get('/api/auth/me', (req, res) => {
    const accessToken = req.cookies.access_token;
    
    if (!accessToken) {
        return res.json({ authenticated: false });
    }
    
    // You could decode the JWT or fetch from API
    res.json({ authenticated: true });
});

// ============================================
// ENDPOINT 4: Refresh Token (FIXED - uses cookie)
// ============================================
app.post('/api/auth/refresh', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token' });
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);

        const tokenResponse = await axios.post(
            `${AUTH_BASE_URL}/oauth2/token`,
            params.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                auth: { username: CLIENT_ID, password: CLIENT_SECRET },
            }
        );

        // Update access token cookie
        res.cookie('access_token', tokenResponse.data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'lax'
        });

        res.json({
            accessToken: tokenResponse.data.access_token,
            expiresIn: tokenResponse.data.expires_in,
        });
    } catch (error) {
        console.error('[AUTH] Refresh failed:', error.response?.data || error.message);
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// ============================================
// ENDPOINT 5: Logout (FIXED - clears cookies)
// ============================================
app.post('/api/auth/logout', (req, res) => {
    console.log('[AUTH] User logged out');
    
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    res.json({ success: true });
});

// ============================================
// ENDPOINT 6: Save Reflection (NEW)
// ============================================
app.post('/api/reflections', async (req, res) => {
    const accessToken = req.cookies.access_token;
    
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { verseKey, content, isPublic = false } = req.body;
    
    try {
        // Create private note
        const noteResponse = await axios.post(
            `${API_BASE_URL}/notes`,
            {
                resource_type: 'verse',
                resource_id: verseKey,
                body: content,
                language: 'en'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': accessToken,
                    'x-client-id': CLIENT_ID
                }
            }
        );
        
        const note = noteResponse.data.note;
        
        // Publish if requested
        if (isPublic) {
            await axios.post(
                `${API_BASE_URL}/notes/${note.id}/publish`,
                {},
                {
                    headers: {
                        'x-auth-token': accessToken,
                        'x-client-id': CLIENT_ID
                    }
                }
            );
        }
        
        res.json({ success: true, note });
        
    } catch (error) {
        console.error('[REFLECTIONS] Save failed:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to save reflection' });
    }
});

// ============================================
// ENDPOINT 7: Get Reflections (NEW)
// ============================================
app.get('/api/reflections', async (req, res) => {
    const accessToken = req.cookies.access_token;
    
    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const response = await axios.get(
            `${API_BASE_URL}/notes?page=1&per_page=50`,
            {
                headers: {
                    'x-auth-token': accessToken,
                    'x-client-id': CLIENT_ID
                }
            }
        );
        
        res.json(response.data);
        
    } catch (error) {
        console.error('[REFLECTIONS] Fetch failed:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch reflections' });
    }
});

// ============================================
// For Vercel serverless - export the app
// ============================================
// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`   Callback URL: ${REDIRECT_URI}`);
        console.log(`   Ready for authentication!\n`);
    });
}

export default app;
