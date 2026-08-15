import { createSupabaseClient } from './supabase.server';

export type AuthUser = {
	id: string;
	username: string | null;
	name: string | null;
	profileImageUrl: string | null;
};

export async function getCurrentUser(request: Request, env: Env): Promise<AuthUser | null> {
	const supabase = createSupabaseClient(env, request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const metadata = user.user_metadata ?? {};

	return {
		id: user.id,
		username: metadata.user_name ?? metadata.preferred_username ?? null,
		name: metadata.full_name ?? metadata.name ?? null,
		profileImageUrl: metadata.avatar_url ?? metadata.picture ?? null,
	};
}
