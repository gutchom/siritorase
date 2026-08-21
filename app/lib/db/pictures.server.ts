import { createSupabaseAdminClient } from '../supabase.server';

export type PictureRow = {
	id: string;
	parent_id: string | null;
	title: string;
	image_key: string;
	ogp_key: string;
	user_id: string | null;
	children_count: number;
	created_at: string;
	tweet_id: string | null;
	tweet_screen_name: string | null;
};

export async function getAncestors(env: Env, id: string): Promise<PictureRow[]> {
	const supabase = createSupabaseAdminClient(env);
	const { data, error } = await supabase.rpc('get_ancestors', { target_id: id });
	if (error) {
		throw new Error(`Failed to get ancestors: ${error.message}`);
	}
	return data ?? [];
}

export async function getAllPictures(env: Env): Promise<PictureRow[]> {
	const supabase = createSupabaseAdminClient(env);
	const { data, error } = await supabase.from('pictures').select('*').order('created_at');
	if (error) {
		throw new Error(`Failed to get pictures: ${error.message}`);
	}
	return data ?? [];
}

export async function getPicture(env: Env, id: string): Promise<PictureRow | null> {
	const supabase = createSupabaseAdminClient(env);
	const { data, error } = await supabase.from('pictures').select('*').eq('id', id).maybeSingle();
	if (error) {
		throw new Error(`Failed to get picture: ${error.message}`);
	}
	return data;
}

export async function createPicture(
	env: Env,
	input: {
		id: string;
		parentId: string | null;
		title: string;
		imageKey: string;
		ogpKey: string;
		userId?: string | null;
	},
): Promise<void> {
	const supabase = createSupabaseAdminClient(env);
	const { error } = await supabase.rpc('create_picture', {
		p_id: input.id,
		p_parent_id: input.parentId,
		p_title: input.title,
		p_image_key: input.imageKey,
		p_ogp_key: input.ogpKey,
		p_user_id: input.userId ?? null,
	});
	if (error) {
		throw new Error(`Failed to create picture: ${error.message}`);
	}
}

export async function setPictureTweetInfo(
	env: Env,
	id: string,
	tweetId: string,
	tweetScreenName: string,
): Promise<void> {
	const supabase = createSupabaseAdminClient(env);
	const { error } = await supabase
		.from('pictures')
		.update({ tweet_id: tweetId, tweet_screen_name: tweetScreenName })
		.eq('id', id);
	if (error) {
		throw new Error(`Failed to set picture tweet info: ${error.message}`);
	}
}
