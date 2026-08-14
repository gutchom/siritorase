const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30日
const OAUTH_STATE_TTL_SECONDS = 600; // 10分

export async function createSession(env: Env, userId: string): Promise<string> {
	const sessionId = crypto.randomUUID();
	await env.KV_BINDING.put(`session:${sessionId}`, userId, {
		expirationTtl: SESSION_TTL_SECONDS,
	});
	return sessionId;
}

export async function getSessionUserId(env: Env, sessionId: string): Promise<string | null> {
	return env.KV_BINDING.get(`session:${sessionId}`);
}

export async function destroySession(env: Env, sessionId: string): Promise<void> {
	await env.KV_BINDING.delete(`session:${sessionId}`);
}

export async function putOAuthState(env: Env, state: string, codeVerifier: string): Promise<void> {
	await env.KV_BINDING.put(`oauth:state:${state}`, codeVerifier, {
		expirationTtl: OAUTH_STATE_TTL_SECONDS,
	});
}

export async function consumeOAuthState(env: Env, state: string): Promise<string | null> {
	const codeVerifier = await env.KV_BINDING.get(`oauth:state:${state}`);
	if (codeVerifier !== null) {
		await env.KV_BINDING.delete(`oauth:state:${state}`);
	}
	return codeVerifier;
}
