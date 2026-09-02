# X / Twitter連携方針：Web Intent + Read APIで絵しりとりの返信チェーンを構築する

## 目的

X APIのWrite APIを使わず、ユーザー自身にWeb Intent経由で投稿してもらい、その投稿をRead APIで検出してアプリ側のしりとりノードと紐付けたい。

X側では実際のReply Threadとして見えるようにしつつ、アプリ側DBをcanonicalなデータソースとする。

## 基本方針

投稿処理にはX APIのWrite endpointを使用しない。

代わりに以下のフローを採用する。

1. ユーザーが絵しりとりの回答を作成
2. サーバー側で一回限りのランダムtoken / nonceを発行
3. tokenに対応するpending投稿レコードをDBに作成
4. X Web Intentを開く
5. Web Intentでは以下を指定
   - `text`
   - 回答専用URL
   - `in_reply_to`
6. ユーザー自身がX上で投稿
7. アプリに戻ったタイミングでX Recent Search APIから投稿を検索
8. 該当PostのTweet ID / author_id / conversation_id等を取得
9. pendingレコードと照合
10. 問題なければしりとりノードをconfirmedにしてTweet IDを保存

## Web Intent

基本URL:

```text
https://x.com/intent/tweet
```

例:

```ts
const intent = new URL("https://x.com/intent/tweet");

intent.searchParams.set("text", answerText);

intent.searchParams.set(
  "url",
  `https://example.com/p/${attemptToken}`,
);

intent.searchParams.set(
  "in_reply_to",
  parentTweetId,
);

window.open(intent.toString(), "_blank");
```

`parentTweetId` が存在しないroot投稿については `in_reply_to` を指定しない。

## 投稿識別用URL

各投稿attemptに一意なURLを割り当てる。

例:

```text
https://example.com/p/kD8u7Px2mN4a
```

tokenは十分なentropyを持つランダム値にする。

候補:

```ts
crypto.randomUUID()
```

または

```ts
crypto.randomBytes(16).toString("base64url")
```

token自体を連番やDB IDにはしない。

## DB

概念的には以下のようなpending投稿レコードを持つ。

```ts
type XPostAttempt = {
  id: string;

  token: string;

  parentNodeId: string | null;
  parentTweetId: string | null;

  status: "pending" | "confirmed" | "expired";

  createdAt: Date;
  expiresAt: Date;

  tweetId: string | null;
  xAuthorId: string | null;
};
```

しりとりノード本体は概念的には以下。

```ts
type Node = {
  id: string;

  parentId: string | null;

  tweetId: string | null;
  xAuthorId: string | null;

  drawingUrl: string;

  createdAt: Date;
};
```

X側のthread構造をcanonicalにしない。

アプリ側の既存tree構造をcanonicalとし、

```text
tweetId
xAuthorId
conversationId
```

などはexternal referenceとして保存する。

## Recent Search API

ユーザー投稿の検出にはX API v2 Recent Searchを利用する。

```text
GET https://api.x.com/2/tweets/search/recent
```

認証はユーザーOAuthではなく、アプリ側Bearer TokenによるApp-only authenticationで構わない。

検索クエリ例:

```text
url:"https://example.com/p/kD8u7Px2mN4a" in_reply_to_tweet_id:1234567890123456789
```

root投稿の場合はURLだけで検索する。

```text
url:"https://example.com/p/kD8u7Px2mN4a"
```

取得フィールド候補:

```text
id
author_id
conversation_id
created_at
referenced_tweets
entities
```

例:

```ts
const queryParts = [
  `url:"https://example.com/p/${attemptToken}"`,
];

if (parentTweetId) {
  queryParts.push(
    `in_reply_to_tweet_id:${parentTweetId}`,
  );
}

const params = new URLSearchParams({
  query: queryParts.join(" "),
  "tweet.fields":
    "author_id,conversation_id,referenced_tweets,created_at,entities",
  max_results: "10",
});

const response = await fetch(
  `https://api.x.com/2/tweets/search/recent?${params}`,
  {
    headers: {
      Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
    },
  },
);
```

## 投稿確定時の検証

検索結果を見つけただけではconfirmedにしない。

最低限以下を検証する。

```text
attemptがpendingである
tokenが一致する
attemptが有効期限内
URLが一致する
parentTweetIdが一致する
既に別Tweetでconsumeされていない
Tweet IDが既に別Nodeに登録されていない
```

必要なら以下もチェックする。

```text
referenced_tweets がreplyになっている
conversation_idが期待値と一致する
```

検証後、

```text
pending -> confirmed
```

へ遷移させる。

tokenは一回だけconsume可能にする。

race condition対策として、confirmation処理はtransactionまたはunique constraintを使用する。

## 1ユーザー1回答制限

X APIから得られる

```text
author_id
```

を内部ユーザー識別子として利用できる。

username取得は必須ではない。

例えば、

```text
UNIQUE(parent_node_id, x_author_id)
```

相当の制約を設ければ、

「同じXユーザーが同一ノードへ複数回答する」

ことを防止できる。

ただしproduct仕様上、本当にこの制約が必要かは既存仕様を確認すること。

## 投稿後のUX

Web Intentには「投稿完了後にTweet IDを返すcallback」はない。

そのため投稿後は、アプリにフォーカスが戻ったタイミング等で検索を開始する。

候補イベント:

```text
window.focus
document.visibilitychange
```

検索は即時に見つからない可能性があるので、exponential/backoff的に数回再試行する。

例:

```text
0秒
2秒
5秒
10秒
20秒
```

ただし無制限pollingはしない。

最終的に見つからなければ、

```text
投稿がまだ確認できません
[再確認]
[投稿URLを貼る]
```

等のfallback UIを出す。

APIアクセスは必ずサーバー側から行い、Bearer Tokenをブラウザへ公開しない。

## fallback

Recent Searchで検出できない場合に備えて、ユーザーがX Post URLを貼れるfallbackを用意することを推奨する。

例:

```text
https://x.com/example/status/1234567890123456789
```

ここからTweet IDを抽出し、Read APIで該当Tweetを取得して同じ検証処理へ流す。

このfallbackがあることで、

- Search index反映遅延
- API一時障害
- Intent後の特殊ケース

に対応しやすくなる。

## OGP

Web Intentではローカル画像ファイルを自動添付できない。

そのため各投稿専用URLについて、

```text
https://example.com/p/<token or public id>
```

のOGP画像として、その回答のdrawing画像を表示する。

可能なら既存仕様通り、

```text
現在の絵
+
直近2〜3件
```

などをOGP画像に含める。

X上ではネイティブ画像attachmentではなくURLカードとして表示される想定。

## X OAuth

この方式では、ユーザーごとのOAuth 1.0a認証が不要になる可能性が高い。

必要なのは基本的にアプリ側のRead API用Bearer Tokenのみ。

ユーザー識別もTweetの

```text
author_id
```

から取得可能。

既存実装にOAuth 2.0 / OAuth 1.0aログイン処理が存在する場合、それが他の機能で必要なのか確認してから削除すること。

この機能だけのためにOAuthを追加する必要はない。

## スクレイピングは禁止

以下は採用しない。

```text
twitter.com/search
x.com/search
```

のHTMLや内部GraphQLをスクレイピングして投稿を検出する方式。

理由:

- DOM / internal API変更に弱い
- ログイン状態・Cookie依存
- anti-bot対策に引っかかる
- 通常のX Search結果は完全性を保証しない
- Xの自動化ポリシー上も避けるべき

Recent Search APIを使用する。

## セキュリティ

tokenは推測困難な値にする。

attemptには有効期限を設ける。

例:

```text
30分〜24時間程度
```

適切な値はUXに合わせて決める。

tokenだけで投稿確定しない。

必ずX APIから取得したPostと、

```text
URL
parentTweetId
Tweet ID
author_id
```

等を照合する。

同じtokenの二重consumeをDBレベルでも防ぐ。

## アーキテクチャ上の原則

最重要。

```text
アプリDB = canonical
X = external publishing / social graph
```

とする。

X上のReply ThreadをDB構造の復元元にはしない。

既存のmaterialized path / closure table等のtree構造を維持し、各NodeへTweet IDを関連付ける。

概念的には、

```text
App Node A
tweetId = 100

└ App Node B
  tweetId = 200

  └ App Node C
    tweetId = 300
```

かつX上でも、

```text
Tweet 100
└ Reply 200
  └ Reply 300
```

になる状態を目指す。

## 実装時にまず確認してほしいこと

既存コードベースを確認し、以下を特定する。

1. 現在の投稿 / Nodeモデル
2. parent / root / depth / path等のtree管理方式
3. 現在のX OAuth実装
4. 現在のSNS共有処理
5. OGP生成処理
6. X関連environment variables
7. 既存の「1ユーザー1回答」制約
8. server-side APIの構成

そのうえで、既存設計をなるべく壊さずこの方式へ統合する。

いきなり大規模リファクタリングはせず、まず現在のX連携コードと投稿フローを調査し、必要な変更箇所を整理してから実装すること。

## 想定する最終フロー

```text
絵を描く
  ↓
回答を確定
  ↓
サーバーでattempt token生成
  ↓
pending attempt作成
  ↓
X Web Intentを開く
  ↓
ユーザーがReply投稿
  ↓
アプリへ戻る
  ↓
Recent Search API
  ↓
URL + parentTweetIdでPost発見
  ↓
author_id / tweetId等を検証
  ↓
Node作成またはpending Node確定
  ↓
tweetIdをNodeへ保存
  ↓
次の回答者はそのtweetIdへReply
```

まず既存コードを調査し、この仕様との差分と変更対象ファイルを提示してから実装を開始してください。

---

## 追記: 本ドキュメントへの反論(実装見送りの判断)

既存コードベース(`app/features/Tweet/*`, `app/lib/db/pictures.server.ts`, `supabase/migrations/*`)を調査した結果、本ドキュメントの採用は見送ることにした。理由は以下の通り。

### 1. 「fallback」として提案されている仕組みが、実は既存の唯一の仕組みそのもの

`Tweet/index.tsx`には既に「Web Intentでツイート」→「投稿後にツイートURLを手貼りしてもらう」という2段階フロー(`step: 'compose' | 'link'`)が実装済み。`parseTweetUrl.ts`でURLからtweetId/screenNameを抽出し、`/pictures/:id/tweet-link`経由で`pictures.tweet_id`/`tweet_screen_name`に保存、次の投稿の`in_reply_to`/`via`に使う、という一連の流れは、本ドキュメントの「## fallback」節が説明している内容とほぼ一致する。

つまり本ドキュメント自身が「## 実装時にまず確認してほしいこと」で指示している既存調査が、本ドキューメントの作成時には行われていなかったことになる。

### 2. Recent Search API採用は、月額$200前後の新規コストを生む

X API v2の`GET /2/tweets/search/recent`はFreeティアでは利用できず、最低でもBasicティア(目安$200/月〜)が必要(投稿専用のFreeティアとは別枠)。

このプロジェクトはKVキャッシュ化・Cache API導入によるエッジキャッシュ・R2カスタムドメイン化の先送りなど、一貫してインフラコストの最小化を志向している。そこに月額$200規模の固定費を足すのは、プロジェクトの方針と正面から矛盾する。得られる効果は「ユーザーがURLを手貼りする一手間を消す」程度のUX改善であり、コストに見合わない。

### 3. Recent Search自体の検出精度リスク

Recent Searchの`url:"..."`演算子はツイート本文中のURL(t.co展開後)に対するテキスト一致で、索引反映のタイムラグや揺れがあり得る。本ドキュメント自身も「無制限pollingはしない」「fallbackを用意」と自認しており、結局手貼りfallbackへの依存度が高い設計になっている。現状の「手貼りのみ」は、最初からこの弱点を回避した設計とも言える。

### 4. 新規提案のpending attempt(token/nonce)エンティティが既存スキーマと二重管理になる

`pictures`テーブルに既に`tweet_id`/`tweet_screen_name`があり、投稿(picture)自体が「1回答=1レコード」として管理されている。本ドキュメントが提案する`XPostAttempt`(pending→confirmed状態機械、token、expiresAt)は、この既存モデルの上に別の状態機械を重ねることになり、複雑化の割に得るものが小さい。

### 5. 「1ユーザー1回答」制約は現行仕様に存在しない

ログインなしでも投稿できる設計(`pictures.user_id`はnullable)なので、`UNIQUE(parent_node_id, x_author_id)`的な制約は現行のプロダクト仕様と噛み合わない。この点は本ドキュメント自身も「要確認」としており妥当な保留だが、現時点でそのような制約を追加する要望は存在しない。

### 結論

「Write API不使用」「アプリDBをcanonicalにする」という本ドキュメントの核心方針自体は、現状の「Web Intent + 手貼りURL」実装で既にコスト0で満たされている。本ドキュメントの提案(Recent Search APIによる自動検出)は不採用とし、現行実装を維持する。