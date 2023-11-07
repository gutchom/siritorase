import store from './store';

type Account = {
  user?: User;
  token?: Token;
};

type User = {
  id: string;
  icon: string;
  name: string;
  handle: string;
};

type Token = {
  scope: string;
  token_type: 'bearer';
  access_token: string;
};

const apiKey = import.meta.env.TWITTER_API_KEY;
const callbackUrl = import.meta.env.TWITTER_CALLBACK;
const [get, set] = store<Account>(localStorage, 'twitter');

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export function api(
  endpoint: string,
  method: Method,
  { body, query }: { body?: BodyInit; query?: URLSearchParams },
) {
  const account = get();
  if (!account) throw new Error('twitter: not logged in');
  const { token } = account;
  if (!token) throw new Error('twitter: not logged in');

  const url = new URL(endpoint, 'https://api.twitter.com/2');
  if (query) url.search = query.toString();
  const headers = new Headers([
    ['Authorization', `Bearer ${token.access_token}`],
  ]);
  const init: RequestInit = { method, headers, body };
  if (!body) delete init.body;
  const request = new Request(url, init);

  return fetch(request);
}

export function authorize(): void {
  localStorage.setItem('path', location.pathname);

  const url = createUrlWithParams('https://twitter.com/i/oauth2/authorize', [
    ['client_id', apiKey],
    ['redirect_uri', callbackUrl],
    ['state', location.pathname],
    ['response_type', 'code'],
    ['code_challenge', 'challenge'],
    ['code_challenge_method', 'plain'],
    ['scope', 'tweet.read users.read'],
  ]);

  window.open(url, '_blank');
}

export async function callback(): Promise<void> {
  const search = new URLSearchParams(location.search);
  const code = search.get('code');
  const state = search.get('state');
  const path = localStorage.getItem('path');

  localStorage.removeItem('path');

  if (!code || !state || state !== path) {
    location.assign(path ?? '/');
    throw new Error('Invalid OAuth2 response');
  }

  const body = createFormData([
    ['code', code],
    ['client_id', apiKey],
    ['redirect_uri', callbackUrl],
    ['code_verifier', 'challenge'],
    ['grant_type', 'authorization_code'],
  ]);

  const response = await fetch('https://api.twitter.com/i/oauth2/token', {
    method: 'POST',
    mode: 'cors',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });

  const token = await response.json();

  if (!isToken(token)) throw new Error('Invalid OAuth2 response');

  set((account) => ({ ...account, token }));

  api('/2/users/me', 'GET', {});
}

function isToken(response: unknown): response is Token {
  if (typeof response !== 'object') return false;
  if (response === null) return false;

  return 'token_type' in response && 'access_token' in response;
}

type KeyValue = [string, string];

function createFormData(fields: KeyValue[]): FormData {
  const f = new FormData();
  fields.forEach(([k, v]) => f.append(k, encodeURIComponent(v)));
  return f;
}

function createUrlWithParams(url: string, params: KeyValue[]): URL {
  const u = new URL(url);
  params.forEach(([k, v]) => u.searchParams.set(k, encodeURIComponent(v)));
  return u;
}
