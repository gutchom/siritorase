export async function upsertUser(
	db: D1Database,
	input: {
		id: string;
		username: string;
		name: string;
		profileImageUrl: string | null;
		accessToken: string;
		refreshToken: string;
		tokenExpiresAt: Date;
	},
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO users (id, username, name, profile_image_url, access_token, refresh_token, token_expires_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now'))
			ON CONFLICT(id) DO UPDATE SET
				username = excluded.username,
				name = excluded.name,
				profile_image_url = excluded.profile_image_url,
				access_token = excluded.access_token,
				refresh_token = excluded.refresh_token,
				token_expires_at = excluded.token_expires_at,
				updated_at = datetime('now')`,
		)
		.bind(
			input.id,
			input.username,
			input.name,
			input.profileImageUrl,
			input.accessToken,
			input.refreshToken,
			input.tokenExpiresAt.toISOString(),
		)
		.run();
}

export type UserTokens = {
	accessToken: string;
	refreshToken: string;
	tokenExpiresAt: Date;
};

export async function getUserTokens(db: D1Database, userId: string): Promise<UserTokens | null> {
	const row = await db
		.prepare('SELECT access_token, refresh_token, token_expires_at FROM users WHERE id = ?1')
		.bind(userId)
		.first<{ access_token: string; refresh_token: string; token_expires_at: string }>();

	if (!row) {
		return null;
	}

	return {
		accessToken: row.access_token,
		refreshToken: row.refresh_token,
		tokenExpiresAt: new Date(row.token_expires_at),
	};
}

export async function updateUserTokens(
	db: D1Database,
	userId: string,
	tokens: UserTokens,
): Promise<void> {
	await db
		.prepare(
			`UPDATE users SET access_token = ?1, refresh_token = ?2, token_expires_at = ?3, updated_at = datetime('now') WHERE id = ?4`,
		)
		.bind(tokens.accessToken, tokens.refreshToken, tokens.tokenExpiresAt.toISOString(), userId)
		.run();
}
