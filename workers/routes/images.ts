import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/images/:type{picture|ogp}/:filename", async (c) => {
	const { type, filename } = c.req.param();
	if (!/^[a-zA-Z0-9_-]+\.png$/.test(filename)) {
		return c.notFound();
	}

	// WorkersのfetchハンドラのレスポンスはCache-Controlヘッダーを付けても
	// 自動ではCloudflareのエッジキャッシュに乗らない(Cache Rule未設定のため)。
	// caches.defaultを明示的に使うことで、2回目以降は訪問者を問わずWorkers
	// の実行・R2アクセスを経由せずエッジから配信されるようにする。
	// lib.dom.d.tsのCacheStorage型には`default`が無く型エラーになるため、
	// Workersランタイム固有のプロパティとしてキャストして参照する。
	const cache = (caches as unknown as { default: Cache }).default;
	const cached = await cache.match(c.req.raw);
	if (cached) {
		return cached;
	}

	const object = await c.env.PICTURES_BUCKET.get(`${type}/${filename}`);
	if (!object) {
		return c.notFound();
	}

	const response = new Response(object.body, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
			ETag: object.httpEtag,
		},
	});

	c.executionCtx.waitUntil(cache.put(c.req.raw, response.clone()));
	return response;
});

export default app;
