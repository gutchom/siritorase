export function meta() {
	return [{ title: "プライバシーポリシー | しりとらせ" }];
}

export default function Privacy() {
	return (
		<main className="max-w-2xl mx-auto px-4 py-10 leading-relaxed">
			<h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>
			<p className="mb-6 text-sm text-gray-500">最終更新日: 2026年8月15日</p>

			<p className="mb-6">
				タニグチヨシカズ（以下「運営者」）は、お絵描きしりとりサービス「しりとらせ」（以下「本サービス」）における、ユーザーの情報の取り扱いについて、本プライバシーポリシーを定めます。
			</p>

			<h2 className="text-lg font-bold mt-8 mb-3">第1条（取得する情報）</h2>
			<p className="mb-2">本サービスは、以下の情報を取得します。</p>
			<ul className="list-disc pl-6 mb-6 space-y-1">
				<li>X（Twitter）アカウントでログインした際に、X側から提供されるプロフィール情報（ユーザー名、表示名、アイコン画像URL等）</li>
				<li>ユーザーが本サービス上で投稿した画像・タイトル等のコンテンツ</li>
				<li>ログイン状態を維持するためのセッションCookie</li>
			</ul>
			<p className="mb-6">
				本サービスはユーザーのXアカウントのパスワードを取得・保持しません。また、本サービスはユーザーに代わって自動的にツイートを投稿することはありません（ツイート投稿はユーザー自身がX上で操作して行います）。
			</p>

			<h2 className="text-lg font-bold mt-8 mb-3">第2条（利用目的）</h2>
			<p className="mb-2">取得した情報は、以下の目的で利用します。</p>
			<ul className="list-disc pl-6 mb-6 space-y-1">
				<li>本サービスへのログイン・ログイン状態の維持</li>
				<li>投稿コンテンツの表示、投稿ツリーの可視化</li>
				<li>不正利用の防止、本サービスの維持・改善</li>
			</ul>

			<h2 className="text-lg font-bold mt-8 mb-3">第3条（第三者サービスの利用）</h2>
			<p className="mb-2">本サービスは、以下の第三者が提供するインフラサービスを利用しています。</p>
			<ul className="list-disc pl-6 mb-6 space-y-1">
				<li>
					<strong>Supabase</strong>: ログイン認証（X/TwitterのOAuth連携を含む）、投稿データの保存
				</li>
				<li>
					<strong>Cloudflare</strong>: アプリケーションの実行基盤、投稿画像の保存・配信
				</li>
			</ul>
			<p className="mb-6">
				これらのサービスにおけるデータの取り扱いについては、各社のプライバシーポリシーも適用されます。
			</p>

			<h2 className="text-lg font-bold mt-8 mb-3">第4条（第三者提供）</h2>
			<p className="mb-6">
				運営者は、法令に基づく場合を除き、ユーザーの同意なく取得した情報を第三者に提供しません。
			</p>

			<h2 className="text-lg font-bold mt-8 mb-3">第5条（情報の削除）</h2>
			<p className="mb-6">
				ユーザーは、自身の投稿コンテンツやアカウント情報の削除を希望する場合、第7条の連絡先まで請求することができます。運営者は、合理的な期間内に対応します。
			</p>

			<h2 className="text-lg font-bold mt-8 mb-3">第6条（本ポリシーの変更）</h2>
			<p className="mb-6">
				運営者は、必要と判断した場合、ユーザーへの個別の通知なく本ポリシーを変更できるものとします。変更後のポリシーは、本ページに掲載された時点から効力を生じます。
			</p>

			<h2 className="text-lg font-bold mt-8 mb-3">第7条（お問い合わせ）</h2>
			<p className="mb-6">
				本ポリシーに関するお問い合わせ・情報削除のご請求は、以下の連絡先までお願いします。
				<br />
				運営者: タニグチヨシカズ
				<br />
				連絡先: gutchom1013@me.com
			</p>
		</main>
	);
}
