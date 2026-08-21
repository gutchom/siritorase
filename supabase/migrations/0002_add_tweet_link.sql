-- ツイート手動リンク機能用: 投稿後にユーザーが貼り付けたツイートURLから
-- tweet_id/tweet_screen_nameを保存し、次の続きを描いた人がそのツイートへの
-- 返信としてスレッド化できるようにする(自動投稿APIは使わないため手動連携)。
alter table pictures add column tweet_id text;
alter table pictures add column tweet_screen_name text;

-- get_ancestorsの戻り値にtweet_id/tweet_screen_nameを追加(0001で定義したものを置き換え)。
-- 戻り値の型(列構成)が変わるためcreate or replaceは使えず、一度dropしてから作り直す。
drop function if exists get_ancestors(text);

create function get_ancestors(target_id text)
returns table (
	id text,
	parent_id text,
	title text,
	image_key text,
	ogp_key text,
	user_id uuid,
	children_count integer,
	created_at timestamptz,
	tweet_id text,
	tweet_screen_name text,
	depth integer
)
language sql
stable
as $$
	with recursive ancestors as (
		select p.id, p.parent_id, p.title, p.image_key, p.ogp_key, p.user_id, p.children_count, p.created_at, p.tweet_id, p.tweet_screen_name, 0 as depth
		from pictures p
		where p.id = target_id
		union all
		select p.id, p.parent_id, p.title, p.image_key, p.ogp_key, p.user_id, p.children_count, p.created_at, p.tweet_id, p.tweet_screen_name, a.depth + 1
		from pictures p
		join ancestors a on p.id = a.parent_id
	)
	select * from ancestors order by depth desc;
$$;
