import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { consumeOAuth1RequestSecret, createSession, destroySession, putOAuth1RequestSecret } from '../lib/session';
import { buildAuthorizeUrl, getAccessToken, getRequestToken } from '../lib/twitterOAuth1';

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30日

const app = new Hono<{ Bindings: Env }>();

app.get('/twitter/login', async (c) => {
	const callbackUrl = new URL('/auth/twitter/callback', c.req.url).toString();

	const { oauthToken, oauthTokenSecret } = await getRequestToken(c.env, callbackUrl);
	await putOAuth1RequestSecret(c.env, oauthToken, oauthTokenSecret);

	return c.redirect(buildAuthorizeUrl(oauthToken));
});

app.get('/twitter/callback', async (c) => {
	if (c.req.query('denied')) {
		return c.redirect('/');
	}

	const oauthToken = c.req.query('oauth_token');
	const oauthVerifier = c.req.query('oauth_verifier');
	if (!oauthToken || !oauthVerifier) {
		return c.text('Missing oauth_token or oauth_verifier', 400);
	}

	const oauthTokenSecret = await consumeOAuth1RequestSecret(c.env, oauthToken);
	if (!oauthTokenSecret) {
		return c.text('Invalid or expired request token', 400);
	}

	const twitterUser = await getAccessToken(c.env, oauthToken, oauthTokenSecret, oauthVerifier);
	const sessionId = await createSession(c.env, twitterUser);

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
