import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCssDeclarations } from "../../testUtils/cssRule";

const cssFilePath = path.resolve(import.meta.dirname, "index.module.css");

describe(".title (続きを描く画面のタイトル入力欄)", () => {
	it("ダークモードでも文字色と背景色が明示され、白背景に白文字で消えることがない", () => {
		const decl = getCssDeclarations(cssFilePath, ".title");

		// color-schemeがOS/ブラウザのダーク設定を継承すると、colorを指定しない限り
		// ネイティブ入力欄の文字色がUAのダーク既定色(白)になり、明示したbackground: #fff
		// と衝突して文字が見えなくなる。この3点を明示することでその回帰を防ぐ。
		expect(decl["color-scheme"]).toBe("light");
		expect(decl.background).toBe("#fff");
		expect(decl.color).toBeDefined();
		expect(decl.color).not.toBe(decl.background);
	});
});
