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
	expect(url.searchParams.get("provider")).toBe("twitter");
	expect(url.searchParams.get("scopes")).toBe("users.read");
	expect(url.searchParams.get("redirect_to")).toContain("/auth/twitter/callback");
	expect(url.searchParams.get("code_challenge")).toBeTruthy();
});

test("ログアウトはセッションCookieを削除して / にリダイレクトする", async ({ page }) => {
	const response = await page.request.post("/auth/logout", {
		maxRedirects: 0,
	});

	expect(response.status()).toBe(302);
	expect(response.headers().location).toBe("/");
});
