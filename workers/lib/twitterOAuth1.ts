import crypto from 'node:crypto';
import OAuth from 'oauth-1.0a';

export type TwitterUser = {
	id: string;
	username: string;
	name: string;
	profileImageUrl: string | null;
};

function createClient(env: Env): OAuth {
	return new OAuth({
		consumer: { key: env.TWITTER_API_KEY, secret: env.TWITTER_API_KEY_SECRET },
		signature_method: 'HMAC-SHA1',
		hash_function(baseString, key) {
			return crypto.createHmac('sha1', key).update(baseString).digest('base64');
		},
	});
}

export async function getRequestToken(
	env: Env,
	callbackUrl: string,
): Promise<{ oauthToken: string; oauthTokenSecret: string }> {
	const client = createClient(env);
	const url = 'https://api.x.com/oauth/request_token';
	const authHeader = client.toHeader(
		client.authorize({ url, method: 'POST', data: { oauth_callback: callbackUrl } }),
	);

	const response = await fetch(url, { method: 'POST', headers: { ...authHeader } });
	if (!response.ok) {
		throw new Error(`Failed to get request token: ${response.status} ${await response.text()}`);
	}

	const params = new URLSearchParams(await response.text());
	const oauthToken = params.get('oauth_token');
	const oauthTokenSecret = params.get('oauth_token_secret');
	if (!oauthToken || !oauthTokenSecret) {
		throw new Error('Unexpected request_token response: missing oauth_token(_secret)');
	}

	return { oauthToken, oauthTokenSecret };
}

export function buildAuthorizeUrl(oauthToken: string): string {
	const url = new URL('https://api.x.com/oauth/authorize');
	url.searchParams.set('oauth_token', oauthToken);
	return url.toString();
}

export async function getAccessToken(
	env: Env,
	oauthToken: string,
	oauthTokenSecret: string,
	oauthVerifier: string,
): Promise<TwitterUser> {
	const client = createClient(env);
	const url = 'https://api.x.com/oauth/access_token';
	const authHeader = client.toHeader(
		client.authorize(
			{ url, method: 'POST', data: { oauth_verifier: oauthVerifier } },
			{ key: oauthToken, secret: oauthTokenSecret },
		),
	);

	const response = await fetch(url, { method: 'POST', headers: { ...authHeader } });
	if (!response.ok) {
		throw new Error(`Failed to get access token: ${response.status} ${await response.text()}`);
	}

	const params = new URLSearchParams(await response.text());
	const userId = params.get('user_id');
	const screenName = params.get('screen_name');
	const accessToken = params.get('oauth_token');
	const accessTokenSecret = params.get('oauth_token_secret');
	if (!userId || !screenName || !accessToken || !accessTokenSecret) {
		throw new Error('Unexpected access_token response: missing fields');
	}

	// name/アイコンの取得(account lookup)は無料枠で使えない可能性があるため、
	// 失敗してもログイン自体は成立させ、id/usernameのみで継続する。
	const profile = await tryFetchProfile(env, accessToken, accessTokenSecret);

	return {
		id: userId,
		username: screenName,
		name: profile?.name ?? screenName,
		profileImageUrl: profile?.profileImageUrl ?? null,
	};
}

async function tryFetchProfile(
	env: Env,
	accessToken: string,
	accessTokenSecret: string,
): Promise<{ name: string; profileImageUrl: string | null } | null> {
	try {
		const client = createClient(env);
		const url = 'https://api.x.com/1.1/account/verify_credentials.json';
		const authHeader = client.toHeader(
			client.authorize({ url, method: 'GET' }, { key: accessToken, secret: accessTokenSecret }),
		);
		const response = await fetch(url, { headers: { ...authHeader } });
		if (!response.ok) {
			return null;
		}
		const data = (await response.json()) as {
			name?: string;
			profile_image_url_https?: string;
		};
		return { name: data.name ?? '', profileImageUrl: data.profile_image_url_https ?? null };
	} catch {
		return null;
	}
}
