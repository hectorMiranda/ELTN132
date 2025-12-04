import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AppLayout from '../App';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppLayout>
      <Component {...pageProps} />
      <SpeedInsights />
    </AppLayout>
  );
}