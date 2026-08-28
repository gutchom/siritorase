import { nanoid } from 'nanoid';
import { useCallback, useRef, useState } from 'react';
import Ancestors from '../features/Ancestors';
import Drawing from '../features/Drawing';
import type { PictureNode, PictureType } from '../features/Drawing/types';
import Graph from '../features/Graph';
import Tweet from '../features/Tweet';
import { getCurrentUser } from '../lib/auth.server';
import { createPicture, getAllPictures, getAncestors } from '../lib/db/pictures.server';
import { imageUrl } from '../lib/imageUrl';
import type { Route } from './+types/draw';
import styles from './draw.module.css';

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const postId = 'postId' in params ? params.postId : undefined;
	const env = context.cloudflare.env;
	const rows = postId ? await getAncestors(env, postId) : [];

	// getAncestorsはpostId自身(depth 0)も含めてroot→postIdの順で返す。
	const ancestors: PictureType[] = rows.map((row) => ({
		id: row.id,
		src: imageUrl(row.image_key),
		title: row.title,
		created: new Date(row.created_at),
		tweetId: row.tweet_id,
		tweetScreenName: row.tweet_screen_name,
	}));

	// /reply/:postIdはツイートで共有されるURLでもあるため、その絵単体の
	// 描画キャンバスではなく、しりとり全体の中でのこの絵の位置(しりとりマップ)を
	// 常に表示する。マップの描画にはpictures全件が要る。
	const mapPictures: PictureNode[] | null = postId
		? (await getAllPictures(env)).map((row) => ({
				id: row.id,
				parentId: row.parent_id ?? '',
				src: imageUrl(row.image_key),
				title: row.title,
				created: new Date(row.created_at),
				userId: row.user_id,
			}))
		: null;

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

	return { ancestors, mapPictures, share };
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

function PostMap(props: {
	pictures: PictureNode[];
	targetId: string;
	history: string;
	parentTweetId?: string | null;
	parentTweetScreenName?: string | null;
}) {
	const { pictures, targetId, history, parentTweetId, parentTweetScreenName } = props;
	const [graphReady, setGraphReady] = useState(false);

	return (
		<div className={styles.mapSection}>
			<Graph pictures={pictures} targetId={targetId} onReady={() => setGraphReady(true)} />
			{graphReady && (
				<div className={styles.tweetOverlay}>
					<Tweet
						pictureId={targetId}
						history={history}
						parentTweetId={parentTweetId}
						parentTweetScreenName={parentTweetScreenName}
					/>
				</div>
			)}
		</div>
	);
}

export default function Draw({ loaderData }: Route.ComponentProps) {
	const { ancestors, mapPictures } = loaderData;
	const imagesRef = useRef<HTMLImageElement[]>([]);

	const imageRef = useCallback((img: HTMLImageElement | null) => {
		if (img) {
			imagesRef.current.push(img);
		}
	}, []);

	const target = ancestors[ancestors.length - 1];
	const parent = ancestors[ancestors.length - 2];

	return (
		<>
			{mapPictures && target && (
				<PostMap
					pictures={mapPictures}
					targetId={target.id}
					history={ancestors.map((ancestor) => ancestor.title).join(' → ')}
					parentTweetId={parent?.tweetId}
					parentTweetScreenName={parent?.tweetScreenName}
				/>
			)}
			<Ancestors ancestors={ancestors} imageRef={imageRef} />
			<Drawing
				ancestors={ancestors}
				images={imagesRef.current}
				// 投稿完了後は/reply/:newId(=投稿した絵自身の恒久リンク)へ遷移し、
				// そのページのしりとりマップをそのまま見せる。react-routerの
				// useNavigate()によるクライアント遷移では、/draw と /reply/:postId が
				// 別ルートid(draw-new/draw-reply)でありながら同一コンポーネントを
				// 共有しているためか、URLだけ変わってloaderの再取得が完了しない
				// 不具合が確認できたため、確実に新しいSSRページとして読み込まれる
				// フルページ遷移にしている。
				onComplete={(id) => {
					window.location.href = `/reply/${id}`;
				}}
			/>
		</>
	);
}
