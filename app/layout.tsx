import type { Metadata } from 'next';
import { Noto_Sans_JP, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const notoSansJP = Noto_Sans_JP({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CONCAFE | コンセプトカフェ',
    template: '%s | CONCAFE',
  },
  description: 'コンセプトカフェ公式サイト。キャスト情報、出勤スケジュール、最新ニュースをお届けします。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'CONCAFE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${playfairDisplay.variable}`}>
      <body className="bg-background text-text-primary font-sans antialiased">
        <Header />
        <main className="pt-16 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
