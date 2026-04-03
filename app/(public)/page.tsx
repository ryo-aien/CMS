import Image from 'next/image';
import Link from 'next/link';
import { getShop, getTodaySchedule, getLatestNews } from '@/lib/data';
import CastCard from '@/components/CastCard';
import NewsCard from '@/components/NewsCard';

export const revalidate = 3600;

export default async function HomePage() {
  const [shop, todaySchedule, latestNews] = await Promise.all([
    getShop().catch(() => null),
    getTodaySchedule().catch(() => null),
    getLatestNews(3).catch(() => []),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] sm:min-h-screen flex items-end pb-16 sm:pb-24 overflow-hidden">
        {shop?.top_banner_url ? (
          <Image
            src={shop.top_banner_url}
            alt={shop.shop_name ?? 'CONCAFE'}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface-2" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* Pink glow */}
        <div className="absolute inset-0 bg-pink-glow pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="animate-slide-up">
            <p className="section-title">Welcome to</p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-white leading-tight drop-shadow-lg">
              {shop?.shop_name ?? 'CONCAFE'}
            </h1>
            <p className="mt-4 text-text-secondary text-sm sm:text-base max-w-md">
              {shop?.business_hours && (
                <span>営業時間: {shop.business_hours}</span>
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cast" className="btn-primary">
                CAST を見る
              </Link>
              <Link href="/schedule" className="btn-outline">
                出勤スケジュール
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Cast */}
      {todaySchedule && todaySchedule.casts && todaySchedule.casts.length > 0 && (
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="section-title">Today&apos;s Cast</p>
            <h2 className="section-heading">本日の出勤キャスト</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {todaySchedule.casts.map((cast) => (
              <CastCard key={cast.id} cast={cast} />
            ))}
          </div>

          {todaySchedule.note && (
            <p className="mt-6 text-sm text-text-muted text-center">{todaySchedule.note}</p>
          )}

          <div className="mt-10 text-center">
            <Link href="/schedule" className="btn-outline">
              スケジュールを見る
            </Link>
          </div>
        </section>
      )}

      {/* Latest News */}
      {latestNews.length > 0 && (
        <section className="py-16 sm:py-20 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <p className="section-title">Latest News</p>
              <h2 className="section-heading">最新情報</h2>
            </div>

            <div className="space-y-4 max-w-2xl">
              {latestNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>

            <div className="mt-10">
              <Link href="/news" className="btn-outline">
                ニュース一覧へ
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Shop Info */}
      {shop && (
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="section-title">Shop Info</p>
            <h2 className="section-heading">店舗情報</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            {shop.address && (
              <div className="card p-6">
                <p className="text-xs tracking-widest text-accent mb-2">ADDRESS</p>
                <p className="text-text-secondary text-sm leading-relaxed">{shop.address}</p>
              </div>
            )}
            {shop.business_hours && (
              <div className="card p-6">
                <p className="text-xs tracking-widest text-accent mb-2">HOURS</p>
                <p className="text-text-secondary text-sm leading-relaxed">{shop.business_hours}</p>
                {shop.closed_days && (
                  <p className="mt-2 text-xs text-text-muted">定休日: {shop.closed_days}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/access" className="btn-outline">
              アクセスを見る
            </Link>
            {shop.line_url && (
              <a href={shop.line_url} target="_blank" rel="noopener noreferrer" className="btn-line">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.89c.50 0 .907.41.907.91s-.407.91-.907.91H17.58v1.16h1.787c.5 0 .907.41.907.91s-.407.91-.907.91h-2.696a.91.91 0 01-.907-.91V8.98c0-.5.407-.91.907-.91h2.696c.5 0 .907.41.907.91s-.407.91-.907.91H17.58v1h1.785zm-5.457 3.807a.91.91 0 01-.571-.202l-2.4-1.868v1.16a.91.91 0 01-.907.91.91.91 0 01-.907-.91V8.98a.91.91 0 01.907-.91.91.91 0 01.571.202l2.4 1.868V8.98a.91.91 0 01.907-.91.91.91 0 01.907.91v3.807a.91.91 0 01-.907.91zM8.58 12.787a.91.91 0 01-.907.91.91.91 0 01-.907-.91V8.98a.91.91 0 01.907-.91.91.91 0 01.907.91v3.807zM6.118 12.787a.91.91 0 01-.907.91H2.515a.91.91 0 01-.907-.91V8.98a.91.91 0 01.907-.91.91.91 0 01.907.91v2.897H5.21a.91.91 0 01.908.91zM22 10.3C22 5.924 17.075 2.4 11 2.4S0 5.924 0 10.3c0 3.944 3.497 7.253 8.222 7.881.32.069.756.21.866.483.099.247.065.635.032.885l-.14.84c-.043.247-.197.968.848.528 1.045-.44 5.636-3.317 7.688-5.679C19.33 13.56 22 12.106 22 10.3z"/>
                </svg>
                LINEで問い合わせ
              </a>
            )}
          </div>
        </section>
      )}

      {/* SNS Section */}
      <section className="py-16 sm:py-20 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="section-title">Follow Us</p>
          <h2 className="section-heading mb-8">SNS</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
