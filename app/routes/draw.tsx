import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import Ancestors from '../features/Ancestors';
import Drawing from '../features/Drawing';
import Tweet from '../features/Tweet';
import type { PictureType } from '../features/Drawing/types';
import { createPicture, getAncestors } from '../lib/db/pictures.server';
import { getCurrentUser } from '../lib/auth.server';
import { imageUrl } from '../lib/imageUrl';
import type { Route } from './+types/draw';

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const postId = 'postId' in params ? params.postId : undefined;
	const env = context.cloudflare.env;
	const rows = postId ? await getAncestors(env, postId) : [];

	const ancestors: PictureType[] = rows.map((row) => ({
		id: row.id,
		src: imageUrl(row.image_key),
		title: row.title,
		created: new Date(row.created_at),
		tweetId: row.tweet_id,
		tweetScreenName: row.tweet_screen_name,
	}));

	// 共有されるURL(/reply/:postId)がツイートのOGPカードとして展開されるよう、
	// 対象の絵(postId自身。ancestorsの末尾要素)のタイトルとOGP画像を伝える。
	const target = postId ? rows[rows.length - 1] : undefined;
	const share = target
		? {
				title: target.title,
				imageUrl: new URL(imageUrl(target.ogp_key), request.url).href,
				pageUrl: new URL(`/reply/${postId}`, request.url).href,
			}
		: null;

	return { ancestors, share };
}

export function meta({ data }: Route.MetaArgs) {
	if (!data?.share) {
		return [
			{ title: 'しりとらせ' },
			{ name: 'description', content: 'Twitterでお絵描きしりとりができるサービス「しりとらせ」' },
		];
	}

	const { title, imageUrl: ogImageUrl, pageUrl } = data.share;
	const pageTitle = `${title} | しりとらせ`;
	const description = '絵しりとりの続きを描いてツイートしよう！';

	return [
		{ title: pageTitle },
		{ name: 'description', content: description },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:title', content: pageTitle },
		{ property: 'og:description', content: description },
		{ property: 'og:image', content: ogImageUrl },
		{ property: 'og:url', content: pageUrl },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: pageTitle },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: ogImageUrl },
	];
}

export async function action({ request, context }: Route.ActionArgs) {
	const env = context.cloudflare.env;
	const formData = await request.formData();
	const title = formData.get('title');
	const parentId = formData.get('parentId');
	const picture = formData.get('picture');
	const ogp = formData.get('ogp');

	if (typeof title !== 'string' || !(picture instanceof File) || !(ogp instanceof File)) {
		throw new Response('Invalid form data', { status: 400 });
	}

	const id = nanoid(10);
	const imageKey = `picture/${id}.png`;
	const ogpKey = `ogp/${id}.png`;
	const bucket = env.PICTURES_BUCKET;

	const [user] = await Promise.all([
		getCurrentUser(request, env),
		bucket.put(imageKey, await picture.arrayBuffer(), {
			httpMetadata: { contentType: 'image/png' },
		}),
		bucket.put(ogpKey, await ogp.arrayBuffer(), {
			httpMetadata: { contentType: 'image/png' },
		}),
	]);

	await createPicture(env, {
		id,
		parentId: typeof parentId === 'string' && parentId.length > 0 ? parentId : null,
		title,
		imageKey,
		ogpKey,
		userId: user?.id,
	});

	return { id };
}

export default function Draw({ loaderData }: Route.ComponentProps) {
	const { ancestors } = loaderData;
	const imagesRef = useRef<HTMLImageElement[]>([]);
	const [completed, setCompleted] = useState<{ id: string; title: string } | null>(null);

	const imageRef = useCallback((img: HTMLImageElement | null) => {
		if (img) {
			imagesRef.current.push(img);
		}
	}, []);

	if (completed) {
		const history = [...ancestors.map((ancestor) => ancestor.title), completed.title].join(' → ');
		const parent = ancestors[ancestors.length - 1];

		return (
			<Tweet
				pictureId={completed.id}
				history={history}
				parentTweetId={parent?.tweetId}
				parentTweetScreenName={parent?.tweetScreenName}
			/>
		);
	}

	return (
		<>
			<Ancestors ancestors={ancestors} imageRef={imageRef} />
			<Drawing
				ancestors={ancestors}
				images={imagesRef.current}
				onComplete={(id, title) => setCompleted({ id, title })}
			/>
		</>
	);
}
