'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Counts = {
  casts: number;
  schedules: number;
  news: number;
  galleries: number;
};

const cards = [
  {
    key: 'casts' as keyof Counts,
    label: 'キャスト',
    href: '/admin/cast',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    suffix: '人',
  },
  {
    key: 'schedules' as keyof Counts,
    label: '今月のシフト',
    href: '/admin/schedule',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    suffix: '件',
  },
  {
    key: 'news' as keyof Counts,
    label: 'ニュース',
    href: '/admin/news',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    suffix: '件',
  },
  {
    key: 'galleries' as keyof Counts,
    label: 'ギャラリー',
    href: '/admin/gallery',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    suffix: '件',
  },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({ casts: 0, schedules: 0, news: 0, galleries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const supabase = createClient();
        const now = new Date();
        const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const endOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

        const [castsRes, schedulesRes, newsRes, galleriesRes] = await Promise.all([
          supabase.from('casts').select('id', { count: 'exact', head: true }),
          supabase
            .from('schedules')
            .select('id', { count: 'exact', head: true })
            .gte('date', startOfMonth)
            .lte('date', endOfMonthStr),
          supabase.from('news').select('id', { count: 'exact', head: true }),
          supabase.from('galleries').select('id', { count: 'exact', head: true }),
        ]);

        setCounts({
          casts: castsRes.count ?? 0,
          schedules: schedulesRes.count ?? 0,
          news: newsRes.count ?? 0,
          galleries: galleriesRes.count ?? 0,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">ダッシュボード</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:border-pink-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-pink-50 text-pink-500 group-hover:bg-pink-100 transition-colors">
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '-' : counts[card.key]}
              <span className="text-sm font-normal text-gray-500 ml-1">{card.suffix}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">クイックリンク</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/cast/new', label: '新規キャスト追加' },
            { href: '/admin/news/new', label: '新規ニュース作成' },
            { href: '/admin/schedule', label: 'シフト管理' },
            { href: '/admin/gallery', label: 'ギャラリー管理' },
            { href: '/admin/shop', label: '店舗情報編集' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-100 text-sm text-gray-600 hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
