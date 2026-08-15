function base64url(bytes: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(bytes)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export function generateState(): string {
	return crypto.randomUUID();
}

export function generateCodeVerifier(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return base64url(bytes.buffer);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
	return base64url(digest);
}
