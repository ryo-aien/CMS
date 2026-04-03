'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Gallery } from '@/types';

export default function AdminGalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ caption: '', category: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('galleries')
        .select('*')
        .order('sort_order');
      setGalleries((data as Gallery[]) ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpload = async (url: string) => {
    try {
      const supabase = createClient();
      const maxSortOrder = galleries.reduce((max, g) => Math.max(max, g.sort_order), 0);
      const { error } = await supabase.from('galleries').insert([{
        image_url: url,
        is_public: false,
        sort_order: maxSortOrder + 1,
      }]);
      if (error) throw error;
      loadData();
    } catch (err) {
      alert('アップロードに失敗しました: ' + String(err));
    }
  };

  const togglePublic = async (item: Gallery) => {
    try {
      const supabase = createClient();
      await supabase
        .from('galleries')
        .update({ is_public: !item.is_public })
        .eq('id', item.id);
      setGalleries((prev) =>
        prev.map((g) => g.id === item.id ? { ...g, is_public: !g.is_public } : g)
      );
    } catch (err) {
      alert('更新に失敗しました: ' + String(err));
    }
  };

  const startEdit = (item: Gallery) => {
    setEditingId(item.id);
    setEditForm({ caption: item.caption ?? '', category: item.category ?? '' });
  };

  const saveEdit = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('galleries')
        .update({ caption: editForm.caption || null, category: editForm.category || null })
        .eq('id', id);
      setGalleries((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, caption: editForm.caption || null, category: editForm.category || null }
            : g
        )
      );
      setEditingId(null);
    } catch (err) {
      alert('保存に失敗しました: ' + String(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const supabase = createClient();
      await supabase.from('galleries').delete().eq('id', id);
      setGalleries((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert('削除に失敗しました: ' + String(err));
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">ギャラリー管理</h1>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">画像を追加</h2>
        <ImageUpload
          bucket="gallery-images"
          onUpload={handleUpload}
          label="ギャラリー画像をアップロード"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : galleries.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">ギャラリーがありません</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {galleries.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={item.image_url}
                  alt={item.caption ?? ''}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
                {/* Public badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      item.is_public ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}
                  >
                    {item.is_public ? '公開' : '非公開'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2.5 space-y-2">
                {editingId === item.id ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editForm.caption}
                      onChange={(e) => setEditForm((p) => ({ ...p, caption: e.target.value }))}
                      placeholder="キャプション"
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-pink-400"
                    />
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="カテゴリ"
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-pink-400"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(item.id)}
                      className="w-full py-1 text-xs font-medium text-white rounded"
                      style={{ backgroundColor: '#e91e8c' }}
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <>
                    {item.caption && (
                      <p className="text-[11px] text-gray-500 truncate">{item.caption}</p>
                    )}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => togglePublic(item)}
                        className="flex-1 py-1 text-[11px] font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {item.is_public ? '非公開に' : '公開に'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="py-1 px-2 text-[11px] rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="py-1 px-2 text-[11px] rounded bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
