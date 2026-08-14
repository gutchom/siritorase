CREATE TABLE users (
	id TEXT PRIMARY KEY,
	username TEXT NOT NULL,
	name TEXT NOT NULL,
	profile_image_url TEXT,
	access_token TEXT NOT NULL,
	refresh_token TEXT NOT NULL,
	token_expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE pictures (
	id TEXT PRIMARY KEY,
	parent_id TEXT REFERENCES pictures(id),
	title TEXT NOT NULL,
	image_key TEXT NOT NULL,
	ogp_key TEXT NOT NULL,
	tweet_id TEXT,
	tweet_user_id TEXT,
	user_id TEXT REFERENCES users(id),
	children_count INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_pictures_parent_id ON pictures(parent_id);
CREATE INDEX idx_pictures_user_id ON pictures(user_id);
