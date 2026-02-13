import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ramadanmajlis.nextacademyedu.com'),
  title: 'Ramadan Majlis 2026',
  description: 'Ramadan Majlis for Entrepreneurs - An exceptional experience combining spirituality and growth',
  // icons: {
  //   icon: '/majlis_logo.png',
  //   shortcut: '/majlis_logo.png',
  //   apple: '/majlis_logo.png',
  // },
  openGraph: {
    title: 'Ramadan Majlis 2026',
    description: 'Ramadan Majlis for Entrepreneurs - An exceptional experience combining spirituality and growth',
    url: 'https://www.ramadanmajlis.nextacademyedu.com',
    siteName: 'Ramadan Majlis',
    images: [
      {
        url: '/og-image.png', // Priority to dedicated OG image
        width: 1200,
        height: 630,
        alt: 'Ramadan Majlis 2026',
      },
      {
        url: '/majlis_logo.png', // Fallback to logo
        width: 800,
        height: 600,
        alt: 'Ramadan Majlis Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ramadan Majlis 2026',
    description: 'Join the Elite at Ramadan Majlis.',
    images: ['/og-image.png'],
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
