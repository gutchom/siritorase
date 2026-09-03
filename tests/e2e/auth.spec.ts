import { expect, test } from "@playwright/test";

test("ログインリンクはOAuth 1.0aのリクエストトークン取得を経てXの認可画面へリダイレクトする", async ({
	page,
}) => {
	const response = await page.request.get("/auth/twitter/login", {
		maxRedirects: 0,
	});

	expect(response.status(), await response.text()).toBe(302);
	const location = response.headers().location;
	expect(location).toBeTruthy();

	const url = new URL(location!);
	expect(url.hostname).toBe("api.x.com");
	expect(url.pathname).toBe("/oauth/authorize");
	expect(url.searchParams.get("oauth_token")).toBeTruthy();
});

test("ログアウトはセッションCookieを削除して / にリダイレクトする", async ({ page }) => {
	const response = await page.request.post("/auth/logout", {
		maxRedirects: 0,
	});

	expect(response.status()).toBe(302);
	expect(response.headers().location).toBe("/");
});
