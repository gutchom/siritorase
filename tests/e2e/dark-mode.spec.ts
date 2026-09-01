import { expect, test } from "@playwright/test";
import { deletePictureByTitle } from "./supabase";

async function drawScribble(page: import("@playwright/test").Page) {
	const canvas = page.locator("canvas").last();
	const box = await canvas.boundingBox();
	if (!box) throw new Error("canvas bounding box not found");

	await page.mouse.move(box.x + 50, box.y + 50);
	await page.mouse.down();
	await page.mouse.move(box.x + 150, box.y + 100, { steps: 5 });
	await page.mouse.move(box.x + 100, box.y + 200, { steps: 5 });
	await page.mouse.up();
}

// OS/ブラウザがダークモードの場合、html/bodyにcolor-scheme: darkが適用される
// (app/app.css)。フォーム部品側で文字色・背景色を明示していないと、ネイティブ
// input要素がUAのダーク既定色で描画され、白背景に白文字で消えてしまう不具合の回帰テスト。
test.describe("ダークモードでもフォーム入力欄の文字が読めること", () => {
	test.use({ colorScheme: "dark" });

	const title = `E2E_DARKMODE_${Date.now()}`;

	test.afterAll(async () => {
		await deletePictureByTitle(title);
	});

	test("続きを描く画面のタイトル入力欄が、白背景に白文字で消えない", async ({
		page,
	}) => {
		await page.goto("/draw");

		const titleInput = page.getByPlaceholder("なに描いた？");
		await titleInput.fill(title);

		const style = await titleInput.evaluate((el) => {
			const s = getComputedStyle(el);
			return { color: s.color, background: s.backgroundColor };
		});

		expect(style.color).not.toBe(style.background);
		// 「見えない」ことの直接の再現条件(背景・文字とも白)にだけはならないことを保証する
		expect(style.background).toBe("rgb(255, 255, 255)");
		expect(style.color).not.toBe("rgb(255, 255, 255)");
	});

	test("ツイートURL貼り付け欄が、白背景に白文字で消えない", async ({
		page,
	}) => {
		await page.goto("/draw");
		await drawScribble(page);
		await page.getByPlaceholder("なに描いた？").fill(title);
		await page.getByRole("button", { name: "絵を投稿する" }).click();

		const tweetTrigger = page.getByRole("button", {
			name: "結果をツイートする",
		});
		await expect(tweetTrigger).toBeVisible({ timeout: 15_000 });
		await tweetTrigger.click();

		await page.getByRole("link", { name: "ツイートする" }).click();

		const urlInput = page.getByPlaceholder(
			"https://x.com/ユーザー名/status/...",
		);
		await expect(urlInput).toBeVisible();

		const style = await urlInput.evaluate((el) => {
			const s = getComputedStyle(el);
			return { color: s.color, background: s.backgroundColor };
		});

		expect(style.color).not.toBe(style.background);
		expect(style.background).toBe("rgb(255, 255, 255)");
		expect(style.color).not.toBe("rgb(255, 255, 255)");
	});
});
