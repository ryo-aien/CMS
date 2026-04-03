import type { Metadata } from 'next';
import { getShop } from '@/lib/data';

export const metadata: Metadata = {
  title: 'SYSTEM',
  description: '料金・メニューのご案内。',
};

export const revalidate = 3600;

export default async function SystemPage() {
  const shop = await getShop().catch(() => null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <p className="section-title">System</p>
        <h1 className="section-heading">料金・メニュー</h1>
        <div className="mt-4 mx-auto w-12 h-0.5 bg-accent" />
      </div>

      {shop?.system_text ? (
        <div
          className="richtext"
          dangerouslySetInnerHTML={{ __html: shop.system_text }}
        />
      ) : (
        <div className="text-center py-20 text-text-muted">
          <p>現在準備中です。</p>
        </div>
      )}
    </div>
  );
}
