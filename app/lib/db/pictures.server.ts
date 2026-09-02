import { createSupabaseAdminClient } from "../supabase.server";

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

// Graph/Ancestorsの木構造描画に使う最小限の列。
type PictureNodeRow = Pick<
	PictureRow,
	"id" | "parent_id" | "title" | "image_key" | "user_id" | "created_at"
>;

const ALL_PICTURES_CACHE_KEY = "cache:pictures:all";
const ALL_PICTURES_CACHE_TTL_SECONDS = 60;

export async function getAncestors(
	env: Env,
	id: string,
): Promise<PictureRow[]> {
	const supabase = createSupabaseAdminClient(env);
	const { data, error } = await supabase.rpc("get_ancestors", {
		target_id: id,
	});
	if (error) {
		throw new Error(`Failed to get ancestors: ${error.message}`);
	}
	return data ?? [];
}

// 全pictures(しりとりマップの木構造描画に使う)は投稿が増えるほど肥大化する上、
// /reply/:postIdは投稿完了直後・共有ツイートリンクの双方からアクセスされる最頻出
// ページのため、素朴に毎回DBへ問い合わせるとアクセスの度に全件フルスキャン相当の
// クエリが発生してしまう。KVに短TTLでキャッシュし、新規投稿時(createPicture)には
// 明示的にキャッシュを破棄することで、投稿直後でも古いデータを見せずにDBへの
// 問い合わせ回数を削減する。
export async function getAllPictures(env: Env): Promise<PictureNodeRow[]> {
	const cached = await env.KV_BINDING.get(ALL_PICTURES_CACHE_KEY, "json");
	if (cached) {
		return cached as PictureNodeRow[];
	}

	const supabase = createSupabaseAdminClient(env);
	const { data, error } = await supabase
		.from("pictures")
		.select("id, parent_id, title, image_key, user_id, created_at")
		.order("created_at");
	if (error) {
		throw new Error(`Failed to get pictures: ${error.message}`);
	}

	const rows = data ?? [];
	await env.KV_BINDING.put(ALL_PICTURES_CACHE_KEY, JSON.stringify(rows), {
		expirationTtl: ALL_PICTURES_CACHE_TTL_SECONDS,
	});
	return rows;
}

export async function getPicture(
	env: Env,
	id: string,
): Promise<PictureRow | null> {
	const supabase = createSupabaseAdminClient(env);
	const { data, error } = await supabase
		.from("pictures")
		.select("*")
		.eq("id", id)
		.maybeSingle();
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
	const { error } = await supabase.rpc("create_picture", {
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

	// 投稿直後にリダイレクトする/reply/:newIdでも自分の投稿を含んだ最新のマップを
	// 見せるため、getAllPicturesのキャッシュを即時破棄する。
	await env.KV_BINDING.delete(ALL_PICTURES_CACHE_KEY);
}

export async function setPictureTweetInfo(
	env: Env,
	id: string,
	tweetId: string,
	tweetScreenName: string,
): Promise<void> {
	const supabase = createSupabaseAdminClient(env);
	const { error } = await supabase
		.from("pictures")
		.update({ tweet_id: tweetId, tweet_screen_name: tweetScreenName })
		.eq("id", id);
	if (error) {
		throw new Error(`Failed to set picture tweet info: ${error.message}`);
	}
}
