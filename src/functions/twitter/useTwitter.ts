import { useLocalStorage } from '@/functions/useStorage';

const api = 'https://api.twitter.com';

export type Twitter = {
  user?: User;
  credentials?: Credentials;
};

type User = {
  id: string;
  name: string;
  icon: string;
};

type Credentials = {
  token: string;
  secret: string;
};

export default function useTwitter(): {
  user?: User;
  login(): void;
  logout(): void;
} {
  const [twitter, setTwitter] = useLocalStorage<Twitter>('twitter', {});
  const { user } = twitter;

  function login() {
    const callback = `${location.origin}/auth/callback/twitter?redirect=${location.pathname}`;
    const url = `${api}/oauth/request_token?oauth_callback=${callback}`;
    fetch(url, { method: 'POST' })
      .then((response) => response.text())
      .then((text) => {
        const params = new URLSearchParams(text);
        const token = params.get('oauth_token');
        const secret = params.get('oauth_token_secret');
        const confirmed = params.get('oauth_callback_confirmed');
        if (!token || !secret || confirmed !== 'true') return;
        const credentials: Credentials = { token, secret };
        setTwitter({ credentials });
        window.open(`${api}/oauth/authenticate?oauth_token=${token}`, '_blank');
      });
  }

  function logout() {
    setTwitter({});
  }

  return { user, login, logout };
}
