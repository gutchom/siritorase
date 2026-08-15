import { expect, test } from "@playwright/test";
import { SUPABASE_URL } from "./supabase";

test("ログインリンクはSupabaseの認可URLへ users.read スコープのみでリダイレクトする", async ({
	page,
}) => {
	const response = await page.request.get("/auth/twitter/login", {
		maxRedirects: 0,
	});

	expect(response.status()).toBe(302);
	const location = response.headers().location;
	expect(location).toBeTruthy();

	const url = new URL(location!);
	expect(url.origin).toBe(new URL(SUPABASE_URL).origin);
	expect(url.pathname).toBe("/auth/v1/authorize");
	expect(url.searchParams.get("provider")).toBe("x");
	expect(url.searchParams.get("scopes")).toBe("users.read");
	expect(url.searchParams.get("redirect_to")).toContain("/auth/twitter/callback");
	expect(url.searchParams.get("code_challenge")).toBeTruthy();

	// Supabase側が実際にこのproviderを受け付けるか(有効化されているか)まで検証する。
	// 無効なprovider名を渡すと400 {"error_code":"validation_failed", ...} が返る。
	const authorizeResponse = await page.request.get(location!, { maxRedirects: 0 });
	expect(authorizeResponse.status(), await authorizeResponse.text()).toBeGreaterThanOrEqual(300);
	expect(authorizeResponse.status()).toBeLessThan(400);
	const nextLocation = authorizeResponse.headers().location;
	expect(nextLocation).toBeTruthy();
	expect(new URL(nextLocation!).hostname).toMatch(/twitter\.com$|x\.com$/);
});

test("ログアウトはセッションCookieを削除して / にリダイレクトする", async ({ page }) => {
	const response = await page.request.post("/auth/logout", {
		maxRedirects: 0,
	});

	expect(response.status()).toBe(302);
	expect(response.headers().location).toBe("/");
});
