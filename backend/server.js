import express from 'express';
import axios from 'axios';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURATION
// ============================================
const PORT = process.env.PORT || 3001;
const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';

// IMPORTANT: Change this for production!
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://echoes-of-jannah.vercel.app/auth/callback'
  : 'http://localhost:3000/auth/callback';

const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';
const API_BASE_URL = 'https://apis-prelive.quran.foundation';

console.log('🔐 Quran Foundation Auth Server');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Redirect URI: ${REDIRECT_URI}`);

const tempAuthStore = new Map();

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
// ENDPOINT 1: Get Login URL
// ============================================
app.get('/api/auth/login-url', (req, res) => {
    console.log('[API] GET /api/auth/login-url');
    
    const { codeVerifier, codeChallenge } = generatePkcePair();
    const state = randomString(16);
    const nonce = randomString(16);

    tempAuthStore.set(state, { codeVerifier, nonce });

    setTimeout(() => tempAuthStore.delete(state), 5 * 60 * 1000);

    const authUrl = `${AUTH_BASE_URL}/oauth2/auth?` + new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid offline_access',
        state: state,
        nonce: nonce,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    });

    res.json({ url: authUrl });
});

// ============================================
// ENDPOINT 2: Exchange Code for Tokens
// ============================================
app.post('/api/auth/exchange', async (req, res) => {
    console.log('[API] POST /api/auth/exchange');
    const { code, state } = req.body;

    if (!code || !state) {
        return res.status(400).json({ error: 'Missing code or state' });
    }

    const pkceData = tempAuthStore.get(state);
    if (!pkceData) {
        return res.status(400).json({ error: 'Invalid or expired state' });
    }
    const { codeVerifier, nonce: expectedNonce } = pkceData;

    try {
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
        
        const idTokenPayload = JSON.parse(
            Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString()
        );

        if (idTokenPayload.nonce !== expectedNonce) {
            return res.status(400).json({ error: 'Invalid nonce' });
        }

        tempAuthStore.delete(state);

        const user = {
            id: idTokenPayload.sub,
            name: idTokenPayload.name || idTokenPayload.email?.split('@')[0] || 'Quran User',
            email: idTokenPayload.email,
        };

        console.log(`[AUTH] User ${user.id} logged in`);

        res.json({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            user: user,
        });
    } catch (error) {
        console.error('[AUTH] Exchange failed:', error.response?.data || error.message);
        res.status(500).json({ error: 'Token exchange failed' });
    }
});

// ============================================
// ENDPOINT 3: Refresh Token
// ============================================
app.post('/api/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Missing refresh token' });
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
// ENDPOINT 4: Logout
// ============================================
app.post('/api/auth/logout', (req, res) => {
    console.log('[AUTH] User logged out');
    res.json({ success: true });
});

// ============================================
// FOR VERCEL SERVERLESS (Keep this ONLY)
// ============================================
// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`   Callback URL: ${REDIRECT_URI}`);
    console.log(`   Ready for authentication!\n`);
  });
}

// For Vercel serverless - export the app
export default app;