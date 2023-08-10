import type { PostItem } from '../types';
import canvasToBlob from './canvasToBlob';
import generatePage from './generatePage';
import generateOGP from './generateOGP';
import generateThumbnail from './generateThumbnail';

/*
  page -> /:id/index.html
  pic -> /:id/:title.png
  ogp -> /:id/ogp.png
  thumb -> /:id/thumbnail.png
*/

type WriteResponse = {
  id: string;
  page: string;
  ogp: string;
  pic: string;
  thumb: string;
};

export default async function post(
  title: string,
  picture: HTMLCanvasElement,
  ancestors: PostItem[],
): Promise<string> {
  const res = await write(title, picture, ancestors);
  const { id, page, pic, ogp, thumb } = res;
  const history = [...ancestors, { id, title }];
  const digest = ancestors.slice(-2).map(({ title }) => title);

  await Promise.all([
    upload(pic, await canvasToBlob(picture)),
    upload(ogp, await canvasToBlob(await generateOGP(picture, history))),
    upload(thumb, await canvasToBlob(await generateThumbnail(picture))),
  ]);

  await upload(page, generatePage(id, digest, history), 'text/html');

  return id;
}

async function write(
  title: string,
  picture: HTMLCanvasElement,
  ancestors: PostItem[],
): Promise<WriteResponse> {
  const res = await fetch('/api/post', {
    method: 'POST',
    body: JSON.stringify({ title, picture, ancestors }),
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('failed to post');
  const json = await res.json();

  if (isValid(json)) {
    return json;
  } else {
    throw new Error('failed to post');
  }
}

const properties: Readonly<(keyof WriteResponse)[]> = [
  'id',
  'page',
  'ogp',
  'pic',
  'thumb',
] as const;

function isValid(json: Record<string, unknown>): json is WriteResponse {
  return properties.every(
    (key) => key in json && typeof json[key] === 'string',
  );
}

function upload(
  url: string,
  body: Blob | string,
  type = 'image/png',
): Promise<Response> {
  return fetch(url, {
    body,
    method: 'PUT',
    cache: 'no-cache',
    headers: {
      'Content-Type': type,
    },
  });
}
