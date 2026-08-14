/**
 * NOTE: Xのメディアアップロード(v1.1 media/upload)は歴史的にOAuth1.0aのみ対応だった。
 * 2024年以降OAuth2.0ユーザーコンテキストでも利用可能になっているとされるが、
 * APIプラン/時期によって挙動が変わりうるため、実クレデンシャルでの検証が必須。
 * 失敗する場合はOAuth1.0a署名の実装を追加する必要がある(要調査)。
 */
export async function uploadMedia(accessToken: string, image: Blob): Promise<string> {
	const formData = new FormData();
	formData.set('media', image, 'ogp.png');

	const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
		method: 'POST',
		headers: { Authorization: `Bearer ${accessToken}` },
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Failed to upload media: ${response.status} ${await response.text()}`);
	}

	const { media_id_string } = (await response.json()) as { media_id_string: string };
	return media_id_string;
}

export async function postTweet(
	accessToken: string,
	text: string,
	mediaId: string,
	inReplyToTweetId?: string,
): Promise<{ id: string }> {
	const response = await fetch('https://api.twitter.com/2/tweets', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			text,
			media: { media_ids: [mediaId] },
			...(inReplyToTweetId ? { reply: { in_reply_to_tweet_id: inReplyToTweetId } } : {}),
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to post tweet: ${response.status} ${await response.text()}`);
	}

	const { data } = (await response.json()) as { data: { id: string } };
	return data;
}
