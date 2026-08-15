export type TwitterUser = {
	id: string;
	username: string;
	name: string;
	profileImageUrl: string | null;
};

// メールアドレス等は不要で、Header表示用のプロフィール取得のみに使うため
// 読み取り専用スコープのみを要求する(offline.accessも不要: アクセストークンは
// ログイン直後の1回のプロフィール取得にしか使わず、保存・リフレッシュはしない)
const SCOPES = ['users.read', 'tweet.read'];

export function buildAuthorizeUrl(
	env: Env,
	redirectUri: string,
	state: string,
	codeChallenge: string,
): string {
	const url = new URL('https://twitter.com/i/oauth2/authorize');
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('client_id', env.TWITTER_CLIENT_ID);
	url.searchParams.set('redirect_uri', redirectUri);
	url.searchParams.set('scope', SCOPES.join(' '));
	url.searchParams.set('state', state);
	url.searchParams.set('code_challenge', codeChallenge);
	url.searchParams.set('code_challenge_method', 'S256');
	return url.toString();
}

function basicAuthHeader(env: Env): string {
	return `Basic ${btoa(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`)}`;
}

export async function exchangeCodeForToken(
	env: Env,
	code: string,
	codeVerifier: string,
	redirectUri: string,
): Promise<string> {
	const response = await fetch('https://api.twitter.com/2/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: basicAuthHeader(env),
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri,
			code_verifier: codeVerifier,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to exchange code for token: ${response.status} ${await response.text()}`);
	}

	const { access_token } = (await response.json()) as { access_token: string };
	return access_token;
}

export async function fetchTwitterUser(accessToken: string): Promise<TwitterUser> {
	const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

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
