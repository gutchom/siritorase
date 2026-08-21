import { expect, test } from "@playwright/test";
import { deletePictureByTitle, getPictureByTitle, getPictureTweetInfoByTitle } from "./supabase";

async function drawScribble(page: import("@playwright/test").Page) {
	const canvas = page.locator("canvas");
	const box = await canvas.boundingBox();
	if (!box) throw new Error("canvas bounding box not found");

	await page.mouse.move(box.x + 50, box.y + 50);
	await page.mouse.down();
	await page.mouse.move(box.x + 150, box.y + 100, { steps: 5 });
	await page.mouse.move(box.x + 100, box.y + 200, { steps: 5 });
	await page.mouse.up();
}

test.describe("ツイートの手動リンクによる返信スレッド化", () => {
	const parentTitle = `E2E_TWEETLINK_PARENT_${Date.now()}`;
	const childTitle = `E2E_TWEETLINK_CHILD_${Date.now()}`;
	const grandchildTitle = `E2E_TWEETLINK_GRANDCHILD_${Date.now()}`;
	const fakeTweetId = "1234567890123456789";
	const fakeScreenName = "e2e_test_user";

	// ブラウザ側でcanvasに描画・合成するために、実際にデコード可能な1x1 PNGを使う
	// (graph-and-ancestors.spec.tsの1バイトダミーはAPI経由のみの検証で画像デコードが不要なため使えない)
	const validPngBase64 =
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
	const dummyFile = {
		name: "picture.png",
		mimeType: "image/png",
		buffer: Buffer.from(validPngBase64, "base64"),
	};

	test.afterAll(async () => {
		await deletePictureByTitle(grandchildTitle);
		await deletePictureByTitle(childTitle);
		await deletePictureByTitle(parentTitle);
	});

	test("ツイートURLを貼って保存すると、次の続きのツイートが返信として繋がる", async ({ page, request }) => {
		await request.post("/draw", {
			multipart: { title: parentTitle, picture: dummyFile, ogp: dummyFile },
		});
		const parent = await getPictureByTitle(parentTitle);
		if (!parent) throw new Error("failed to create parent picture for test setup");

		// 親の続きを描いてツイートリンクを保存する
		await page.goto(`/reply/${parent.id}`);
		await drawScribble(page);
		await page.getByPlaceholder("なに描いた？").fill(childTitle);
		await page.getByRole("button", { name: "絵を投稿する" }).click();

		const tweetTrigger = page.getByRole("button", { name: "結果をツイートする" });
		await expect(tweetTrigger).toBeVisible({ timeout: 15_000 });
		await tweetTrigger.click();

		const popupPromise = page.waitForEvent("popup");
		await page.getByRole("link", { name: "ツイートする" }).click();
		const popup = await popupPromise;
		await popup.close();

		const urlInput = page.getByPlaceholder("https://x.com/ユーザー名/status/...");
		await expect(urlInput).toBeVisible();
		await urlInput.fill(`https://x.com/${fakeScreenName}/status/${fakeTweetId}`);
		await page.getByRole("button", { name: "保存" }).click();

		const child = await getPictureByTitle(childTitle);
		if (!child) throw new Error("child picture not found");

		await expect
			.poll(async () => getPictureTweetInfoByTitle(childTitle), { timeout: 10_000 })
			.toMatchObject({ tweet_id: fakeTweetId, tweet_screen_name: fakeScreenName });

		// 子の続きを描いた際のツイートintent URLが、保存したツイートへの返信になっていることを確認
		await page.goto(`/reply/${child.id}`);
		await drawScribble(page);
		await page.getByPlaceholder("なに描いた？").fill(grandchildTitle);
		await page.getByRole("button", { name: "絵を投稿する" }).click();

		const grandchildTweetTrigger = page.getByRole("button", { name: "結果をツイートする" });
		await expect(grandchildTweetTrigger).toBeVisible({ timeout: 15_000 });
		await grandchildTweetTrigger.click();

		const grandchildTweetLink = page.getByRole("link", { name: "ツイートする" });
		const href = await grandchildTweetLink.getAttribute("href");
		expect(href).toBeTruthy();
		const intentUrl = new URL(href!);
		expect(intentUrl.searchParams.get("in_reply_to")).toBe(fakeTweetId);
		expect(intentUrl.searchParams.get("via")).toBe(fakeScreenName);
	});
});
