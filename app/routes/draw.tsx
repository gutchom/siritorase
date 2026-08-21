import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import Ancestors from '../features/Ancestors';
import Drawing from '../features/Drawing';
import type { PictureNode, PictureType } from '../features/Drawing/types';
import Graph from '../features/Graph';
import Tweet from '../features/Tweet';
import { getCurrentUser } from '../lib/auth.server';
import { createPicture, getAncestors } from '../lib/db/pictures.server';
import { imageUrl } from '../lib/imageUrl';
import type { Route } from './+types/draw';
import styles from './draw.module.css';

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
	const graphFetcher = useFetcher<{ pictures: PictureNode[] }>();

	const imageRef = useCallback((img: HTMLImageElement | null) => {
		if (img) {
			imagesRef.current.push(img);
		}
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: graphFetcherは投稿完了時に一度だけ読み込めばよい
	useEffect(() => {
		if (completed && graphFetcher.state === 'idle' && !graphFetcher.data) {
			graphFetcher.load('/graph');
		}
	}, [completed]);

	if (completed) {
		const history = [...ancestors.map((ancestor) => ancestor.title), completed.title].join(' → ');
		const parent = ancestors[ancestors.length - 1];

		return (
			<div className={styles.completeContainer}>
				{graphFetcher.data && (
					<Graph pictures={graphFetcher.data.pictures} targetId={completed.id} />
				)}
				<div className={styles.tweetOverlay}>
					<Tweet
						pictureId={completed.id}
						history={history}
						parentTweetId={parent?.tweetId}
						parentTweetScreenName={parent?.tweetScreenName}
					/>
				</div>
			</div>
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
