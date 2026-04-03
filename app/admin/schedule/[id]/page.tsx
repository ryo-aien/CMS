'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Cast, Schedule } from '@/types';

export default function EditSchedulePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCasts, setAllCasts] = useState<Cast[]>([]);

  const [form, setForm] = useState({
    date: '',
    note: '',
    is_public: false,
    selectedCastIds: [] as string[],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const [scheduleRes, castsRes] = await Promise.all([
          supabase
            .from('schedules')
            .select('*, casts:schedule_casts(cast:casts(*))')
            .eq('id', id)
            .single(),
          supabase.from('casts').select('*').order('sort_order'),
        ]);

        if (scheduleRes.error) throw scheduleRes.error;

        const schedule = scheduleRes.data as Schedule & { casts: Array<{ cast: Cast }> };
        const castIds = (schedule.casts ?? []).map((sc: { cast: Cast }) => sc.cast.id);

        setForm({
          date: schedule.date ?? '',
          note: schedule.note ?? '',
          is_public: schedule.is_public ?? false,
          selectedCastIds: castIds,
        });

        setAllCasts((castsRes.data as Cast[]) ?? []);
      } catch {
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleCast = (castId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedCastIds: prev.selectedCastIds.includes(castId)
        ? prev.selectedCastIds.filter((c) => c !== castId)
        : [...prev.selectedCastIds, castId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('schedules')
        .update({
          date: form.date,
          note: form.note || null,
          is_public: form.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Sync schedule_casts
      await supabase.from('schedule_casts').delete().eq('schedule_id', id);
      if (form.selectedCastIds.length > 0) {
        await supabase.from('schedule_casts').insert(
          form.selectedCastIds.map((cast_id) => ({ schedule_id: id, cast_id }))
        );
      }

      router.push('/admin/schedule');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>;
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">シフト編集</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">日付</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">出勤キャスト</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-3">
              {allCasts.map((cast) => (
                <label key={cast.id} className="flex items-center gap-2 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={form.selectedCastIds.includes(cast.id)}
                    onChange={() => toggleCast(cast.id)}
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span className="text-sm text-gray-700">{cast.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">備考</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm((p) => ({ ...p, is_public: e.target.checked }))}
              className="w-4 h-4 accent-pink-500"
            />
            <span className="text-sm text-gray-700">公開する</span>
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-70"
            style={{ backgroundColor: '#e91e8c' }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/schedule')}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
