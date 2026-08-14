import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { upsertUser } from '../../app/lib/db/users.server';
import { generateCodeChallenge, generateCodeVerifier, generateState } from '../lib/pkce';
import { consumeOAuthState, createSession, destroySession, putOAuthState } from '../lib/session';
import { buildAuthorizeUrl, exchangeCodeForToken, fetchTwitterUser } from '../lib/twitterOAuth';

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30日

const app = new Hono<{ Bindings: Env }>();

app.get('/twitter/login', async (c) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge(codeVerifier);

	await putOAuthState(c.env, state, codeVerifier);

	return c.redirect(buildAuthorizeUrl(c.env, state, codeChallenge));
});

app.get('/twitter/callback', async (c) => {
	const code = c.req.query('code');
	const state = c.req.query('state');
	if (!code || !state) {
		return c.text('Missing code or state', 400);
	}

	const codeVerifier = await consumeOAuthState(c.env, state);
	if (!codeVerifier) {
		return c.text('Invalid or expired state', 400);
	}

	const tokens = await exchangeCodeForToken(c.env, code, codeVerifier);
	const twitterUser = await fetchTwitterUser(tokens.accessToken);

	await upsertUser(c.env.DB, {
		id: twitterUser.id,
		username: twitterUser.username,
		name: twitterUser.name,
		profileImageUrl: twitterUser.profileImageUrl,
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
		tokenExpiresAt: tokens.expiresAt,
	});

	const sessionId = await createSession(c.env, twitterUser.id);

	setCookie(c, 'session_id', sessionId, {
		httpOnly: true,
		secure: new URL(c.req.url).protocol === 'https:',
		sameSite: 'Lax',
		path: '/',
		maxAge: SESSION_COOKIE_MAX_AGE,
	});

	return c.redirect('/');
});

app.post('/logout', async (c) => {
	const sessionId = getCookie(c, 'session_id');
	if (sessionId) {
		await destroySession(c.env, sessionId);
	}
	deleteCookie(c, 'session_id', { path: '/' });

	return c.redirect('/');
});

export default app;
