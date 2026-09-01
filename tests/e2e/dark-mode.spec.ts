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

async function getColorAndBackground(
	locator: import("@playwright/test").Locator,
) {
	return locator.evaluate((el) => {
		const s = getComputedStyle(el);
		return { color: s.color, background: s.backgroundColor };
	});
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

		const style = await getColorAndBackground(titleInput);

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

		const style = await getColorAndBackground(urlInput);

		expect(style.color).not.toBe(style.background);
		expect(style.background).toBe("rgb(255, 255, 255)");
		expect(style.color).not.toBe("rgb(255, 255, 255)");
	});

	test("トップページの説明モーダル本文が、白背景に白文字で消えない", async ({
		page,
	}) => {
		await page.goto("/");

		const paragraph = page.locator('[class*="_paragraph_"]');
		await expect(paragraph).toBeVisible();
		await expect(paragraph).toContainText("しりとらせ");

		const style = await getColorAndBackground(paragraph);

		expect(style.color).not.toBe(style.background);
		expect(style.color).not.toBe("rgb(255, 255, 255)");
	});

	test("ツイート下書きのプレビュー文言が、白背景に白文字で消えない", async ({
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

		const preview = page.locator('[class*="_container_scfdt"]');
		await expect(preview).toContainText("絵しりとりを描いたよ");

		const style = await getColorAndBackground(preview);

		expect(style.color).not.toBe(style.background);
		expect(style.color).not.toBe("rgb(255, 255, 255)");
	});

	test("トップページの説明文が、地の色(ほぼ黒)に沈んで消えない", async ({
		page,
	}) => {
		await page.goto("/");

		const lead = page.locator('[class*="_lead_"]');
		await expect(lead).toBeVisible();

		const style = await getColorAndBackground(lead);
		const bodyColor = await page.evaluate(
			() => getComputedStyle(document.body).backgroundColor,
		);

		expect(style.color).not.toBe(bodyColor);
	});
});
