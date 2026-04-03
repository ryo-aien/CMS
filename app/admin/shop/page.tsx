'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import type { Shop } from '@/types';

export default function AdminShopPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);

  const [form, setForm] = useState({
    shop_name: '',
    business_hours: '',
    closed_days: '',
    address: '',
    google_map_embed_url: '',
    top_banner_url: '',
    menu_image_url: '',
    line_url: '',
    form_url: '',
    apply_type: 'both' as 'line' | 'form' | 'both',
    system_text: '',
    access_text: '',
    recruit_text: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('shop').select('*').single();
        if (data) {
          const shop = data as Shop;
          setShopId(shop.id);
          setForm({
            shop_name: shop.shop_name ?? '',
            business_hours: shop.business_hours ?? '',
            closed_days: shop.closed_days ?? '',
            address: shop.address ?? '',
            google_map_embed_url: shop.google_map_embed_url ?? '',
            top_banner_url: shop.top_banner_url ?? '',
            menu_image_url: shop.menu_image_url ?? '',
            line_url: shop.line_url ?? '',
            form_url: shop.form_url ?? '',
            apply_type: shop.apply_type ?? 'both',
            system_text: shop.system_text ?? '',
            access_text: shop.access_text ?? '',
            recruit_text: shop.recruit_text ?? '',
          });
        }
      } catch {
        // ignore - shop might not exist yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const supabase = createClient();
      const payload = {
        shop_name: form.shop_name || null,
        business_hours: form.business_hours || null,
        closed_days: form.closed_days || null,
        address: form.address || null,
        google_map_embed_url: form.google_map_embed_url || null,
        top_banner_url: form.top_banner_url || null,
        menu_image_url: form.menu_image_url || null,
        line_url: form.line_url || null,
        form_url: form.form_url || null,
        apply_type: form.apply_type,
        system_text: form.system_text || null,
        access_text: form.access_text || null,
        recruit_text: form.recruit_text || null,
        updated_at: new Date().toISOString(),
      };

      if (shopId !== null) {
        const { error } = await supabase.from('shop').update(payload).eq('id', shopId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('shop').insert([payload]).select().single();
        if (error) throw error;
        setShopId((data as Shop).id);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">店舗情報管理</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">基本情報</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">店舗名</label>
            <input
              type="text"
              value={form.shop_name}
              onChange={(e) => setForm((p) => ({ ...p, shop_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">営業時間</label>
              <input
                type="text"
                value={form.business_hours}
                onChange={(e) => setForm((p) => ({ ...p, business_hours: e.target.value }))}
                placeholder="例: 18:00〜翌2:00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">定休日</label>
              <input
                type="text"
                value={form.closed_days}
                onChange={(e) => setForm((p) => ({ ...p, closed_days: e.target.value }))}
                placeholder="例: 不定休"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">住所</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Google Map 埋め込みURL</label>
            <input
              type="url"
              value={form.google_map_embed_url}
              onChange={(e) => setForm((p) => ({ ...p, google_map_embed_url: e.target.value }))}
              placeholder="https://www.google.com/maps/embed?..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {/* Top Banner */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">トップバナー画像</h2>
          <ImageUpload
            bucket="gallery-images"
            currentUrl={form.top_banner_url || null}
            onUpload={(url) => setForm((p) => ({ ...p, top_banner_url: url }))}
            label="トップバナーをアップロード"
          />
        </div>

        {/* Menu Image */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">料金・メニュー画像</h2>
          <ImageUpload
            bucket="gallery-images"
            currentUrl={form.menu_image_url || null}
            onUpload={(url) => setForm((p) => ({ ...p, menu_image_url: url }))}
            label="メニュー画像をアップロード"
          />
        </div>

        {/* Apply Settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">応募設定</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">LINE URL</label>
              <input
                type="url"
                value={form.line_url}
                onChange={(e) => setForm((p) => ({ ...p, line_url: e.target.value }))}
                placeholder="https://line.me/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">フォームURL</label>
              <input
                type="url"
                value={form.form_url}
                onChange={(e) => setForm((p) => ({ ...p, form_url: e.target.value }))}
                placeholder="https://forms.google.com/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">応募方法</label>
            <div className="flex gap-4">
              {[
                { value: 'line', label: 'LINEのみ' },
                { value: 'form', label: 'フォームのみ' },
                { value: 'both', label: '両方' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={opt.value}
                    checked={form.apply_type === opt.value}
                    onChange={() => setForm((p) => ({ ...p, apply_type: opt.value as 'line' | 'form' | 'both' }))}
                    className="accent-pink-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Rich text sections */}
        {[
          { key: 'system_text', label: '料金・メニュー（system_text）' },
          { key: 'access_text', label: 'アクセス情報（access_text）' },
          { key: 'recruit_text', label: '採用情報（recruit_text）' },
        ].map(({ key, label }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
            <RichTextEditor
              content={form[key as keyof typeof form] as string}
              onChange={(html) => setForm((p) => ({ ...p, [key]: html }))}
              bucket="gallery-images"
            />
          </div>
        ))}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100">
            <p className="text-sm text-green-600">保存しました</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-70"
          style={{ backgroundColor: '#e91e8c' }}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
