function percentEncode(value: string): string {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}

async function hmacSha1(key: string, message: string): Promise<string> {
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(key),
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign'],
	);
	const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
	return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export type OAuth1Credentials = {
	consumerKey: string;
	consumerSecret: string;
	token?: string;
	tokenSecret?: string;
};

/**
 * OAuth 1.0a (HMAC-SHA1) の Authorization ヘッダーを組み立てる。
 * このプロジェクトではクエリ/ボディパラメータを持つリクエストは行わないため、
 * 署名対象はoauth_*パラメータ(extraParamsで渡すoauth_callback/oauth_verifierを含む)のみ。
 */
export async function buildOAuth1AuthorizationHeader(
	method: string,
	url: string,
	credentials: OAuth1Credentials,
	extraParams: Record<string, string> = {},
): Promise<string> {
	const oauthParams: Record<string, string> = {
		oauth_consumer_key: credentials.consumerKey,
		oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
		oauth_version: '1.0',
		...(credentials.token ? { oauth_token: credentials.token } : {}),
		...extraParams,
	};

	const paramString = Object.keys(oauthParams)
		.sort()
		.map((key) => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
		.join('&');

	const signatureBase = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
	const signingKey = `${percentEncode(credentials.consumerSecret)}&${percentEncode(credentials.tokenSecret ?? '')}`;
	const signature = await hmacSha1(signingKey, signatureBase);

	const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
	return `OAuth ${Object.keys(headerParams)
		.sort()
		.map((key) => `${percentEncode(key)}="${percentEncode(headerParams[key])}"`)
		.join(', ')}`;
}
