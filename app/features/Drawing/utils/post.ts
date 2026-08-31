import type { PictureType } from '../types';
import generateOGP from './OGP';

export default async function buildPostFormData(
	title: string,
	parentId: string | null,
	picture: HTMLCanvasElement,
	ancestors: PictureType[],
	ancestorImages: HTMLImageElement[],
): Promise<FormData> {
	const [pictureBlob, ogpBlob] = await Promise.all([
		canvasToBlob(picture),
		// OGP画像に写る「今回投稿した絵」のキャプションは答えそのものなので、
		// 実タイトルではなく？？？を表示して伏せる(DBに保存するtitleは実タイトルのまま)。
		generateOGP('？？？', picture, ancestors, ancestorImages).then(canvasToBlob),
	]);

	const formData = new FormData();
	formData.set('title', title);
	if (parentId) {
		formData.set('parentId', parentId);
	}
	formData.set('picture', pictureBlob, 'picture.png');
	formData.set('ogp', ogpBlob, 'ogp.png');
	return formData;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			blob === null ? reject(new Error('blob is null')) : resolve(blob);
		});
	});
}
