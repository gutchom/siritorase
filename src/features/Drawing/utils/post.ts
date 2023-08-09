import type { PostItem } from '../types';
import canvasToBlob from './canvasToBlob';
import generatePage from './generatePage';
import generateOGP from './generateOGP';
import generateThumbnail from './generateThumbnail';

/*
  page -> /:id/index.html
  ogp -> /:id/ogp.png
  pic -> /:id/:title.png
  thumb -> /:id/thumbnail.png
*/

type WriteResponse = {
  id: string;
  page: string;
  pic: string;
  ogp: string;
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

function isValid(json: Record<string, unknown>): json is WriteResponse {
  const hasId = 'id' in json && typeof json.id === 'string';
  const hasOGP = 'ogp' in json && typeof json.ogp === 'string';
  const hasHTML = 'html' in json && typeof json.html === 'string';
  const hasPicture = 'pic' in json && typeof json.picture === 'string';
  const hasThumbnail = 'thumb' in json && typeof json.thumbnail === 'string';

  return hasId && hasHTML && hasOGP && hasPicture && hasThumbnail;
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
