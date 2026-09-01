import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCssDeclarations } from "../../testUtils/cssRule";

const cssFilePath = path.resolve(import.meta.dirname, "index.module.css");

describe(".window (Modalの白い本体)", () => {
	it("常にライトカラーの箱として振る舞うよう、color-schemeと文字色を明示している", () => {
		const decl = getCssDeclarations(cssFilePath, ".window");

		// .windowはOS設定に関わらずbackground: #fffの白い箱として設計されている。
		// color-scheme: darkがhtml/bodyから継承されると、colorを明示しない子要素
		// (Introductionの説明文やTweetの下書きプレビューなど)の文字色がUAのダーク
		// 既定色(白)になり、白背景に白文字で消える。color-scheme: lightとcolorの
		// 明示でその継承を断ち切る。
		expect(decl["color-scheme"]).toBe("light");
		expect(decl.background).toBe("#fff");
		expect(decl.color).toBeDefined();
		expect(decl.color).not.toBe(decl.background);
	});
});
