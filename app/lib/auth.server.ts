import { getSessionUserId } from '../../workers/lib/session';

export type AuthUser = {
	id: string;
	username: string;
	name: string;
	profileImageUrl: string | null;
};

type UserRow = {
	id: string;
	username: string;
	name: string;
	profile_image_url: string | null;
};

function getSessionIdFromRequest(request: Request): string | null {
	const cookieHeader = request.headers.get('Cookie');
	if (!cookieHeader) {
		return null;
	}
	const match = cookieHeader
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith('session_id='));
	return match ? decodeURIComponent(match.slice('session_id='.length)) : null;
}

export async function getCurrentUser(request: Request, env: Env): Promise<AuthUser | null> {
	const sessionId = getSessionIdFromRequest(request);
	if (!sessionId) {
		return null;
	}

	const userId = await getSessionUserId(env, sessionId);
	if (!userId) {
		return null;
	}

	const row = await env.DB.prepare(
		'SELECT id, username, name, profile_image_url FROM users WHERE id = ?1',
	)
		.bind(userId)
		.first<UserRow>();

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		username: row.username,
		name: row.name,
		profileImageUrl: row.profile_image_url,
	};
}
