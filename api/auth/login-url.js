// api/auth/login-url.js
// Vercel Serverless Function - Generates OAuth Login URL
// DO NOT commit secrets to GitHub! Use environment variables in production.

// Import crypto at the TOP (not inside the function)
import crypto from 'crypto';

export default async function handler(req, res) {
@@ -20,12 +20,12 @@ export default async function handler(req, res) {
return res.status(405).json({ error: 'Method not allowed' });
}

  // Your Quran Foundation credentials
  // Your Quran Foundation credentials (Pre-Production for testing)
const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  // PKCE helper functions (crypto is now available)
  // PKCE helper functions
function generatePkcePair() {
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto
@@ -44,7 +44,7 @@ export default async function handler(req, res) {
const state = randomString(16);
const nonce = randomString(16);

  // Store PKCE data in global memory
  // Store PKCE data in global memory (for serverless)
if (!global.__oauthStore) {
global.__oauthStore = {};
}
