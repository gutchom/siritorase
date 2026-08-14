import Graph from '../features/Graph';
import type { PictureNode } from '../features/Drawing/types';
import { getAllPictures } from '../lib/db/pictures.server';
import { imageUrl } from '../lib/imageUrl';
import type { Route } from './+types/graph';

export async function loader({ request, context }: Route.LoaderArgs) {
	const db = context.cloudflare.env.DB;
	const rows = await getAllPictures(db);

	const pictures: PictureNode[] = rows.map((row) => ({
		id: row.id,
		parentId: row.parent_id ?? '',
		src: imageUrl(row.image_key),
		title: row.title,
		created: new Date(row.created_at),
		tweetId: row.tweet_id ?? '',
		userId: row.user_id ?? '',
	}));

	const targetId = new URL(request.url).searchParams.get('target') ?? undefined;

	return { pictures, targetId };
}

export default function GraphRoute({ loaderData }: Route.ComponentProps) {
	const { pictures, targetId } = loaderData;
	return <Graph pictures={pictures} targetId={targetId} />;
}
