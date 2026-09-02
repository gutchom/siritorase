import { expect, test } from "@playwright/test";
import { deletePictureByTitle, getPictureByTitle } from "./supabase";

const dummyFile = {
	name: "picture.png",
	mimeType: "image/png",
	buffer: Buffer.from([0]),
};

// getAllPictures()はDBアクセスを減らすためKVに短TTLでキャッシュされる
// (app/lib/db/pictures.server.ts)。新規投稿(createPicture)時にキャッシュを
// 即時破棄しない実装だと、投稿直後に/graphや/reply/:postIdを開いても、
// キャッシュのTTLが切れるまで自分の投稿がマップに反映されない回帰が起こりうる。
test.describe("投稿直後のしりとりマップにキャッシュ抜けが起きないこと", () => {
	const title = `E2E_CACHE_${Date.now()}`;

	test.afterAll(async () => {
		await deletePictureByTitle(title);
	});

	test("投稿直後の/graphに新しい絵が反映されている", async ({
		page,
		request,
	}) => {
		// 事前に/graphを一度開き、getAllPicturesのキャッシュを温めておく
		await page.goto("/graph");

		await request.post("/draw", {
			multipart: { title, picture: dummyFile, ogp: dummyFile },
		});
		const created = await getPictureByTitle(title);
		if (!created) throw new Error("failed to create picture for test setup");

		await page.goto("/graph");
		const html = await page.content();
		expect(html).toContain(created.id);
	});
});
