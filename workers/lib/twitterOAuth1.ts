import { buildOAuth1AuthorizationHeader, type OAuth1Credentials } from './oauth1';

export type TwitterUser = {
	id: string;
	username: string;
	name: string;
	profileImageUrl: string | null;
};

function credentials(env: Env, token?: string, tokenSecret?: string): OAuth1Credentials {
	return {
		consumerKey: env.TWITTER_API_KEY,
		consumerSecret: env.TWITTER_API_KEY_SECRET,
		token,
		tokenSecret,
	};
}

export async function getRequestToken(
	env: Env,
	callbackUrl: string,
): Promise<{ oauthToken: string; oauthTokenSecret: string }> {
	const url = 'https://api.twitter.com/oauth/request_token';
	const authHeader = await buildOAuth1AuthorizationHeader('POST', url, credentials(env), {
		oauth_callback: callbackUrl,
	});

	const response = await fetch(url, { method: 'POST', headers: { Authorization: authHeader } });
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
	const url = new URL('https://api.twitter.com/oauth/authorize');
	url.searchParams.set('oauth_token', oauthToken);
	return url.toString();
}

export async function getAccessToken(
	env: Env,
	oauthToken: string,
	oauthTokenSecret: string,
	oauthVerifier: string,
): Promise<TwitterUser> {
	const url = 'https://api.twitter.com/oauth/access_token';
	const authHeader = await buildOAuth1AuthorizationHeader(
		'POST',
		url,
		credentials(env, oauthToken, oauthTokenSecret),
		{ oauth_verifier: oauthVerifier },
	);

	const response = await fetch(url, { method: 'POST', headers: { Authorization: authHeader } });
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
		const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
		const authHeader = await buildOAuth1AuthorizationHeader(
			'GET',
			url,
			credentials(env, accessToken, accessTokenSecret),
		);
		const response = await fetch(url, { headers: { Authorization: authHeader } });
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
