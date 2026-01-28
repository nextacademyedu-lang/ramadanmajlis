import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ramadan Nights 2026',
  description: 'Ramadan Nights for Entrepreneurs - An exceptional experience combining spirituality and growth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
