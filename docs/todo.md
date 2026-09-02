# TODO

## 独自ドメイン取得後: R2カスタムドメインで画像配信をWorkers完全バイパス

- 現状: `/images/:type/:filename`(`workers/routes/images.ts`)はHono経由でR2から配信。Cache APIで明示キャッシュ済みだが、キャッシュ未ヒット時や初回アクセス時はWorkersの実行を経由する。
- 将来: ドメイン取得(またはさくらのドメインからの移管)が完了したら、そのドメインのサブドメイン(例: `img.<domain>`)をCloudflareのゾーンに登録し、`wrangler r2 bucket domain add siritorase-pictures img.<domain>` でR2バケットにカスタムドメインを紐づける。
  - `*.workers.dev`はCloudflare管理下のため、R2カスタムドメインは紐づけられない。独自ゾーンが必須。
- 効果: picture/ogp画像のリクエストがWorkersの実行を一切介さずCloudflareのCDN層(R2)から直接配信されるようになり、配信コスト・レイテンシがさらに下がる。
- 対応後: `app/lib/imageUrl.ts` の生成先を新ドメインに切り替え、`workers/routes/images.ts` のHono経由配信は縮小/削除を検討。
