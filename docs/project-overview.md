# しりとらせ (siritorase) — プロジェクト概要

> このドキュメントは、後続のエージェント/開発者がこのリポジトリの状況を素早く把握できるようにするための引き継ぎメモです。
> 作成日: 2026-08-15。Cloudflare(Workers/R2) + Supabase(Auth/Postgres) 構成への移行完了時点の状態を記述。

## 1. プロダクトの概要

「しりとらせ」は Twitter（X）上でお絵描きしりとりをするサービス。

- ユーザーは直前の絵（末尾のお題）を見ながら、その続きとなる絵を描いて投稿する。
- 投稿は「祖先（ancestors）」を辿れる木構造になっており、`/graph` で家系図的なネットワーク図として全体像を閲覧できる。
- 投稿すると OGP 画像（直前の絵＋今回の絵を合成したもの）が生成され、Xの **tweet intent URL**（`twitter.com/intent/tweet`）を開くことでツイートできる（自前のツイート投稿APIは持たない）。

## 2. 現在の状態

**一連のフローが実際のSupabaseプロジェクトに対してローカル(`wrangler dev`)で動作確認済みです。** 投稿→Supabase Postgres保存→R2アップロード→祖先チェーン取得→Graph表示→ログインリダイレクトまで実地確認済み。`npm run build` も成功。

未検証なのは以下:
- 本番Cloudflareへのデプロイ（実リソース作成が必要、5節）
- Supabase Authでの実際のログイン完了（`/auth/twitter/login`のリダイレクトURL組み立てまでは確認済みだが、ブラウザでのログイン完了は未実施）

## 3. アーキテクチャ（重要な経緯）

途中でインフラ方針を変更している。**最初はCloudflareネイティブ（D1 + 自前OAuth2+PKCE + Workers上でのX API直接呼び出し）で実装したが、その後ユーザーの意向でDB/認証をSupabaseに置き換えた。** D1・自前OAuth実装・ツイート投稿APIのコードは既に削除済み（git log 参照: 「D1/自前OAuthをSupabase Auth + Supabase Postgresに置き換え」のコミット以降が最終形）。

- **ランタイム**: Cloudflare Workers（`wrangler.jsonc` の `main` は `./workers/app.ts`）
- **フレームワーク**: React Router v7 (framework mode, SSR) + Vite（`@cloudflare/vite-plugin`）
- **サーバー**: Hono（`workers/app.ts`）。SSR以外の認証/画像配信を担当し、`app.all("*", ...)` でReact RouterのSSRハンドラに委譲（POSTも通す必要があるため `get` ではなく `all` にしている点に注意）。
- **データ**: **Supabase Postgres**（`pictures`テーブルのみ。usersテーブルは持たない。Supabase Authの`auth.users`で身元管理が完結するため）
- **画像ストレージ**: Cloudflare R2（`PICTURES_BUCKET`バインディング、絵/OGP画像。ここだけはCloudflareネイティブのまま）
- **認証**: **Supabase Auth** の X/Twitter (OAuth 2.0) プロバイダ。要求スコープは `users.read` のみ（ツイート投稿は tweet intent URL 方式のため `tweet.write`/`offline.access` は不要、Xのアクセストークンを自前で保存・リフレッシュする必要もない）
- **静的アセット**: `wrangler.jsonc` の `assets` バインディングで `public/` を配信

### ルーティング

| パス | ファイル | 役割 |
|---|---|---|
| `/` | `app/routes/home.tsx` | 入口画面（Introductionモーダル、/draw・/graphへの導線） |
| `/draw` | `app/routes/draw.tsx` (`id: draw-new`) | 新規にしりとりを始める（親なし投稿） |
| `/reply/:postId` | `app/routes/draw.tsx` (`id: draw-reply`) | 指定投稿の続きを描く（祖先チェーン表示） |
| `/graph` | `app/routes/graph.tsx` | 投稿ツリー全体の可視化(vis-network) |
| `GET /auth/twitter/login` | `workers/routes/auth.ts` | `supabase.auth.signInWithOAuth()` の認可URLへリダイレクト |
| `GET /auth/twitter/callback` | `workers/routes/auth.ts` | `supabase.auth.exchangeCodeForSession()` でセッションCookie発行 |
| `POST /auth/logout` | `workers/routes/auth.ts` | `supabase.auth.signOut()` |
| `GET /images/:type/:filename` | `workers/routes/images.ts` | R2から絵/OGP画像を配信 |

`/api/tweet` は存在しない（tweet intent URL方式のため不要）。

### データモデル（Supabase Postgres、`supabase/migrations/0001_init.sql`）

- `pictures`: id, parent_id, title, image_key, ogp_key, user_id(uuid, `auth.users`参照), children_count, created_at
- DB関数: `get_ancestors(target_id)`（祖先チェーンを再帰CTEで取得）、`create_picture(...)`（投稿作成+親の`children_count`インクリメントを1トランザクションで実行）
- RLSは有効化した上でポリシーなし（= service_role以外は全拒否）。全アクセスはWorkersバックエンドの `app/lib/supabase.server.ts` の管理者クライアント(service_roleキー)経由。
- **マイグレーションの適用方法**: Supabase CLIのリンク設定をしていないため、`supabase/migrations/0001_init.sql` の内容をSupabaseダッシュボードのSQL Editorに貼り付けて手動実行する運用（ユーザーが実施済み）。今後スキーマ変更する場合も同様の手動適用が必要（CLI連携を組む場合は別途 `supabase link` が要る）。

### 認証まわりの設計メモ

- `app/lib/supabase.server.ts`: 2種類のクライアントを提供。
  - `createSupabaseClient(env, request, onSetCookie?)`: `@supabase/ssr`ベース。Cookieからセッションを読み、`onSetCookie`が無い呼び出し（React Routerのloaderなど）ではセッションリフレッシュ用Cookieの再発行が反映されない制約が**意図的に残っている**（Hono側のルート `workers/routes/auth.ts` では `onSetCookie` を渡してちゃんとCookieを書き込む）。
  - `createSupabaseAdminClient(env)`: service_roleキー。`pictures`テーブルのRLSを迂回して読み書きする。
- `app/lib/auth.server.ts` の `getCurrentUser()`: `user.user_metadata` から `user_name`/`preferred_username`（ハンドル）、`full_name`/`name`、`avatar_url`/`picture`（アイコン）をフォールバック付きで読む。**Supabaseの公式ドキュメントにX/Twitter OAuth2プロバイダが`user_metadata`にどのフィールド名で情報を入れるかの明記が無く、未検証の推測** で書いている。実際にログインして`Header`のアイコン表示が正しく出るか確認が必要（5節参照）。

## 4. `app/features/*` の現状

旧 Next.js + Firebase実装から移植したUIコンポーネント群。整理済み。

| 状態 | 対象 |
|---|---|
| Firebase/Recoil/Next.js依存を除去し書き換え済み | `Drawing/*`(Recoil→`DrawingContext`のuseReducerに置換), `Graph/index.tsx`(`next/router`→`useNavigate`), `Header/Account.tsx`・`Introduction`(`lib/useAuth`→propsで受け取る`AuthUser`とOAuthリンクに置換) |
| Supabase移行に伴い簡略化 | `Tweet/index.tsx`: バックエンドAPI呼び出しをやめ、`createTweetIntentURL.ts`(既存ファイル)でintent URLを組み立てて新規タブで開くだけの実装に変更。ログイン状態のチェックも撤廃（tweet intentはこのサイトのログインと無関係にX側で完結するため） |
| Cloudflare非互換のため差し替え済み | `Tweet/Editor.tsx`: `html-react-parser` が Workers ランタイムで `TypeError: require_node is not a function` となり動作しなかったため、`dangerouslySetInnerHTML` によるプレビュー表示に変更 |
| そのまま流用 | `Ancestors`, `Modal`, `Drawing/utils/OGP/*`, `Graph/utils/*` |

## 5. 残っている作業・要確認事項

1. **実際のログイン完了の確認**: `/auth/twitter/login`からSupabase→Xの認可画面→コールバックまで、ブラウザで実際に最後まで通してログインできるか、`Header`にアイコンが表示されるか（3節の`user_metadata`フィールド名の推測が正しいか）を確認する。
2. **Cloudflareの実リソース作成**（本番デプロイ前）:
   - `wrangler login` でCloudflareアカウント認証（済んでいる場合は`wrangler whoami`で確認）
   - `npx wrangler r2 bucket create siritorase-pictures`
   - 本番用Secrets: `npx wrangler secret put SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`（ローカルは`.dev.vars`、gitignore対象）
3. **SupabaseダッシュボードでのX/Twitter (OAuth 2.0) プロバイダ設定**: 完了済み（Client ID/Secret登録、コールバックURL登録）。本番ドメインを追加する場合はSupabase側のリダイレクトURL許可リストにも追加が必要。
4. **tweet_id/tweet_user_idを使った返信スレッド化は廃止**: tweet intent方式では投稿後のツイートIDをアプリ側で取得できないため、「親投稿への返信として自動スレッド化する」機能は無い（`createTweetIntentURL.ts`自体は`in_reply_to`/`via`パラメータに対応しているが、呼び出し側で値を渡していない）。将来的に必要なら、ユーザーにツイートURLを手動貼り付けさせるなどの導線が要検討。

## 6. 開発コマンド

```bash
npm install                    # 依存インストール(postinstallでwrangler types実行)
npm run dev                     # ローカル開発サーバー(R2はMiniflareで自動ローカルバインディング)
npm run typecheck                # cf-typegen + react-router typegen + tsc -b
npm run build                     # react-router build
npm run preview                    # build + vite preview(本番相当のローカル確認)
npm run deploy                      # build + wrangler deploy(本番デプロイ。5節の準備が必要)
npm run format                       # biome check --write
```

Supabase側の確認（`.dev.vars`から読み込んだキーでSupabase REST APIを直接叩く例）:

```bash
source <(grep -v '^#' .dev.vars)
curl -s "$SUPABASE_URL/rest/v1/pictures?select=*" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

## 7. 既知の未対応事項

- `vis-network` を含むチャンク(`graph`)が527KB(gzip後161KB)とやや大きい。`npm run build` で警告が出るが、動的importでの分割は未実施。
- OGP背景画像(`public/img/ogp_background.png`)・デフォルトアイコン(`public/img/default_icon.png`)はプレースホルダー（単色PNG）。実際のデザインアセットへの差し替えは別タスク。
- Supabase CLIのプロジェクトリンク（`supabase link`）は行っていない。スキーマ変更は当面SQL Editorへの手動貼り付け運用。
