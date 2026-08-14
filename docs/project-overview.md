# しりとらせ (siritorase) — プロジェクト概要

> このドキュメントは、後続のエージェント/開発者がこのリポジトリの状況を素早く把握できるようにするための引き継ぎメモです。
> 作成日: 2026-08-14。Cloudflareネイティブ移行(Phase 0〜5)完了時点の状態を記述。

## 1. プロダクトの概要

「しりとらせ」は Twitter（X）上でお絵描きしりとりをするサービス。

- ユーザーは直前の絵（末尾のお題）を見ながら、その続きとなる絵を描いて投稿する。
- 投稿は「祖先（ancestors）」を辿れる木構造になっており、`/graph` で家系図的なネットワーク図として全体像を閲覧できる。
- 投稿すると OGP 画像（直前の絵＋今回の絵を合成したもの）が生成され、X にログイン後ツイートできる。

## 2. 現在の状態

**Cloudflareネイティブ構成への書き換えが完了し、ローカル環境(`wrangler dev`/`npm run build && npm run preview`)では一連のフローが動作する状態です。** ただし以下の2点は実クレデンシャルが無いため未検証です。

1. **Cloudflareの実リソース**: D1データベース・R2バケットはローカル(`--local`)でのみ動作確認済み。本番デプロイには実アカウントでの `wrangler login` → `wrangler d1 create` / `wrangler r2 bucket create` が必要（詳細は 5節）。
2. **X (Twitter) OAuth**: `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` が未設定（`.dev.vars` はプレースホルダー空文字）のため、ログイン以降のフロー(トークン交換・ツイート投稿)は実際のXアプリ登録後でないと検証できない。特にメディアアップロード(OGP画像添付)がOAuth2ユーザーコンテキストで通るかは未確認のリスクとして残っている（`workers/lib/twitterTweet.ts` にコメントあり）。

それ以外（投稿保存、画像アップロード/配信、祖先ツリー表示、Graph表示、ログイン導線のUI/リダイレクト、`/api/tweet` の認証ゲート）はローカルで実地確認済み。

## 3. アーキテクチャ

- **ランタイム**: Cloudflare Workers（`wrangler.jsonc` の `main` は `./workers/app.ts`）
- **フレームワーク**: React Router v7 (framework mode, SSR) + Vite（`@cloudflare/vite-plugin`）
- **サーバー**: Hono（`workers/app.ts`）。SSR以外のAPI/認証/画像配信を担当し、`app.all("*", ...)` でReact RouterのSSRハンドラに委譲（POSTも通す必要があるため `get` ではなく `all` にしている点に注意）。
- **データ**: D1(`DB`バインディング, `users`/`pictures`テーブル) + R2(`PICTURES_BUCKET`バインディング, 絵/OGP画像) + KV(`KV_BINDING`, OAuth state・セッション)
- **認証**: X OAuth 2.0 + PKCEをWorkers上に自前実装（外部ライブラリ不使用、Web Crypto使用）
- **静的アセット**: `wrangler.jsonc` の `assets` バインディングで `public/` を配信

### ルーティング

| パス | ファイル | 役割 |
|---|---|---|
| `/` | `app/routes/home.tsx` | 入口画面（Introductionモーダル、/draw・/graphへの導線） |
| `/draw` | `app/routes/draw.tsx` (`id: draw-new`) | 新規にしりとりを始める（親なし投稿） |
| `/reply/:postId` | `app/routes/draw.tsx` (`id: draw-reply`) | 指定投稿の続きを描く（祖先チェーン表示） |
| `/graph` | `app/routes/graph.tsx` | 投稿ツリー全体の可視化(vis-network) |
| `GET/POST /auth/twitter/*`, `POST /auth/logout` | `workers/routes/auth.ts` | OAuthログイン/コールバック/ログアウト |
| `POST /api/tweet` | `workers/routes/api.ts` | ツイート投稿(OGP画像添付) |
| `GET /images/:type/:filename` | `workers/routes/images.ts` | R2から絵/OGP画像を配信 |

### データモデル（D1、`migrations/0001_init.sql`）

- `pictures`: id, parent_id, title, image_key, ogp_key, tweet_id, tweet_user_id, user_id, children_count, created_at
- `users`: id(X user id), username, name, profile_image_url, access_token, refresh_token, token_expires_at

祖先チェーンは非正規化コピーを持たず、`app/lib/db/pictures.server.ts` の `getAncestors()` が再帰CTEで都度組み立てる。

## 4. `app/features/*` の現状

旧 Next.js + Firebase実装から移植したUIコンポーネント群。Cloudflareネイティブ化の過程で以下のように整理済み。

| 状態 | 対象 |
|---|---|
| Firebase/Recoil/Next.js依存を除去し書き換え済み | `Drawing/*`(Recoil→`DrawingContext`のuseReducerに置換), `Graph/index.tsx`(`next/router`→`useNavigate`), `Header/Account.tsx`・`Introduction`・`Tweet/index.tsx`(`lib/useAuth`→propsで受け取る`AuthUser`とOAuthリンクに置換) |
| Cloudflare非互換のため差し替え済み | `Tweet/Editor.tsx`: `html-react-parser` が Workers ランタイムで `TypeError: require_node is not a function` となり動作しなかったため、`dangerouslySetInnerHTML` によるプレビュー表示に変更 |
| そのまま流用 | `Ancestors`, `Modal`, `Drawing/utils/OGP/*`, `Graph/utils/*` |

## 5. 本番デプロイ前にユーザーが行う必要がある作業

エージェント側では実行できない（アカウント権限が必要な）作業です。

1. **Cloudflareアカウント認証**: `wrangler login`（未認証の場合、`wrangler whoami` で確認可能）
2. **D1データベースの作成**: `npx wrangler d1 create siritorase-db` → 出力される `database_id` を `wrangler.jsonc` の `d1_databases[0].database_id`（現在プレースホルダー `00000000-0000-0000-0000-000000000000`）に反映し、`npx wrangler d1 migrations apply siritorase-db --remote` を実行
3. **R2バケットの作成**: `npx wrangler r2 bucket create siritorase-pictures`
4. **X Developer Portalでのアプリ登録**: OAuth 2.0 (PKCE対応) のクライアントを作成し、`TWITTER_CLIENT_ID`/`TWITTER_CLIENT_SECRET` を取得。コールバックURL（ローカル: `http://localhost:5173/auth/twitter/callback`、本番: 実際のデプロイ先ドメイン）を登録
5. **Secretsの設定**:
   - ローカル: `.dev.vars`（`.dev.vars.example` をコピーして値を埋める。gitignore対象）
   - 本番: `npx wrangler secret put TWITTER_CLIENT_ID` / `npx wrangler secret put TWITTER_CLIENT_SECRET`、`TWITTER_REDIRECT_URI` は `wrangler.jsonc` の `vars` または環境別設定に本番ドメインで追加
6. **ツイートメディアアップロードの実地検証**: `workers/lib/twitterTweet.ts` の `uploadMedia()` はOAuth2ユーザーコンテキストでの `v1.1 media/upload` 呼び出しを前提にしているが、X API仕様の変遷により失敗する可能性がある。失敗する場合はOAuth1.0a署名の実装が別途必要（要調査）。

## 6. 開発コマンド

```bash
npm install                                        # 依存インストール(postinstallでwrangler types実行)
npm run dev                                         # ローカル開発サーバー(D1/R2/KVはMiniflareで自動ローカルバインディング)
npm run typecheck                                   # cf-typegen + react-router typegen + tsc -b
npm run build                                        # react-router build
npm run preview                                      # build + vite preview(本番相当のローカル確認)
npm run deploy                                       # build + wrangler deploy(本番デプロイ。5節の準備が必要)
npm run format                                       # biome check --write

npx wrangler d1 migrations apply siritorase-db --local   # ローカルD1にマイグレーション適用
npx wrangler d1 execute siritorase-db --local --command "SELECT * FROM pictures;"  # ローカルD1確認
npx wrangler kv key list --binding KV_BINDING --local     # ローカルKV確認(OAuth state/セッション)
```

## 7. 既知の未対応事項

- `Tweet/createTweetIntentURL.ts`: 自動投稿API採用に伴い使われなくなった可能性があるファイル。削除するか、自動投稿失敗時のフォールバック導線として活かすかは未検討。
- `vis-network` を含むチャンク(`graph`)が527KB(gzip後161KB)とやや大きい。`npm run build` で警告が出るが、動的importでの分割は未実施。
- OGP背景画像(`public/img/ogp_background.png`)・デフォルトアイコン(`public/img/default_icon.png`)はプレースホルダー（単色PNG）。実際のデザインアセットへの差し替えは別タスク。
