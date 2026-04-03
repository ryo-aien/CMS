'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Cast } from '@/types';

type CastAccount = {
  user_id: string;
  email: string;
  cast_id: string | null;
  cast_name: string | null;
  created_at: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<CastAccount[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ email: '', password: '', cast_id: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [accountsRes, supabase] = [await fetch('/api/admin/list-cast-accounts'), createClient()];
      const { accounts: data } = await accountsRes.json();
      setAccounts(data ?? []);

      const { data: castData } = await supabase.from('casts').select('*').order('sort_order');
      setCasts((castData as Cast[]) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/create-cast-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setShowForm(false);
      setForm({ email: '', password: '', cast_id: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user_id: string, email: string) => {
    if (!confirm(`${email} のアカウントを削除しますか？`)) return;
    try {
      const res = await fetch('/api/admin/delete-cast-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAccounts((prev) => prev.filter((a) => a.user_id !== user_id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  // すでにアカウントが紐付いている cast_id を除外
  const linkedCastIds = new Set(accounts.map((a) => a.cast_id).filter(Boolean));
  const availableCasts = casts.filter((c) => !linkedCastIds.has(c.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">キャストアカウント管理</h1>
        <button
          type="button"
          onClick={() => { setShowForm(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: '#e91e8c' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          アカウント追加
        </button>
      </div>

      {/* 追加フォーム */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">新規キャストアカウント</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">メールアドレス *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">パスワード *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">紐付けるキャスト *</label>
              <select
                value={form.cast_id}
                onChange={(e) => setForm((p) => ({ ...p, cast_id: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 bg-white"
              >
                <option value="">選択してください</option>
                {availableCasts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {availableCasts.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  アカウント未設定のキャストがいません。先にキャストプロフィールを作成してください。
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || availableCasts.length === 0}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-70"
                style={{ backgroundColor: '#e91e8c' }}
              >
                {saving ? '作成中...' : '作成'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null); }}
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* アカウント一覧 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">キャストアカウントがありません</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">メールアドレス</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">紐付けキャスト</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">作成日</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.map((account) => (
                <tr key={account.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800">{account.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {account.cast_name ?? (
                      <span className="text-gray-400">未紐付け</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(account.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(account.user_id, account.email)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      削除
                    </button>
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
