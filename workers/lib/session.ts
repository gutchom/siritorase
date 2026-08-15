import type { TwitterUser } from './twitterOAuth1';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30日
const REQUEST_TOKEN_TTL_SECONDS = 600; // 10分

export async function createSession(env: Env, user: TwitterUser): Promise<string> {
	const sessionId = crypto.randomUUID();
	await env.KV_BINDING.put(`session:${sessionId}`, JSON.stringify(user), {
		expirationTtl: SESSION_TTL_SECONDS,
	});
	return sessionId;
}

export async function getSessionUser(env: Env, sessionId: string): Promise<TwitterUser | null> {
	const value = await env.KV_BINDING.get(`session:${sessionId}`);
	return value ? (JSON.parse(value) as TwitterUser) : null;
}

export async function destroySession(env: Env, sessionId: string): Promise<void> {
	await env.KV_BINDING.delete(`session:${sessionId}`);
}

export async function putOAuth1RequestSecret(
	env: Env,
	oauthToken: string,
	oauthTokenSecret: string,
): Promise<void> {
	await env.KV_BINDING.put(`oauth1:request:${oauthToken}`, oauthTokenSecret, {
		expirationTtl: REQUEST_TOKEN_TTL_SECONDS,
	});
}

export async function consumeOAuth1RequestSecret(env: Env, oauthToken: string): Promise<string | null> {
	const secret = await env.KV_BINDING.get(`oauth1:request:${oauthToken}`);
	if (secret !== null) {
		await env.KV_BINDING.delete(`oauth1:request:${oauthToken}`);
	}
	return secret;
}
