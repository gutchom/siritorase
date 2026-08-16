# X(Twitter)ログイン実装の経緯とトラブルシューティング

> 作成日: 2026-08-16。X(Twitter)ログイン機能が「ログイン後にエラーで完了しない」状態のまま
> ユーザー側で引き継ぎ調査することになったための引き継ぎメモ。
> ログイン以外の機能(お絵描き投稿・Supabase Postgres保存・R2画像・Graph表示・tweet intent
> によるツイート導線)はログイン状態に依存せず動作するため、この問題の影響を受けない。

## 1. 今のゴールと前提

- 「しりとらせ」ではXアカウントでログインできるようにしたい（ヘッダーにアイコン表示、将来的な投稿の紐付け等のため）。
- ツイート投稿自体は自動投稿APIを使わず **tweet intent URL**（`twitter.com/intent/tweet`を新規タブで開く）方式なので、ログインにX APIの書き込み権限は一切不要。プロフィール表示のための読み取りだけできればよい。
- DB(投稿データ)はSupabase Postgres、画像はCloudflare R2で、これらはログイン問題とは独立して正常に動作している。

## 2. 試した実装と、発生したエラー・原因・対処の記録

時系列順。各段階のコードは該当コミットで確認できる。

### 2-1. Supabase Auth の X/Twitter (OAuth 2.0) プロバイダを使う

コミット: `c906896`

DBをSupabase Postgresに移行するのに合わせて、認証もSupabase Authに任せる方針にした。

**エラー1**: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

- **原因**: `supabase.auth.signInWithOAuth({ provider: 'twitter' })` と指定していたが、Supabaseは `'twitter'`(旧OAuth1.0a方式のプロバイダ)と `'x'`(新OAuth2.0方式のプロバイダ)を別物として扱う。Supabaseダッシュボードで有効化していたのは「X / Twitter (OAuth 2.0)」だったため、`provider: 'x'` が正しかった。
- **対処**: `provider: 'x'` に修正（コミット `7bd1638`）。

**エラー2**: `OAuth error: server_error - Error getting user profile from external provider`

- **調査**: X API v2の `/2/users/me`（Supabaseがプロフィール取得に使う）は `users.read` 単体だと403になり、`tweet.read` も要求スコープに含める必要があると判明。`scopes: 'users.read tweet.read'` に修正（コミット `3029ce0`）。
- **それでも解消せず**、さらに調査。**SupabaseのAuthリポジトリのソースコード(`x.go`)をGitHub上で直接確認**したところ、こちらが指定するscopesに関わらず、Supabase側が常に `users.email` スコープも追加して要求する実装になっていることが判明。X APIはメールアドレスへのアクセスを特に厳しく制限しており、X Developer Portal側の「Request email from users」を有効化しても解消しなかった。
- **結論**: Supabase Auth の組み込みXプロバイダはこちらの実装だけでは制御しきれない制約を持つため、**Supabase Authの利用自体を諦めた**（DBはSupabase Postgresのまま維持）。

### 2-2. 自前のOAuth 2.0 + PKCE実装に戻す

コミット: `53ba52d`

Supabase Authを経由せず、Workers上に自前でOAuth2.0(PKCE)フローを実装（元々Phase 3で作っていたものを、トークンの保存・リフレッシュ処理を削ぎ落として簡略化: tweet intentを使うので `offline.access` すら不要、`users.read tweet.read` のみで良い）。

**エラー3**: X APIから403 Forbidden
```json
{
  "client_id": "32211814",
  "detail": "When authenticating requests to the X API v2 endpoints, you must use keys and tokens from a developer App that is attached to a Project. ...",
  "reason": "client-not-enrolled"
}
```

- **調査**: `wrangler tail` で本番ログをリアルタイム監視し、実際のエラーメッセージを取得して判明。X Developer Communityフォーラムの複数の投稿を調査した結果、**X APIのFree tierは `/2/users/me` エンドポイント自体にアクセスできない**（Projectに紐づいているかどうかに関わらず、Free tierというサービスレベル自体の制限）ということが分かった。ユーザー側でProjectへの紐付けを確認したが「紐づいている」とのことで、Project設定の問題ではなく **プランの制限そのもの** と結論。
- **対処**: OAuth 2.0 + `/2/users/me` を諦め、**OAuth 1.0a（レガシーAPI、v1.1）に切り替える**方針にした。v1.1の `account/verify_credentials.json` 等はFree tierでもアクセスできるという報告が複数あったため。

### 2-3. OAuth 1.0a (3-legged) に切り替え、自前でHMAC-SHA1署名を実装

コミット: `5bffa36`

`workers/lib/oauth1.ts` にOAuth 1.0aの署名ロジック(HMAC-SHA1、Web Crypto使用)を自前実装。`request_token` → 認可画面 → `access_token` の3-leggedフロー。

- Xデベロッパーポータルの認証情報について、**OAuth 2.0のClient ID/Secret** と **OAuth 1.0aのConsumer Key/Secret(API Key/API Key Secret)** と **Access Token/Secret** の3種類が混同されやすく、ユーザーとのやり取りで何度か違う値を受け取ってしまった。最終的に「Keys and tokens」タブの表示内容をそのまま貼ってもらい、「OAuth 1.0 キー」→「コンシューマーキー」の値だと特定できた。
- `request_token` の取得はPlaywrightの実地テストで **X APIに対して実際に成功することを確認**（HMAC-SHA1署名が正しく通っている）。

**エラー4**: `access_token` 交換時にXから汎用サーバーエラー
```
X / Error
This page is down
```
（`https://api.twitter.com/oauth/access_token` へのPOSTが500、JSON形式ではなくX側のHTMLエラーページが返る）

- `wrangler tail` でログを確認。`request_token` 取得・認可画面遷移・callbackでの `oauth_token`/`oauth_verifier` 受け取りまでは成功しており、最後の `access_token` 交換だけが失敗している。
- 自前のHMAC-SHA1署名実装にバグがある可能性を排除できないため、**実績のある `oauth-1.0a` npmパッケージに差し替えて同じ現象が起きるか切り分ける**ことにした。

### 2-4. `oauth-1.0a` ライブラリ + `node:crypto` に置き換え

コミット: `bdda5c1`（**現在のHEAD**）

- `oauth-1.0a` パッケージは署名処理に同期的な `hash_function` を要求する。Cloudflare Workersでは `crypto.subtle` は非同期しか無いが、本プロジェクトは元から `compatibility_flags: ["nodejs_compat"]` が有効なため、**Node.jsの `node:crypto` (`createHmac`) が同期的に使える**ことを利用してライブラリをそのまま動かせた。
- `tsconfig.cloudflare.json` の `types` に `"node"` を追加(`@types/node`は元々devDependencyとして存在)。
- デプロイして `request_token` 取得は成功を確認済み。**`access_token` 交換以降が実際に成功するかどうかは、ユーザー側で最終確認中（未解決）**。

## 3. 現在の実装構成（コード上の到達点）

| ファイル | 役割 |
|---|---|
| `workers/lib/twitterOAuth1.ts` | `oauth-1.0a`ライブラリ+`node:crypto`でOAuth1.0aの3-leggedフローを実装。`access_token`レスポンスの`user_id`/`screen_name`を基本情報とし、`account/verify_credentials.json`で`name`/アイコンを追加取得（失敗してもログイン自体は継続、`id`/`username`のみにフォールバック） |
| `workers/lib/session.ts` | KVでの`request_token`シークレット一時保存(`oauth1:request:<oauth_token>`、10分TTL)とセッション管理(`session:<sessionId>`、プロフィールJSONを直接保存、30日TTL) |
| `workers/routes/auth.ts` | `GET /auth/twitter/login`(request_token取得→認可画面へリダイレクト)、`GET /auth/twitter/callback`(access_token交換→セッションCookie発行)、`POST /auth/logout` |
| `app/lib/auth.server.ts` | `session_id`Cookie→KVセッション取得、`getCurrentUser(request, env)` |
| `.dev.vars` (ローカル) / `wrangler secret` (本番) | `TWITTER_API_KEY`, `TWITTER_API_KEY_SECRET`（Consumer Key/Secret。OAuth 2.0のClient ID/Secretではない点に注意） |

**本番URL**: https://siritorase.yskz-tg.workers.dev
**Xアプリのコールバック登録URL**: `https://siritorase.yskz-tg.workers.dev/auth/twitter/callback`（+ ローカル開発用に `http://localhost:5173/auth/twitter/callback` も登録済みのはず）

## 4. 次にユーザー側で確認・試してほしいこと

1. **まず再試行**: `https://siritorase.yskz-tg.workers.dev` でログインを試す。ライブラリ差し替え後の初回確認がまだ。
2. **`wrangler tail` でリアルタイムログを見ながら試す**（一番情報が得られる方法）:
   ```bash
   npx wrangler tail siritorase --format pretty
   ```
   別ターミナルでログインを試し、`(error)` 行に出るメッセージを確認する。エラーがJSON形式ではなくHTMLの場合、Xのエラーページのタイトル(`This page is down`等)だけでも手がかりになる。
3. **X Developer Portal側の確認**:
   - 「User authentication settings」で OAuth 1.0a が有効になっているか（コンシューマーキー自体は表示されていたので有効ではありそうだが、念のため）
   - コールバックURLが本番URL(`https://siritorase.yskz-tg.workers.dev/auth/twitter/callback`)と完全一致で登録されているか(末尾スラッシュの有無等で不一致になることがある)
   - アプリの「App permissions」が最低限「Read」になっているか
4. **X Developer Communityフォーラムで `"This page is down" oauth/access_token` のような検索**をして、同種の報告がないか確認する（今回の調査では専用の報告までは見つけられなかった）。
5. 上記で解決しない場合、**OAuth 1.0aも含めてXの無料枠では3-leggedログインフロー自体が制限されている可能性**も視野に入れる。その場合の代替案:
   - ログイン機能自体を一旦諦め、`app/root.tsx`のHeader表示を「未ログイン」固定にして他機能を先にリリースする
   - X API有料プラン(Basic以上)へのアップグレードを検討する

## 5. 参考にした外部情報

- [X/Twitter OAuth with Supabase (公式ドキュメント)](https://supabase.com/docs/guides/auth/social-login/auth-twitter)
- [Unable to refresh provider_token · Issue #806 · supabase/auth-js](https://github.com/supabase/auth-js/issues/806)
- Supabase auth リポジトリの `internal/api/provider/x.go`（GitHub上で直接参照、スコープのハードコード実装を確認）
- [403 client-not-enrolled despite app attached to project](https://devcommunity.x.com/t/403-client-not-enrolled-despite-app-attached-to-project/263083)
- [Trouble with Free Tier endpoint /2/users/me](https://devcommunity.x.com/t/trouble-with-free-tier-endpoint-2-users-me/214662)
