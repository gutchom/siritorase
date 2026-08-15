import { expect, test } from "@playwright/test";
import { deletePictureByTitle, getPictureByTitle } from "./supabase";

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

test.describe("新規投稿→ツイート導線", () => {
	const title = `E2E_TEST_${Date.now()}`;

	test.afterAll(async () => {
		await deletePictureByTitle(title);
	});

	test("キャンバスに描いて投稿すると、tweet intent URLへのリンクが表示される", async ({
		page,
	}) => {
		await page.goto("/draw");

		await drawScribble(page);
		await page.getByPlaceholder("なに描いた？").fill(title);
		await page.getByRole("button", { name: "絵を投稿する" }).click();

		// 投稿完了後、Tweetコンポーネントに切り替わる(fetcher.dataによるクライアント状態遷移)
		const tweetTrigger = page.getByRole("button", { name: "結果をツイートする" });
		await expect(tweetTrigger).toBeVisible({ timeout: 15_000 });

		// Supabase Postgresに実際に保存されたことを確認
		const saved = await getPictureByTitle(title);
		expect(saved).not.toBeNull();
		expect(saved?.parent_id).toBeNull();

		await tweetTrigger.click();

		const tweetLink = page.getByRole("link", { name: "ツイートする" });
		await expect(tweetLink).toBeVisible();

		const href = await tweetLink.getAttribute("href");
		expect(href).toBeTruthy();
		const intentUrl = new URL(href!);
		expect(intentUrl.hostname).toBe("twitter.com");
		expect(intentUrl.pathname).toBe("/intent/tweet");
		expect(intentUrl.searchParams.get("text")).toContain(title);
		expect(intentUrl.searchParams.get("url")).toContain(saved!.id);
		expect(intentUrl.searchParams.get("hashtags")).toBe("しりとり,絵しりとり");
	});
});
