import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.get('/images/:type{picture|ogp}/:filename', async (c) => {
	const { type, filename } = c.req.param();
	if (!/^[a-zA-Z0-9_-]+\.png$/.test(filename)) {
		return c.notFound();
	}

	const object = await c.env.PICTURES_BUCKET.get(`${type}/${filename}`);
	if (!object) {
		return c.notFound();
	}

	return new Response(object.body, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
			ETag: object.httpEtag,
		},
	});
});

export default app;
