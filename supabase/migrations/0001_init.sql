create table pictures (
	id text primary key,
	parent_id text references pictures(id),
	title text not null,
	image_key text not null,
	ogp_key text not null,
	user_id uuid references auth.users(id),
	children_count integer not null default 0,
	created_at timestamptz not null default now()
);

create index idx_pictures_parent_id on pictures(parent_id);
create index idx_pictures_user_id on pictures(user_id);

-- RLS: このテーブルへのアクセスはWorkersバックエンドからservice_roleキー経由でのみ行う
-- (ブラウザから直接anonキーでアクセスすることは想定していない)ため、
-- 有効化した上でポリシーは一切追加しない(= service_role以外は全拒否)。
alter table pictures enable row level security;

-- 対象idから祖先チェーンをroot→対象の順で返す(depth降順)
create or replace function get_ancestors(target_id text)
returns table (
	id text,
	parent_id text,
	title text,
	image_key text,
	ogp_key text,
	user_id uuid,
	children_count integer,
	created_at timestamptz,
	depth integer
)
language sql
stable
as $$
	with recursive ancestors as (
		select p.id, p.parent_id, p.title, p.image_key, p.ogp_key, p.user_id, p.children_count, p.created_at, 0 as depth
		from pictures p
		where p.id = target_id
		union all
		select p.id, p.parent_id, p.title, p.image_key, p.ogp_key, p.user_id, p.children_count, p.created_at, a.depth + 1
		from pictures p
		join ancestors a on p.id = a.parent_id
	)
	select * from ancestors order by depth desc;
$$;

-- 投稿の作成 + 親のchildren_countインクリメントを1トランザクションで実行
create or replace function create_picture(
	p_id text,
	p_parent_id text,
	p_title text,
	p_image_key text,
	p_ogp_key text,
	p_user_id uuid
)
returns void
language plpgsql
as $$
begin
	insert into pictures (id, parent_id, title, image_key, ogp_key, user_id)
	values (p_id, p_parent_id, p_title, p_image_key, p_ogp_key, p_user_id);

	if p_parent_id is not null then
		update pictures set children_count = children_count + 1 where id = p_parent_id;
	end if;
end;
$$;
