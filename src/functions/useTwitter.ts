import useLocalStorage from '@/functions/useStorage.ts';

const api = 'https://api.twitter.com';

export default function useTwitter(): {
  user?: User;
  login(): void;
  logout(): void;
} {
  const [{ user, token }, set] = useLocalStorage<Account>('twitter', {});

  const a = [
    ['response_type', 'code'],
    ['client_id', 'M1M5R3BMVy13QmpScXkzTUt5OE46MTpjaQ'],
    ['redirect_uri', 'https://www.example.com'],
    [
      'scope',
      'tweet.read users.read account.follows.read account.follows.write',
    ],
    ['state', 'state'],
    ['code_challenge', 'challenge'],
    ['code_challenge_method', 'plain'],
  ];
  function getUser(token: Token) {}

  function login() {
    const endpoint = new URL('https://api.twitter.com/2/users/me');
    endpoint.searchParams.set('response_type', 'code');
    endpoint.searchParams.set(
      'client_id',
      'M1M5R3BMVy13QmpScXkzTUt5OE46MTpjaQ',
    );
    endpoint.searchParams.set('redirect_uri', 'https://siritorase.app/twitter');
    endpoint.searchParams.set('scope', 'tweet.read users.read');
    const callback = `/auth?state=${location.pathname}`;
    const url = `${api}/oauth/request_token?oauth_callback=${callback}`;
    fetch(url, { method: 'POST' })
      .then((response) => response.text())
      .then(parseOAuthToken)
      .then((token) => {
        set({ user, token });
      });
  }

  function logout() {
    set({});
  }

  return { user, login, logout };
}

function redirectToOAuth(token: Token) {
  window.open(`${api}/oauth/authenticate?oauth_token=${token}`, '_blank');
}

function parseOAuthToken(text: string): Token {
  const params = new URLSearchParams(text);
  const key = params.get('oauth_token');
  const secret = params.get('oauth_token_secret');
  const confirmed = params.get('oauth_callback_confirmed');

  if (!key || !secret || confirmed !== 'true') {
    throw new Error('twitter: request token failed');
  }

  return { key, secret };
}
