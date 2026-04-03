import type { Metadata } from 'next';
import { getShop } from '@/lib/data';

export const metadata: Metadata = {
  title: 'RECRUIT',
  description: '採用情報。一緒に働くキャストを募集しています。',
};

export const revalidate = 86400;

export default async function RecruitPage() {
  const shop = await getShop().catch(() => null);

  const applyType = shop?.apply_type ?? 'both';
  const lineUrl = shop?.line_url;
  const formUrl = shop?.form_url;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <p className="section-title">Recruit</p>
        <h1 className="section-heading">採用情報</h1>
        <div className="mt-4 mx-auto w-12 h-0.5 bg-accent" />
      </div>

      {/* Hero Banner */}
      <div className="mb-10 p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-surface via-surface-2 to-surface border border-border text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-pink-glow pointer-events-none" />
        <p className="relative text-xs tracking-[0.3em] text-accent mb-3 font-medium">STAFF WANTED</p>
        <h2 className="relative text-2xl sm:text-3xl font-display font-bold text-white mb-4">
          一緒に働きませんか？
        </h2>
        <p className="relative text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
          未経験・経験者問わず大歓迎！<br />
          あなたらしく輝ける環境でお待ちしています。
        </p>
      </div>

      {/* Recruit Text */}
      {shop?.recruit_text ? (
        <div className="richtext mb-10">
          <div dangerouslySetInnerHTML={{ __html: shop.recruit_text }} />
        </div>
      ) : (
        <div className="mb-10 space-y-4">
          {/* Placeholder content when no data */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-accent tracking-widest mb-3">BENEFITS</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="text-accent">✦</span> 日払い・週払い対応
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✦</span> 未経験・副業OK
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✦</span> シフト自由
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✦</span> 完全個室面接
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Apply Buttons */}
      <div className="mt-10 p-6 rounded-xl bg-surface border border-border text-center">
        <p className="text-xs tracking-widest text-accent mb-4 font-medium">APPLY</p>
        <h3 className="text-lg font-bold text-text-primary mb-6">応募はこちら</h3>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {(applyType === 'line' || applyType === 'both') && lineUrl && (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-line"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.89c.50 0 .907.41.907.91s-.407.91-.907.91H17.58v1.16h1.787c.5 0 .907.41.907.91s-.407.91-.907.91h-2.696a.91.91 0 01-.907-.91V8.98c0-.5.407-.91.907-.91h2.696c.5 0 .907.41.907.91s-.407.91-.907.91H17.58v1h1.785zm-5.457 3.807a.91.91 0 01-.571-.202l-2.4-1.868v1.16a.91.91 0 01-.907.91.91.91 0 01-.907-.91V8.98a.91.91 0 01.907-.91.91.91 0 01.571.202l2.4 1.868V8.98a.91.91 0 01.907-.91.91.91 0 01.907.91v3.807a.91.91 0 01-.907.91zM8.58 12.787a.91.91 0 01-.907.91.91.91 0 01-.907-.91V8.98a.91.91 0 01.907-.91.91.91 0 01.907.91v3.807zM6.118 12.787a.91.91 0 01-.907.91H2.515a.91.91 0 01-.907-.91V8.98a.91.91 0 01.907-.91.91.91 0 01.907.91v2.897H5.21a.91.91 0 01.908.91zM22 10.3C22 5.924 17.075 2.4 11 2.4S0 5.924 0 10.3c0 3.944 3.497 7.253 8.222 7.881.32.069.756.21.866.483.099.247.065.635.032.885l-.14.84c-.043.247-.197.968.848.528 1.045-.44 5.636-3.317 7.688-5.679C19.33 13.56 22 12.106 22 10.3z"/>
              </svg>
              LINEで応募する
            </a>
          )}

          {(applyType === 'form' || applyType === 'both') && formUrl && (
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              フォームで応募する
            </a>
          )}

          {/* Fallback when no URLs configured */}
          {!lineUrl && !formUrl && (
            <p className="text-text-muted text-sm">
              応募方法は随時更新します。SNSまたは店頭にてお問い合わせください。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
