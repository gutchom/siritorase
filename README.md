## しりとらせ

絵しりとりをTwitterのみんなで遊ぼう！

### サービスについて

サービス内にaboutページを作る

<!--
Tweetテンプレート

ゴリラ→ラッパ→パセリ→???
しりとりでこの絵の続きを描いてください！

#しりとり #絵しりとり
-->

### プロジェクト構成について
#### 利用するプラットフォーム
- Vercel
- Firebase
    - Authentication
    - Firestore Database
    - Cloud Storage

#### 開発環境構築手順

```sh
# 適当なディレクトリにリポジトリをクローンして下さい。
git clone git@github.com:gutchom/siritorase.git

# プロジェクトのディレクトリに移動して、
cd ./siritorase

# パッケージをインストール
yarn install

# そしてNext.jsを起動……できません。
yarn dev
```

Firebaseの認証情報が必要だからですね。まずは[こちらのFirebaseコンソール](https://console.firebase.google.com)からプロジェクトを作成して下さい。

TwitterAPIも利用するので、[Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)でアプリを作成して下さい。最近は3行程度の作文でサクッと作れます(2022年5月現在)

認証に必要な項目は[`.env.example`](https://github.com/gutchom/siritorase/blob/main/.env.example)となるので、これを元に`.env.local`ファイルを作成し、そちらに記述してください。
```sh
cp .env.example .env.local
```
