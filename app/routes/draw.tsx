import { useCallback, useRef, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import { nanoid } from 'nanoid';
import Ancestors from '../features/Ancestors';
import Drawing from '../features/Drawing';
import Tweet from '../features/Tweet';
import type { PictureType } from '../features/Drawing/types';
import { createPicture, getAncestors } from '../lib/db/pictures.server';
import { imageUrl } from '../lib/imageUrl';
import type { loader as rootLoader } from '../root';
import type { Route } from './+types/draw';

export async function loader({ params, context }: Route.LoaderArgs) {
	const postId = 'postId' in params ? params.postId : undefined;
	const db = context.cloudflare.env.DB;
	const rows = postId ? await getAncestors(db, postId) : [];

	const ancestors: PictureType[] = rows.map((row) => ({
		id: row.id,
		src: imageUrl(row.image_key),
		title: row.title,
		created: new Date(row.created_at),
		tweetId: row.tweet_id ?? undefined,
		tweetUserId: row.tweet_user_id ?? undefined,
	}));

	return { ancestors };
}

export async function action({ request, context }: Route.ActionArgs) {
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
	const bucket = context.cloudflare.env.PICTURES_BUCKET;
	const db = context.cloudflare.env.DB;

	await Promise.all([
		bucket.put(imageKey, await picture.arrayBuffer(), {
			httpMetadata: { contentType: 'image/png' },
		}),
		bucket.put(ogpKey, await ogp.arrayBuffer(), {
			httpMetadata: { contentType: 'image/png' },
		}),
	]);

	await createPicture(db, {
		id,
		parentId: typeof parentId === 'string' && parentId.length > 0 ? parentId : null,
		title,
		imageKey,
		ogpKey,
	});

	return { id };
}

export default function Draw({ loaderData }: Route.ComponentProps) {
	const { ancestors } = loaderData;
	const rootData = useRouteLoaderData<typeof rootLoader>('root');
	const user = rootData?.user ?? null;
	const imagesRef = useRef<HTMLImageElement[]>([]);
	const [completed, setCompleted] = useState<{ id: string; tweetId: string; tweetUserId: string } | null>(null);

	const imageRef = useCallback((img: HTMLImageElement | null) => {
		if (img) {
			imagesRef.current.push(img);
		}
	}, []);

	if (completed) {
		const parent = ancestors.slice(-1)[0];
		const history = [...ancestors.map((ancestor) => ancestor.title)].join(' → ');

		return (
			<Tweet
				user={user}
				pictureId={completed.id}
				history={history}
				tweetId={completed.tweetId || parent?.tweetId || ''}
				tweetUserId={completed.tweetUserId || parent?.tweetUserId || ''}
				onTweet={(tweetId, tweetUserId) => {
					setCompleted({ ...completed, tweetId, tweetUserId });
				}}
			/>
		);
	}

	return (
		<>
			<Ancestors ancestors={ancestors} imageRef={imageRef} />
			<Drawing
				ancestors={ancestors}
				images={imagesRef.current}
				onComplete={(id) => setCompleted({ id, tweetId: '', tweetUserId: '' })}
			/>
		</>
	);
}
