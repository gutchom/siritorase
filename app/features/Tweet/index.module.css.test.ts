import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCssDeclarations } from "../../testUtils/cssRule";

const cssFilePath = path.resolve(import.meta.dirname, "index.module.css");

describe(".linkInput (ツイートURL貼り付け欄)", () => {
	it("ダークモードでも文字色と背景色が明示され、白背景に白文字で消えることがない", () => {
		const decl = getCssDeclarations(cssFilePath, ".linkInput");

		expect(decl["color-scheme"]).toBe("light");
		expect(decl.background).toBe("#fff");
		expect(decl.color).toBeDefined();
		expect(decl.color).not.toBe(decl.background);
	});
});
