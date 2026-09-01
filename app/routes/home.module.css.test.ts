import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	getCssDeclarations,
	getCssDeclarationsInDarkMedia,
} from "../testUtils/cssRule";

const cssFilePath = path.resolve(import.meta.dirname, "home.module.css");

describe(".lead (トップページの説明文)", () => {
	it("ダークモード用に、ライトモードとは異なる読める色を明示している", () => {
		const base = getCssDeclarations(cssFilePath, ".lead");
		const dark = getCssDeclarationsInDarkMedia(cssFilePath, ".lead");

		expect(base.color).toBeDefined();
		expect(dark.color).toBeDefined();
		// ダークモード時に地の色(ほぼ黒)へ沈んで見えなくならないよう、
		// ライトモードのままの色を流用していないことを保証する。
		expect(dark.color).not.toBe(base.color);
	});
});
