import { Hono } from 'hono';
import { getCurrentUser } from '../../app/lib/auth.server';
import { getPicture, setPictureTweet } from '../../app/lib/db/pictures.server';
import { getUserTokens, updateUserTokens } from '../../app/lib/db/users.server';
import { refreshAccessToken } from '../lib/twitterOAuth';
import { postTweet, uploadMedia } from '../lib/twitterTweet';

const app = new Hono<{ Bindings: Env }>();

const TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

app.post('/tweet', async (c) => {
	const user = await getCurrentUser(c.req.raw, c.env);
	if (!user) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const body = await c.req.json<{
		pictureId?: string;
		text?: string;
		inReplyToTweetId?: string;
	}>();
	const { pictureId, text, inReplyToTweetId } = body;
	if (!pictureId || !text) {
		return c.json({ error: 'pictureId and text are required' }, 400);
	}

	const picture = await getPicture(c.env.DB, pictureId);
	if (!picture) {
		return c.json({ error: 'Picture not found' }, 404);
	}

	let tokens = await getUserTokens(c.env.DB, user.id);
	if (!tokens) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	if (tokens.tokenExpiresAt.getTime() - TOKEN_REFRESH_MARGIN_MS < Date.now()) {
		const refreshed = await refreshAccessToken(c.env, tokens.refreshToken);
		tokens = {
			accessToken: refreshed.accessToken,
			refreshToken: refreshed.refreshToken,
			tokenExpiresAt: refreshed.expiresAt,
		};
		await updateUserTokens(c.env.DB, user.id, tokens);
	}

	const ogpObject = await c.env.PICTURES_BUCKET.get(picture.ogp_key);
	if (!ogpObject) {
		return c.json({ error: 'OGP image not found' }, 404);
	}

	const mediaId = await uploadMedia(tokens.accessToken, await ogpObject.blob());
	const tweet = await postTweet(tokens.accessToken, text, mediaId, inReplyToTweetId);

	await setPictureTweet(c.env.DB, pictureId, tweet.id, user.username);

	return c.json({ tweetId: tweet.id, tweetUserId: user.username });
});

export default app;
