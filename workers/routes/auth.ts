import { Hono, type Context } from 'hono';
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from '@supabase/ssr';
import { createSupabaseClient } from '../../app/lib/supabase.server';

const app = new Hono<{ Bindings: Env }>();

function setSupabaseCookie(
	c: Context<{ Bindings: Env }>,
	name: string,
	value: string,
	options: CookieOptions,
) {
	const { sameSite, ...rest } = options;
	setCookie(c, name, value, {
		...rest,
		sameSite: typeof sameSite === 'string' ? sameSite : undefined,
	});
}

app.get('/twitter/login', async (c) => {
	const supabase = createSupabaseClient(c.env, c.req.raw);
	const redirectTo = new URL('/auth/twitter/callback', c.req.url).toString();

	const { data, error } = await supabase.auth.signInWithOAuth({
		// Supabaseは 'twitter'(旧OAuth1.0a) と 'x'(新OAuth2.0) を別プロバイダとして扱う。
		// ダッシュボードで有効化したのは「X / Twitter (OAuth 2.0)」なので 'x' を指定する。
		provider: 'x',
		options: {
			redirectTo,
			// ツイート投稿はtweet intent URLで行うため書き込みスコープ(tweet.write/offline.access)は不要。
			// ただしX API v2の /2/users/me (Supabaseがプロフィール取得に使う) は users.read 単体だと
			// 403になり、tweet.read も合わせて要求する必要がある(いずれも読み取り専用スコープ)。
			scopes: 'users.read tweet.read',
		},
	});

	if (error || !data.url) {
		return c.text(`Failed to start login: ${error?.message ?? 'unknown error'}`, 500);
	}

	return c.redirect(data.url);
});

app.get('/twitter/callback', async (c) => {
	const oauthError = c.req.query('error');
	const oauthErrorDescription = c.req.query('error_description');
	if (oauthError) {
		return c.text(`OAuth error: ${oauthError} - ${oauthErrorDescription ?? '(no description)'}`, 400);
	}

	const code = c.req.query('code');
	if (!code) {
		return c.text(`Missing code. Full query: ${new URL(c.req.url).search}`, 400);
	}

	const supabase = createSupabaseClient(c.env, c.req.raw, (name, value, options) => {
		setSupabaseCookie(c, name, value, options);
	});

	const { error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) {
		return c.text(`Failed to complete login: ${error.message}`, 500);
	}

	return c.redirect('/');
});

app.post('/logout', async (c) => {
	const supabase = createSupabaseClient(c.env, c.req.raw, (name, value, options) => {
		setSupabaseCookie(c, name, value, options);
	});

	await supabase.auth.signOut();

	return c.redirect('/');
});

export default app;
