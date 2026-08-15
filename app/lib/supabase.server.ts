import { createClient } from '@supabase/supabase-js';

/**
 * service_roleキーを使う管理者クライアント。RLSを迂回してpicturesテーブルにアクセスする。
 * ユーザー認証はSupabase Authを使わず自前のX(Twitter) OAuth2+PKCE実装(workers/lib/*)で
 * 行っているため、このクライアントはDBアクセス専用。
 */
export function createSupabaseAdminClient(env: Env) {
	return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false },
	});
}
