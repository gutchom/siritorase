import { expect, test } from "@playwright/test";

test("ホーム画面に導線とサービス説明モーダルが表示される", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("link", { name: "新しくしりとりを始める" })).toHaveAttribute(
		"href",
		"/draw",
	);
	await expect(page.getByRole("link", { name: "みんなの絵を見る" })).toHaveAttribute(
		"href",
		"/graph",
	);

	await expect(page.getByText("しりとらせとは？")).toBeVisible();
	await expect(page.getByRole("link", { name: "Twitterでログイン！" })).toHaveAttribute(
		"href",
		"/auth/twitter/login",
	);
});
