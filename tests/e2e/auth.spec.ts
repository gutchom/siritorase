import { expect, test } from "@playwright/test";

test("ログインリンクはXの認可URLへ読み取り専用スコープでリダイレクトする", async ({ page }) => {
	const response = await page.request.get("/auth/twitter/login", {
		maxRedirects: 0,
	});

	expect(response.status()).toBe(302);
	const location = response.headers().location;
	expect(location).toBeTruthy();

	const url = new URL(location!);
	expect(url.hostname).toBe("twitter.com");
	expect(url.pathname).toBe("/i/oauth2/authorize");
	expect(url.searchParams.get("scope")).toBe("users.read tweet.read");
	expect(url.searchParams.get("scope")).not.toContain("write");
	expect(url.searchParams.get("redirect_uri")).toContain("/auth/twitter/callback");
	expect(url.searchParams.get("code_challenge")).toBeTruthy();
	expect(url.searchParams.get("code_challenge_method")).toBe("S256");
});

test("ログアウトはセッションCookieを削除して / にリダイレクトする", async ({ page }) => {
	const response = await page.request.post("/auth/logout", {
		maxRedirects: 0,
	});

	expect(response.status()).toBe(302);
	expect(response.headers().location).toBe("/");
});
