import { expect, test } from "@playwright/test";
import { deletePictureByTitle, getPictureByTitle } from "./supabase";

test.describe("Graph表示と祖先チェーン", () => {
	const parentTitle = `E2E_PARENT_${Date.now()}`;
	const childTitle = `E2E_CHILD_${Date.now()}`;

	const dummyFile = { name: "picture.png", mimeType: "image/png", buffer: Buffer.from([0]) };

	test.beforeAll(async ({ request }) => {
		await request.post("/draw", {
			multipart: { title: parentTitle, picture: dummyFile, ogp: dummyFile },
		});

		const parent = await getPictureByTitle(parentTitle);
		if (!parent) throw new Error("failed to create parent picture for test setup");

		await request.post(`/reply/${parent.id}`, {
			multipart: {
				title: childTitle,
				parentId: parent.id,
				picture: dummyFile,
				ogp: dummyFile,
			},
		});
	});

	test.afterAll(async () => {
		await deletePictureByTitle(childTitle);
		await deletePictureByTitle(parentTitle);
	});

	test("/graph が正常に表示される", async ({ page }) => {
		const response = await page.goto("/graph");
		expect(response?.status()).toBe(200);
		await expect(page.locator("body")).not.toContainText("Error");
	});

	test("/reply/:postId で祖先チェーン(親子2件)が表示される", async ({ page }) => {
		const child = await getPictureByTitle(childTitle);
		if (!child) throw new Error("child picture not found");

		await page.goto(`/reply/${child.id}`);
		const ancestorImages = page.locator("ul img");
		await expect(ancestorImages).toHaveCount(2);
	});
});
