import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "./images";

function makeFakeCache() {
	const store = new Map<string, Response>();
	return {
		match: vi.fn(async (req: Request) => store.get(req.url)?.clone()),
		put: vi.fn(async (req: Request, res: Response) => {
			store.set(req.url, res.clone());
		}),
	};
}

function makeEnv(objects: Record<string, { body: string; etag: string }>) {
	const get = vi.fn(async (key: string) => {
		const object = objects[key];
		if (!object) return null;
		return { body: new Response(object.body).body, httpEtag: object.etag };
	});
	return { PICTURES_BUCKET: { get } } as unknown as Env;
}

function makeExecutionContext() {
	const tasks: Promise<unknown>[] = [];
	return {
		ctx: {
			waitUntil: (p: Promise<unknown>) => tasks.push(p),
		} as unknown as ExecutionContext,
		flush: () => Promise.all(tasks),
	};
}

describe("GET /images/:type/:filename", () => {
	let cache: ReturnType<typeof makeFakeCache>;

	beforeEach(() => {
		cache = makeFakeCache();
		vi.stubGlobal("caches", { default: cache });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("キャッシュ未ヒット時はR2から読み、レスポンスをキャッシュへ保存する", async () => {
		const env = makeEnv({ "picture/a.png": { body: "hello", etag: "e1" } });
		const { ctx, flush } = makeExecutionContext();

		const res = await app.fetch(
			new Request("http://localhost/images/picture/a.png"),
			env,
			ctx,
		);

		expect(res.status).toBe(200);
		expect(env.PICTURES_BUCKET.get).toHaveBeenCalledTimes(1);
		expect(cache.match).toHaveBeenCalledTimes(1);

		await flush();
		expect(cache.put).toHaveBeenCalledTimes(1);
	});

	it("キャッシュヒット時はR2に問い合わせない", async () => {
		const env = makeEnv({ "picture/a.png": { body: "hello", etag: "e1" } });
		const { ctx, flush } = makeExecutionContext();

		await app.fetch(
			new Request("http://localhost/images/picture/a.png"),
			env,
			ctx,
		);
		await flush();
		expect(env.PICTURES_BUCKET.get).toHaveBeenCalledTimes(1);

		const res = await app.fetch(
			new Request("http://localhost/images/picture/a.png"),
			env,
			ctx,
		);

		expect(res.status).toBe(200);
		// キャッシュヒットなので、R2への問い合わせ回数は増えない
		expect(env.PICTURES_BUCKET.get).toHaveBeenCalledTimes(1);
	});

	it("不正なファイル名は404を返し、R2にもキャッシュにも問い合わせない", async () => {
		const env = makeEnv({});

		const res = await app.fetch(
			new Request("http://localhost/images/picture/../secret"),
			env,
		);

		expect(res.status).toBe(404);
		expect(env.PICTURES_BUCKET.get).not.toHaveBeenCalled();
		expect(cache.match).not.toHaveBeenCalled();
	});

	it("R2に存在しないオブジェクトは404を返す", async () => {
		const env = makeEnv({});

		const res = await app.fetch(
			new Request("http://localhost/images/picture/missing.png"),
			env,
		);

		expect(res.status).toBe(404);
	});
});
