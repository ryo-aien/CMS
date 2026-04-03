# コンカフェ公式ウェブサイト 技術仕様書

## 1. 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- microCMS
- Vercel

---

## 2. ディレクトリ構成

/app
  /(public)
    /
    /cast
    /cast/[slug]
    /schedule
    /system
    /news
    /news/[slug]
    /gallery
    /access
    /recruit

  /api
    /revalidate
    /preview

/lib
  microcms.ts

/types

/components

---

## 3. CMS接続

```ts
import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});
```

---

## 4. プレビュー機能

### エンドポイント
POST /api/preview

### 仕様
- draftKeyを受け取りプレビュー表示
- 下書きコンテンツ取得を許可
- プレビュー時はキャッシュしない

### 実装例
```ts
import { draftMode } from 'next/headers';

export async function GET(req: Request) {
  draftMode().enable();
  return Response.redirect('/');
}
```

---

## 5. レンダリング

- 基本はStatic Generation
- プレビュー時のみ動的取得

---

## 6. Revalidation

### エンドポイント
POST /api/revalidate

### 実装例
```ts
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  const body = await req.json();

  switch (body.api) {
    case 'cast':
      revalidatePath('/cast');
      revalidatePath('/');
      break;

    case 'news':
      revalidatePath('/news');
      revalidatePath('/');
      break;

    case 'schedule':
      revalidatePath('/schedule');
      revalidatePath('/');
      break;

    case 'shop':
      revalidatePath('/');
      revalidatePath('/system');
      revalidatePath('/access');
      revalidatePath('/recruit');
      break;
  }

  return Response.json({ ok: true });
}
```

---

## 7. スキーマ定義

### キャスト
- name
- slug
- main_image
- sub_images
- message
- birthday
- blood_type
- hobby
- x_url
- instagram_url
- tiktok_url
- status
- is_public
- sort_order

---

### 出勤
- date
- casts
- note
- is_public

---

### ニュース
- title
- slug
- category
- thumbnail
- content
- published_at
- is_public

---

### ギャラリー
- image
- caption
- category
- is_public
- sort_order

---

### 店舗情報
- shop_name
- business_hours
- closed_days
- address
- google_map_embed_url
- top_banner
- line_url
- form_url
- apply_type（line / form / both）
- system_text
- access_text
- recruit_text

---

## 8. 応募導線ロジック

```ts
if (apply_type === 'line') {
  // LINEのみ表示
}
if (apply_type === 'form') {
  // フォームのみ表示
}
if (apply_type === 'both') {
  // 両方表示
}
```

---

## 9. 画像処理

```tsx
<Image src={url} alt="" width={400} height={600} />
```

- lazy load使用
- microCMSの画像URLそのまま使用可

---

## 10. Googleマップ

- iframe埋め込みで実装
- CMSからURLを取得

---

## 11. 環境変数

MICROCMS_SERVICE_DOMAIN=
MICROCMS_API_KEY=
REVALIDATE_SECRET=

---

## 12. セキュリティ

- Webhookはシークレット検証必須
- APIキーはサーバー側のみ

---

## 13. SEO

- title / description のみ対応
- OGPは固定画像またはCMS画像

---

## 14. エラー処理

- データ未取得時は空表示
- 致命的エラーはfallback表示

---

## 15. デプロイ

- Vercel
- mainブランチを本番

---

