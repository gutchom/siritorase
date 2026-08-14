# しりとらせ (siritorase) — プロジェクト概要

> このドキュメントは、後続のエージェント/開発者がこのリポジトリの状況を素早く把握できるようにするための引き継ぎメモです。
> 作成日: 2026-08-14 時点のリポジトリ状態を元に記述。

## 1. プロダクトの概要

「しりとらせ」は Twitter（X）上でお絵描きしりとりをするサービス。

- ユーザーは直前の絵（末尾のお題）を見ながら、その続きとなる絵を描いて投稿する。
- 投稿は「祖先（ancestors）」を辿れる木構造になっており、`Graph` 機能で家系図的なネットワーク図として全体像を閲覧できる。
- 投稿すると OGP 画像（直前の絵＋今回の絵を合成したもの）が生成され、Twitter にツイートできる。
- 旧実装は `https://siritorase.vercel.app/` で稼働していた（コード中に URL 参照が残っている）。

## 2. 現在の状態（最重要）

**このリポジトリは「動作しない未完成の移行途中」の状態です。** git 上ではまだ 1 コミット (`Initialize web application via create-cloudflare CLI`) のみで、それ以降の変更（＝旧実装からの機能移植）はすべて未コミットの `git status` 上の Add (`A`) 差分として存在しています。

構造は大きく2層に分かれています。

1. **土台（新規）**: `create-cloudflare` CLI で生成した React Router v7 (framework mode) + Cloudflare Workers のテンプレート。これはビルド・デプロイ可能な状態。
2. **機能コード（移植中）**: `app/features/*` 以下に、旧 Next.js + Firebase 実装からほぼそのままコピーしてきたと見られる UI コンポーネント群。**土台側の依存関係やルーティングに全く配線されておらず、このままでは型チェックもビルドも通りません。**

### 既知の不整合・壊れている箇所

| 箇所 | 問題 |
|---|---|
| `app/features/**` 内の多数のファイル | `next/router`, `@firebase/firestore`, `@firebase/storage`, `recoil`, `vis-network`, `vis-data`, `twitter-text`, `react-icons` を import しているが、`package.json` にはこれらの依存が一切無い（現行 deps は `hono`, `isbot`, `react`, `react-dom`, `react-router` のみ）。 |
| `lib/browser/firebase`, `lib/useAuth` | `app/features/Drawing/utils/post.ts`, `app/features/Header/Account.tsx`, `app/features/Introduction/index.tsx`, `app/features/Tweet/index.tsx` などが参照しているが、`lib/` ディレクトリ自体がリポジトリに存在しない。 |
| `app/features/Graph/index.tsx` | `next/router` の `useRouter` を使用（React Router v7 ではなく Next.js の API）。ページ遷移も `/${id}/draw` と旧ルーティング規約のまま。 |
| `app/routes.ts` | 2行目に `・`（不可視ではない全角中黒）という不要な文字が単独で残っており、パースエラーの原因になり得る。 |
| `app/routes/draw.tsx` | ファイルが**空**。`app/routes.ts` では `route("reply/:postId", "./routes/draw.tsx")` として登録されているため、このルートは現状何もレンダリングしない。 |
| `app/routes/home.tsx` | `create-cloudflare` テンプレートのデフォルト（`Welcome` コンポーネント表示のみ）のまま。`Header` / `Introduction` / `Drawing` / `Graph` などの実機能には未接続。 |
| `/api/tweet` | `Tweet/index.tsx` が `fetch('/api/tweet')` を呼んでいるが、`workers/app.ts`（Hono）側には `app.get("*", ...)` の catch-all しかなく、この API は未実装。 |
| Twitter/X ログイン・投稿 | 旧実装は Firebase Auth（Twitter プロバイダ）＋ Twitter API 経由。Cloudflare Workers 上でどう認証・投稿するかの方針は未決定（後述）。 |

### 前提として押さえておくべきこと

- `npm run typecheck` や `npm run build` は、上記の未接続コードがある限り**失敗する見込みが高い**（未検証だが、存在しないモジュールへの import があるため）。
- `app/features/*` のコードは「参考実装・移植元の資産」として存在しているだけで、**そのまま活かすか、Cloudflare 向けに設計し直すかはまだ意思決定されていない。**

## 3. アーキテクチャ方針（Cloudflare を前提とする）

このプロジェクトは Cloudflare Workers 上で完結させる方向で土台が作られている（`create-cloudflare` CLI 使用）。今後インフラを構築する際は以下を踏まえること。

### 現在の構成

- **ランタイム**: Cloudflare Workers（`wrangler.jsonc` の `main` は `./workers/app.ts`）
- **フレームワーク**: React Router v7（framework mode、SSR）+ Vite（`@cloudflare/vite-plugin` でローカル開発時から Workers ランタイムをエミュレート）
- **サーバー側の薄いレイヤー**: Hono（`workers/app.ts`）。現状は React Router の SSR ハンドラに丸投げする catch-all ルートのみ。API エンドポイント（例: `/api/tweet`）を追加する場合はここに Hono のルートとして生やす想定と思われる。
- **バインディング**: `wrangler.jsonc` に KV Namespace (`KV_BINDING`, id: `6c3ee052b02c47ef90c2cfc48fbc6434`) が定義済みだが、コード側で未使用。
- **静的アセット**: `wrangler.jsonc` 内に `assets` 設定はコメントアウトされたまま（`public/` 配信の設定は未確定）。
- **Observability**: `observability.enabled: true`、`upload_source_maps: true` は有効化済み。
- **Node 互換**: `compatibility_flags: ["nodejs_compat"]` 有効。

### 旧実装（Firebase/Vercel）からの移行で決めるべきこと

旧実装は Firebase（Firestore + Storage + Auth）と Vercel に依存していた。Cloudflare ベースで作り直す場合、代替候補は以下の通り（**未決定・要意思決定**）。

| 用途 | 旧実装 | Cloudflare での代替候補 |
|---|---|---|
| 投稿データ（絵のメタ情報・祖先関係のツリー構造） | Firestore | D1（SQL）または KV（現状バインディング済みだが、木構造クエリには D1 の方が向く可能性が高い） |
| 画像ストレージ（描いた絵・OGP画像） | Firebase Storage | R2 |
| 認証（Twitterログイン） | Firebase Auth (Twitter provider) | Workers 上で Twitter/X OAuth を自前実装し、セッションを KV or D1 で管理する必要がある |
| ツイート投稿（サーバーサイドAPI呼び出し） | 不明な実装（`/api/tweet` の中身は旧リポジトリ側？未確認） | Workers Secrets（`wrangler secret`）で X API のトークンを保持し、Hono ルートとして実装 |
| 状態管理（Recoil） | Recoil | React Router v7 は loader/action でサーバー状態を扱えるため、クライアント状態管理は必要最小限（描画中のストローク管理など）に留める方針も検討可 |

**この意思決定（D1 vs KV、Firebase を一部残すか完全に置き換えるか等）はまだされていない。** 実装を進める前に、プロダクトオーナー（このリポジトリのユーザー）に確認することを推奨する。

## 4. ディレクトリ構成

```
app/
  routes.ts             # ルーティング定義（"・" という不要文字あり、要確認）
  root.tsx              # React Router のレイアウトルート
  routes/
    home.tsx            # "/" ルート。create-cloudflareテンプレートのデフォルトのまま未接続
    draw.tsx             # "reply/:postId" ルート。空ファイル（未実装）
  features/              # 旧実装からの移植コード（土台に未接続、依存関係欠落あり）
    Ancestors/            # 祖先の絵一覧表示
    Drawing/               # お絵描きキャンバス本体（ツール、Undo/Redo、投稿処理、OGP生成）
    Graph/                 # vis-network を使った投稿ツリーの可視化
    Header/                # ヘッダー・アカウント（ログイン/ログアウトUI）
    Introduction/          # サービス説明モーダル
    Modal/                 # 汎用モーダル
    Tweet/                 # ツイート投稿モーダル
workers/
  app.ts                 # Hono アプリ。現状は React Router SSR への catch-all のみ
wrangler.jsonc            # Cloudflare Workers 設定（KV_BINDING 定義済み、assets/services は未設定）
vite.config.ts             # Cloudflare + React Router + Tailwind の Vite 設定
biome.json, mise.toml       # 新規追加。Biome（lint/format）、mise（Node 26 管理）
```

## 5. 開発コマンド

```bash
npm install          # 依存インストール（postinstall で wrangler types 実行）
npm run dev           # ローカル開発サーバー（Vite + Cloudflare エミュレーション）
npm run typecheck     # cf-typegen + react-router typegen + tsc -b
npm run build         # react-router build
npm run deploy        # ビルド後 wrangler deploy で本番デプロイ
npm run format        # biome check --write
```

> `npm run typecheck` / `npm run build` は、現状の `app/features/*` の未接続コードにより失敗する可能性が高いです（未検証）。着手前に一度実行して現状のエラーを確認することを推奨します。

## 6. 次のエージェントへの推奨タスク

優先度が高いと思われる順に記載（あくまで推奨であり、着手前にユーザーに方針を確認すること）。

1. `npm run typecheck` / `npm run build` を実行し、実際に何が壊れているかを確定させる。
2. データ層の方針を決定する（D1 / KV / R2 の使い分け、Firebase を残すか完全撤去するか）。ユーザーへの確認が必要。
3. 認証・ツイート投稿（Twitter/X API 連携）の実装方針を決定する。Secrets 管理は `wrangler secret` を使う想定。
4. `app/routes.ts` の不要文字 `・` を削除する。
5. `app/routes/draw.tsx` を実装し、`Drawing` / `Ancestors` / `Tweet` 等の機能コンポーネントを接続する。
6. `app/routes/home.tsx` にテンプレートの `Welcome` ではなく `Header` / `Introduction` / `Graph` 等の実機能を接続する。
7. `app/features/Graph` 内の `next/router` 依存を React Router v7 の API（`useNavigate` 等）に置き換える。
8. 上記の意思決定に基づき、`package.json` の依存関係（recoil, firebase, vis-network, vis-data, twitter-text, react-icons 等）を追加または不要化する。
9. `wrangler.jsonc` の `assets` 設定（`public/` 配信）を確定させる。
