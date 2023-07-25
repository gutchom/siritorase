import 'reset-css';
import 'src/styles/global.css';
import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import Header from 'src/features/Header';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Header />
      <Component {...pageProps} />
    </RecoilRoot>
  );
}
