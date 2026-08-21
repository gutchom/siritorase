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

// tweet_id/tweet_screen_nameはsupabase/migrations/0002_add_tweet_link.sqlの適用後にのみ存在する列。
export async function getPictureTweetInfoByTitle(
	title: string,
): Promise<{ id: string; tweet_id: string | null; tweet_screen_name: string | null } | null> {
	const res = await fetch(
		`${SUPABASE_URL}/rest/v1/pictures?title=eq.${encodeURIComponent(title)}&select=id,tweet_id,tweet_screen_name`,
		{
			headers: {
				apikey: SUPABASE_SERVICE_ROLE_KEY,
				Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			},
		},
	);
	if (!res.ok) {
		throw new Error(`Failed to fetch picture tweet info: ${res.status} ${await res.text()}`);
	}
	const rows = (await res.json()) as {
		id: string;
		tweet_id: string | null;
		tweet_screen_name: string | null;
	}[];
	return rows[0] ?? null;
}
