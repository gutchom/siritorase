import { setPictureTweetInfo } from '../lib/db/pictures.server';
import type { Route } from './+types/tweetLink';

export async function action({ params, request, context }: Route.ActionArgs) {
	const env = context.cloudflare.env;
	const formData = await request.formData();
	const tweetId = formData.get('tweetId');
	const tweetScreenName = formData.get('tweetScreenName');

	if (typeof tweetId !== 'string' || typeof tweetScreenName !== 'string' || !tweetId || !tweetScreenName) {
		throw new Response('Invalid form data', { status: 400 });
	}

	await setPictureTweetInfo(env, params.id, tweetId, tweetScreenName);

	return { ok: true };
}
