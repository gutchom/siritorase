import { expect, test } from "@playwright/test";

test("/terms が表示される", async ({ page }) => {
	const response = await page.goto("/terms");
	expect(response?.status()).toBe(200);
	await expect(page.getByRole("heading", { name: "利用規約" })).toBeVisible();
});

test("/privacy が表示される", async ({ page }) => {
	const response = await page.goto("/privacy");
	expect(response?.status()).toBe(200);
	await expect(page.getByRole("heading", { name: "プライバシーポリシー" })).toBeVisible();
});
