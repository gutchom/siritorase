import 'reset-css';
import 'styles/global.css';
import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import Header from 'features/Header';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Header />
      <Component {...pageProps} />
    </RecoilRoot>
  );
}
