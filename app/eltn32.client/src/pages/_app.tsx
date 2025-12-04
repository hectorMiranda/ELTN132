import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import AppLayout from '../App';
import { SpeedInsights } from '@vercel/speed-insights/next';
import * as gtag from '../lib/analytics';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AppLayout>
      <Component {...pageProps} />
      <SpeedInsights />
    </AppLayout>
  );
}