'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import ScheduleCalendar from '@/components/admin/ScheduleCalendar';
import type { Schedule, Cast } from '@/types';

type ModalState = {
  open: boolean;
  date: string;
  schedule?: Schedule;
};

export default function AdminSchedulePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allCasts, setAllCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false, date: '' });
  const [modalCastIds, setModalCastIds] = useState<string[]>([]);
  const [modalCastTimes, setModalCastTimes] = useState<Record<string, { start: string; end: string }>>({});
  const [modalNote, setModalNote] = useState('');
  const [modalPublic, setModalPublic] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [autoGenLoading, setAutoGenLoading] = useState(false);
  const [bulkPublishLoading, setBulkPublishLoading] = useState(false);

  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDayNum = new Date(year, month, 0).getDate();
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [schedulesRes, castsRes] = await Promise.all([
        supabase
          .from('schedules')
          .select('*, casts:schedule_casts(cast:casts(*), work_start, work_end)')
          .gte('date', startOfMonth)
          .lte('date', endOfMonth)
          .order('date'),
        supabase.from('casts').select('*').order('sort_order'),
      ]);

      const rawSchedules = (schedulesRes.data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        casts: ((s.casts as Array<{ cast: Cast; work_start: string | null; work_end: string | null }>) ?? []).map((sc) => sc.cast).filter(Boolean),
        castTimes: Object.fromEntries(
          ((s.casts as Array<{ cast: Cast; work_start: string | null; work_end: string | null }>) ?? [])
            .filter((sc) => sc.cast)
            .map((sc) => [sc.cast.id, { start: sc.work_start ?? '', end: sc.work_end ?? '' }])
        ),
      })) as (Schedule & { castTimes: Record<string, { start: string; end: string }> })[];

      setSchedules(rawSchedules);
      setAllCasts((castsRes.data as Cast[]) ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [startOfMonth, endOfMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const openModal = (date: string, schedule?: Schedule) => {
    setModal({ open: true, date, schedule });
    setModalCastIds((schedule?.casts ?? []).map((c) => c.id));
    const s = schedule as (Schedule & { castTimes?: Record<string, { start: string; end: string }> }) | undefined;
    const existingTimes = s?.castTimes ?? {};
    // 全キャスト分の時間を初期化（既存データがあればそれを使い、なければデフォルト値）
    const initialTimes: Record<string, { start: string; end: string }> = {};
    for (const cast of allCasts) {
      initialTimes[cast.id] = existingTimes[cast.id] ?? {
        start: cast.default_work_start ?? '',
        end: cast.default_work_end ?? '',
      };
    }
    setModalCastTimes(initialTimes);
    setModalNote(schedule?.note ?? '');
    setModalPublic(schedule?.is_public ?? false);
  };

  const closeModal = () => setModal({ open: false, date: '' });

  const toggleModalCast = (id: string) => {
    setModalCastIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      const cast = allCasts.find((c) => c.id === id);
      setModalCastTimes((times) => ({
        ...times,
        [id]: { start: cast?.default_work_start ?? '', end: cast?.default_work_end ?? '' },
      }));
      return [...prev, id];
    });
  };

  const saveModal = async () => {
    setSavingModal(true);
    try {
      const supabase = createClient();
      let scheduleId = modal.schedule?.id;

      if (scheduleId) {
        // Update existing
        await supabase
          .from('schedules')
          .update({ note: modalNote || null, is_public: modalPublic, updated_at: new Date().toISOString() })
          .eq('id', scheduleId);
      } else {
        // Create new
        const { data } = await supabase
          .from('schedules')
          .insert([{ date: modal.date, note: modalNote || null, is_public: modalPublic }])
          .select()
          .single();
        scheduleId = data?.id;
      }

      if (scheduleId) {
        // Sync schedule_casts
        await supabase.from('schedule_casts').delete().eq('schedule_id', scheduleId);
        if (modalCastIds.length > 0) {
          await supabase.from('schedule_casts').insert(
            modalCastIds.map((cast_id) => ({
              schedule_id: scheduleId,
              cast_id,
              work_start: modalCastTimes[cast_id]?.start || null,
              work_end: modalCastTimes[cast_id]?.end || null,
            }))
          );
        }
      }

      closeModal();
      loadData();
    } catch (err) {
      alert('保存に失敗しました: ' + String(err));
    } finally {
      setSavingModal(false);
    }
  };

  const autoGenerate = async () => {
    if (!confirm(`${year}年${month}月のシフトを自動生成しますか？`)) return;
    setAutoGenLoading(true);
    try {
      const supabase = createClient();
      const casts = allCasts;

      // Generate dates for the month
      const dates: string[] = [];
      for (let d = 1; d <= lastDayNum; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dates.push(dateStr);
      }

      for (const dateStr of dates) {
        const dayOfWeek = new Date(dateStr).getDay();
        const castsForDay = casts.filter((c) => c.default_workdays.includes(dayOfWeek));

        // Check if schedule exists
        const existing = schedules.find((s) => s.date === dateStr);

        let scheduleId: string | undefined = existing?.id;
        if (!scheduleId) {
          const { data } = await supabase
            .from('schedules')
            .insert([{ date: dateStr, is_public: false }])
            .select()
            .single();
          scheduleId = data?.id;
        }

        if (scheduleId && castsForDay.length > 0) {
          await supabase.from('schedule_casts').delete().eq('schedule_id', scheduleId);
          await supabase.from('schedule_casts').insert(
            castsForDay.map((c) => ({
              schedule_id: scheduleId,
              cast_id: c.id,
              work_start: c.default_work_start ?? null,
              work_end: c.default_work_end ?? null,
            }))
          );
        }
      }

      loadData();
    } catch (err) {
      alert('自動生成に失敗しました: ' + String(err));
    } finally {
      setAutoGenLoading(false);
    }
  };

  const bulkPublish = async () => {
    if (!confirm(`${year}年${month}月の全シフトを公開しますか？`)) return;
    setBulkPublishLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from('schedules')
        .update({ is_public: true, updated_at: new Date().toISOString() })
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      loadData();
    } catch (err) {
      alert('一括公開に失敗しました: ' + String(err));
    } finally {
      setBulkPublishLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800">シフト管理</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={autoGenerate}
            disabled={autoGenLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            {autoGenLoading ? '生成中...' : 'シフト自動生成'}
          </button>
          <button
            type="button"
            onClick={bulkPublish}
            disabled={bulkPublishLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: '#e91e8c' }}
          >
            {bulkPublishLoading ? '公開中...' : '一括公開'}
          </button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800 min-w-[120px] text-center">
          {year}年{month}月
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : (
        <ScheduleCalendar
          year={year}
          month={month}
          schedules={schedules}
          onClickCell={openModal}
        />
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{modal.date} のシフト</h3>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Cast selection */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">出勤キャスト</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allCasts.map((cast) => (
                    <div key={cast.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={modalCastIds.includes(cast.id)}
                        onChange={() => toggleModalCast(cast.id)}
                        className="w-4 h-4 accent-pink-500 shrink-0"
                      />
                      <span className="text-sm text-gray-700 w-20 shrink-0">{cast.name}</span>
                      <input
                        type="time"
                        value={modalCastTimes[cast.id]?.start ?? ''}
                        onChange={(e) =>
                          setModalCastTimes((prev) => ({
                            ...prev,
                            [cast.id]: { ...prev[cast.id], start: e.target.value },
                          }))
                        }
                        className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-pink-400"
                      />
                      <span className="text-gray-400 text-xs">〜</span>
                      <input
                        type="time"
                        value={modalCastTimes[cast.id]?.end ?? ''}
                        onChange={(e) =>
                          setModalCastTimes((prev) => ({
                            ...prev,
                            [cast.id]: { ...prev[cast.id], end: e.target.value },
                          }))
                        }
                        className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">備考</label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalPublic}
                  onChange={(e) => setModalPublic(e.target.checked)}
                  className="w-4 h-4 accent-pink-500"
                />
                <span className="text-sm text-gray-700">公開する</span>
              </label>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={saveModal}
                disabled={savingModal}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-70"
                style={{ backgroundColor: '#e91e8c' }}
              >
                {savingModal ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
