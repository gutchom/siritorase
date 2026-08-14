export type TwitterTokens = {
	accessToken: string;
	refreshToken: string;
	expiresAt: Date;
};

export type TwitterUser = {
	id: string;
	username: string;
	name: string;
	profileImageUrl: string | null;
};

const SCOPES = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];

export function buildAuthorizeUrl(env: Env, state: string, codeChallenge: string): string {
	const url = new URL('https://twitter.com/i/oauth2/authorize');
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('client_id', env.TWITTER_CLIENT_ID);
	url.searchParams.set('redirect_uri', env.TWITTER_REDIRECT_URI);
	url.searchParams.set('scope', SCOPES.join(' '));
	url.searchParams.set('state', state);
	url.searchParams.set('code_challenge', codeChallenge);
	url.searchParams.set('code_challenge_method', 'S256');
	return url.toString();
}

function basicAuthHeader(env: Env): string {
	return `Basic ${btoa(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`)}`;
}

type TokenResponse = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
};

function toTokens(response: TokenResponse): TwitterTokens {
	return {
		accessToken: response.access_token,
		refreshToken: response.refresh_token,
		expiresAt: new Date(Date.now() + response.expires_in * 1000),
	};
}

export async function exchangeCodeForToken(
	env: Env,
	code: string,
	codeVerifier: string,
): Promise<TwitterTokens> {
	const response = await fetch('https://api.twitter.com/2/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: basicAuthHeader(env),
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: env.TWITTER_REDIRECT_URI,
			code_verifier: codeVerifier,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to exchange code for token: ${response.status} ${await response.text()}`);
	}

	return toTokens((await response.json()) as TokenResponse);
}

export async function refreshAccessToken(env: Env, refreshToken: string): Promise<TwitterTokens> {
	const response = await fetch('https://api.twitter.com/2/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: basicAuthHeader(env),
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to refresh token: ${response.status} ${await response.text()}`);
	}

	return toTokens((await response.json()) as TokenResponse);
}

export async function fetchTwitterUser(accessToken: string): Promise<TwitterUser> {
	const response = await fetch(
		'https://api.twitter.com/2/users/me?user.fields=profile_image_url',
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch twitter user: ${response.status} ${await response.text()}`);
	}

	const { data } = (await response.json()) as {
		data: { id: string; username: string; name: string; profile_image_url?: string };
	};

	return {
		id: data.id,
		username: data.username,
		name: data.name,
		profileImageUrl: data.profile_image_url ?? null,
	};
}
