export type PictureRow = {
	id: string;
	parent_id: string | null;
	title: string;
	image_key: string;
	ogp_key: string;
	tweet_id: string | null;
	tweet_user_id: string | null;
	user_id: string | null;
	children_count: number;
	created_at: string;
};

export async function getAncestors(db: D1Database, id: string): Promise<PictureRow[]> {
	const { results } = await db
		.prepare(
			`WITH RECURSIVE ancestors(id, parent_id, title, image_key, ogp_key, tweet_id, tweet_user_id, user_id, children_count, created_at, depth) AS (
				SELECT id, parent_id, title, image_key, ogp_key, tweet_id, tweet_user_id, user_id, children_count, created_at, 0
				FROM pictures WHERE id = ?1
				UNION ALL
				SELECT p.id, p.parent_id, p.title, p.image_key, p.ogp_key, p.tweet_id, p.tweet_user_id, p.user_id, p.children_count, p.created_at, a.depth + 1
				FROM pictures p JOIN ancestors a ON p.id = a.parent_id
			)
			SELECT * FROM ancestors ORDER BY depth DESC`,
		)
		.bind(id)
		.all<PictureRow>();
	return results;
}

export async function getAllPictures(db: D1Database): Promise<PictureRow[]> {
	const { results } = await db
		.prepare('SELECT * FROM pictures ORDER BY created_at')
		.all<PictureRow>();
	return results;
}

export async function getPicture(db: D1Database, id: string): Promise<PictureRow | null> {
	return db.prepare('SELECT * FROM pictures WHERE id = ?1').bind(id).first<PictureRow>();
}

export async function setPictureTweet(
	db: D1Database,
	id: string,
	tweetId: string,
	tweetUserId: string,
): Promise<void> {
	await db
		.prepare('UPDATE pictures SET tweet_id = ?1, tweet_user_id = ?2 WHERE id = ?3')
		.bind(tweetId, tweetUserId, id)
		.run();
}

export async function createPicture(
	db: D1Database,
	input: {
		id: string;
		parentId: string | null;
		title: string;
		imageKey: string;
		ogpKey: string;
		userId?: string | null;
	},
): Promise<void> {
	const insert = db
		.prepare(
			'INSERT INTO pictures (id, parent_id, title, image_key, ogp_key, user_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6)',
		)
		.bind(input.id, input.parentId, input.title, input.imageKey, input.ogpKey, input.userId ?? null);

	if (input.parentId) {
		const incrementChildren = db
			.prepare('UPDATE pictures SET children_count = children_count + 1 WHERE id = ?1')
			.bind(input.parentId);
		await db.batch([insert, incrementChildren]);
	} else {
		await insert.run();
	}
}
