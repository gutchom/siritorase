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

export async function loader({ params, context }: Route.LoaderArgs) {
	const postId = 'postId' in params ? params.postId : undefined;
	const env = context.cloudflare.env;
	const rows = postId ? await getAncestors(env, postId) : [];

	const ancestors: PictureType[] = rows.map((row) => ({
		id: row.id,
		src: imageUrl(row.image_key),
		title: row.title,
		created: new Date(row.created_at),
	}));

	return { ancestors };
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
	const [completedId, setCompletedId] = useState<string | null>(null);

	const imageRef = useCallback((img: HTMLImageElement | null) => {
		if (img) {
			imagesRef.current.push(img);
		}
	}, []);

	if (completedId) {
		const history = ancestors.map((ancestor) => ancestor.title).join(' → ');

		return <Tweet pictureId={completedId} history={history} />;
	}

	return (
		<>
			<Ancestors ancestors={ancestors} imageRef={imageRef} />
			<Drawing ancestors={ancestors} images={imagesRef.current} onComplete={setCompletedId} />
		</>
	);
}
