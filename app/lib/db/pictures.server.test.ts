import { beforeEach, describe, expect, it, vi } from "vitest";

const { supabaseMock, kvStore } = vi.hoisted(() => {
	const rows = [
		{
			id: "a",
			parent_id: null,
			title: "t1",
			image_key: "picture/a.png",
			user_id: null,
			created_at: "2026-01-01T00:00:00Z",
		},
	];
	const orderMock = vi.fn(() => Promise.resolve({ data: rows, error: null }));
	const selectMock = vi.fn(() => ({ order: orderMock }));
	const fromMock = vi.fn(() => ({ select: selectMock }));
	const rpcMock = vi.fn(() => Promise.resolve({ error: null }));
	return {
		supabaseMock: {
			from: fromMock,
			select: selectMock,
			order: orderMock,
			rpc: rpcMock,
		},
		kvStore: new Map<string, string>(),
	};
});

vi.mock("../supabase.server", () => ({
	createSupabaseAdminClient: () => supabaseMock,
}));

const { getAllPictures, createPicture } = await import("./pictures.server");

function makeEnv() {
	return {
		KV_BINDING: {
			get: vi.fn(async (key: string, type?: string) => {
				const value = kvStore.get(key);
				if (value === undefined) return null;
				return type === "json" ? JSON.parse(value) : value;
			}),
			put: vi.fn(async (key: string, value: string) => {
				kvStore.set(key, value);
			}),
			delete: vi.fn(async (key: string) => {
				kvStore.delete(key);
			}),
		},
	} as unknown as Env;
}

describe("getAllPictures / createPicture のKVキャッシュ", () => {
	beforeEach(() => {
		kvStore.clear();
		supabaseMock.from.mockClear();
		supabaseMock.rpc.mockClear();
	});

	it("2回目の呼び出しはキャッシュから返し、DBに問い合わせない", async () => {
		const env = makeEnv();

		const first = await getAllPictures(env);
		expect(supabaseMock.from).toHaveBeenCalledTimes(1);
		expect(first).toEqual([
			{
				id: "a",
				parent_id: null,
				title: "t1",
				image_key: "picture/a.png",
				user_id: null,
				created_at: "2026-01-01T00:00:00Z",
			},
		]);

		const second = await getAllPictures(env);
		expect(supabaseMock.from).toHaveBeenCalledTimes(1);
		expect(second).toEqual(first);
	});

	it("createPictureはキャッシュを破棄し、次回のgetAllPicturesはDBへ再問い合わせする", async () => {
		const env = makeEnv();

		await getAllPictures(env);
		expect(supabaseMock.from).toHaveBeenCalledTimes(1);

		await createPicture(env, {
			id: "b",
			parentId: null,
			title: "t2",
			imageKey: "picture/b.png",
			ogpKey: "ogp/b.png",
		});
		expect(supabaseMock.rpc).toHaveBeenCalledTimes(1);

		await getAllPictures(env);
		expect(supabaseMock.from).toHaveBeenCalledTimes(2);
	});
});
