import type { Metadata } from 'next';
import { getShop } from '@/lib/microcms';

export const metadata: Metadata = {
  title: 'ACCESS',
  description: 'アクセス情報。住所・営業時間・地図をご確認いただけます。',
};

export const revalidate = 86400;

export default async function AccessPage() {
  const shop = await getShop().catch(() => null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <p className="section-title">Access</p>
        <h1 className="section-heading">アクセス</h1>
        <div className="mt-4 mx-auto w-12 h-0.5 bg-accent" />
      </div>

      {/* Shop Info Cards */}
      {shop && (
        <div className="space-y-4 mb-10">
          {shop.address && (
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs tracking-widest text-accent mb-1">ADDRESS</p>
                  <p className="text-text-secondary text-sm leading-relaxed">{shop.address}</p>
                </div>
              </div>
            </div>
          )}

          {shop.business_hours && (
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs tracking-widest text-accent mb-1">HOURS</p>
                  <p className="text-text-secondary text-sm leading-relaxed">{shop.business_hours}</p>
                  {shop.closed_days && (
                    <p className="mt-1.5 text-xs text-text-muted">定休日: {shop.closed_days}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rich Text Access Info */}
      {shop?.access_text && (
        <div className="mb-10 richtext">
          <div dangerouslySetInnerHTML={{ __html: shop.access_text }} />
        </div>
      )}

      {/* Google Map Embed */}
      {shop?.google_map_embed_url && (
        <div className="rounded-xl overflow-hidden aspect-video bg-surface-2 mb-10">
          <iframe
            src={shop.google_map_embed_url}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
            className="w-full h-full"
          />
        </div>
      )}

      {!shop && (
        <div className="text-center py-20 text-text-muted">
          <p>現在準備中です。</p>
        </div>
      )}
    </div>
  );
}
