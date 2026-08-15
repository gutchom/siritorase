import { readFileSync } from "node:fs";
import path from "node:path";

function loadDevVars(): Record<string, string> {
	const filePath = path.resolve(import.meta.dirname, "../../.dev.vars");
	const content = readFileSync(filePath, "utf-8");
	const vars: Record<string, string> = {};
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const [key, ...rest] = trimmed.split("=");
		vars[key] = rest.join("=");
	}
	return vars;
}

const vars = loadDevVars();
export const SUPABASE_URL = vars.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = vars.SUPABASE_SERVICE_ROLE_KEY;

export async function deletePictureByTitle(title: string): Promise<void> {
	await fetch(`${SUPABASE_URL}/rest/v1/pictures?title=eq.${encodeURIComponent(title)}`, {
		method: "DELETE",
		headers: {
			apikey: SUPABASE_SERVICE_ROLE_KEY,
			Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
		},
	});
}

export async function getPictureByTitle(title: string): Promise<{ id: string; parent_id: string | null } | null> {
	const res = await fetch(
		`${SUPABASE_URL}/rest/v1/pictures?title=eq.${encodeURIComponent(title)}&select=id,parent_id`,
		{
			headers: {
				apikey: SUPABASE_SERVICE_ROLE_KEY,
				Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			},
		},
	);
	const rows = (await res.json()) as { id: string; parent_id: string | null }[];
	return rows[0] ?? null;
}
