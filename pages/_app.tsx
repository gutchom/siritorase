import 'reset-css';
import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import { Header } from 'features/Layout/Header';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Header />
      <Component {...pageProps} />
    </RecoilRoot>
  );
}
