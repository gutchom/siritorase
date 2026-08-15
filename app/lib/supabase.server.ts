import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function parseCookies(cookieHeader: string | null): { name: string; value: string }[] {
	if (!cookieHeader) {
		return [];
	}
	return cookieHeader
		.split(';')
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => {
			const [name, ...rest] = part.split('=');
			return { name, value: decodeURIComponent(rest.join('=')) };
		});
}

/**
 * ユーザーのCookieに紐づくSupabaseクライアント。認証セッションの読み取り・更新に使う。
 * onSetCookie を渡さない呼び出し元(React Routerのloaderなど、レスポンスヘッダーを
 * 自由に操作できない箇所)では、セッションのリフレッシュCookieが反映されない制約がある。
 */
export function createSupabaseClient(
	env: Env,
	request: Request,
	onSetCookie?: (name: string, value: string, options: CookieOptions) => void,
) {
	return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => parseCookies(request.headers.get('Cookie')),
			setAll: (cookies) => {
				for (const { name, value, options } of cookies) {
					onSetCookie?.(name, value, options);
				}
			},
		},
	});
}

/**
 * service_roleキーを使う管理者クライアント。RLSを迂回してpicturesテーブルにアクセスする。
 * Workersバックエンドからのみ使用し、ブラウザに公開してはならない。
 */
export function createSupabaseAdminClient(env: Env) {
	return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false },
	});
}
