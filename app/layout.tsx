import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ramadanmajlis.nextacademyedu.com'),
  title: 'Ramadan Majlis 2026',
  description: 'Ramadan Majlis for Entrepreneurs - An exceptional experience combining spirituality and growth',
  icons: {
    icon: '/majlis_logo.svg',
  },
  openGraph: {
    title: 'Ramadan Majlis 2026',
    description: 'Ramadan Majlis for Entrepreneurs - An exceptional experience combining spirituality and growth',
    url: 'https://www.ramadanmajlis.nextacademyedu.com',
    siteName: 'Ramadan Majlis',
    images: [
      {
        url: '/majlis_logo.svg',
        width: 800,
        height: 600,
        alt: 'Ramadan Majlis Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ramadan Majlis 2026',
    description: 'Join the Elite at Ramadan Majlis.',
    images: ['/majlis_logo.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={outfit.className} suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
