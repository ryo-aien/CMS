'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Cast, Profile } from '@/types';

export default function AdminCastPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profileData as Profile | null);

        // Fetch casts
        let query = supabase.from('casts').select('*').order('sort_order');

        if (profileData?.role === 'cast' && profileData.cast_id) {
          query = query.eq('id', profileData.cast_id);
        }

        const { data } = await query;
        setCasts((data as Cast[]) ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    const supabase = createClient();
    const { error } = await supabase.from('casts').delete().eq('id', id);
    if (error) {
      alert('削除に失敗しました: ' + error.message);
      return;
    }
    setCasts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">キャスト管理</h1>
        {(profile?.role === 'owner' || !profile) && (
          <Link
            href="/admin/cast/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#e91e8c' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規作成
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : casts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">キャストがいません</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">画像</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">名前</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">表示順</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">公開状態</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {casts.map((cast) => (
                <tr key={cast.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {cast.main_image_url && (
                        <Image
                          src={cast.main_image_url}
                          alt={cast.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{cast.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cast.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        cast.is_public
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cast.is_public ? '公開' : '非公開'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/cast/${cast.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      編集
                    </Link>
                    {profile?.role === 'owner' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(cast.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
