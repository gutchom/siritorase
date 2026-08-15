import { getSessionUser } from '../../workers/lib/session';

export type AuthUser = {
	id: string;
	username: string;
	name: string;
	profileImageUrl: string | null;
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
	return getSessionUser(env, sessionId);
}
