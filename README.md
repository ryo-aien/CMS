# コンカフェ公式ウェブサイト

コンセプトカフェの公式ウェブサイト。Next.js + microCMS で構築。

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **microCMS**
- **Vercel**

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、各値を設定する。

```bash
cp env.local.example .env.local
```

| 変数名 | 説明 |
|--------|------|
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン（例: `your-service.microcms.io` の `your-service` 部分） |
| `MICROCMS_API_KEY` | microCMS の API キー |
| `REVALIDATE_SECRET` | Webhook のシークレットキー（任意の文字列） |
| `PREVIEW_SECRET` | プレビュー機能のシークレットキー（任意の文字列） |

### 3. 開発サーバーの起動

```bash
npm run dev
```

## ページ構成

| パス | 内容 |
|------|------|
| `/` | トップページ |
| `/cast` | キャスト一覧 |
| `/cast/[slug]` | キャスト詳細 |
| `/schedule` | 出勤スケジュール |
| `/system` | 料金・メニュー |
| `/news` | ニュース一覧 |
| `/news/[slug]` | ニュース詳細 |
| `/gallery` | ギャラリー |
| `/access` | アクセス |
| `/recruit` | 採用情報 |

## microCMS スキーマ

### キャスト (`cast`)

| フィールド | 型 | 説明 |
|-----------|-----|------|
| name | テキスト | 名前 |
| slug | テキスト | URL スラッグ |
| main_image | 画像 | メイン画像 |
| sub_images | 画像（複数） | サブ画像 |
| message | テキストエリア | メッセージ |
| birthday | テキスト | 誕生日 |
| blood_type | テキスト | 血液型 |
| hobby | テキスト | 趣味 |
| x_url | テキスト | X (Twitter) URL |
| instagram_url | テキスト | Instagram URL |
| tiktok_url | テキスト | TikTok URL |
| status | テキスト | ステータス |
| is_public | 真偽値 | 公開フラグ |
| sort_order | 数値 | 表示順 |

### 出勤スケジュール (`schedule`)

| フィールド | 型 | 説明 |
|-----------|-----|------|
| date | 日付 | 出勤日 |
| casts | コンテンツ参照（複数） | 出勤キャスト |
| note | テキスト | 備考 |
| is_public | 真偽値 | 公開フラグ |

### ニュース (`news`)

| フィールド | 型 | 説明 |
|-----------|-----|------|
| title | テキスト | タイトル |
| slug | テキスト | URL スラッグ |
| category | テキスト | カテゴリ |
| thumbnail | 画像 | サムネイル |
| content | リッチエディタ | 本文 |
| published_at | 日付 | 公開日 |
| is_public | 真偽値 | 公開フラグ |

### ギャラリー (`gallery`)

| フィールド | 型 | 説明 |
|-----------|-----|------|
| image | 画像 | 画像 |
| caption | テキスト | キャプション |
| category | テキスト | カテゴリ |
| is_public | 真偽値 | 公開フラグ |
| sort_order | 数値 | 表示順 |

### 店舗情報 (`shop`)

オブジェクト形式（単一コンテンツ）。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| shop_name | テキスト | 店舗名 |
| business_hours | テキスト | 営業時間 |
| closed_days | テキスト | 定休日 |
| address | テキスト | 住所 |
| google_map_embed_url | テキスト | Google マップ埋め込み URL |
| top_banner | 画像 | トップバナー画像 |
| line_url | テキスト | LINE URL |
| form_url | テキスト | 応募フォーム URL |
| apply_type | セレクト | 応募導線（`line` / `form` / `both`） |
| system_text | リッチエディタ | 料金・メニュー本文 |
| access_text | リッチエディタ | アクセス本文 |
| recruit_text | リッチエディタ | 採用情報本文 |

## Webhook 設定

microCMS の Webhook を以下のエンドポイントに向ける。

```
POST https://your-domain.vercel.app/api/revalidate?secret=REVALIDATE_SECRET
```

リクエストボディの `api` フィールドで更新対象を指定する。

| `api` の値 | 再検証されるページ |
|-----------|----------------|
| `cast` | `/cast`, `/` |
| `news` | `/news`, `/` |
| `schedule` | `/schedule`, `/` |
| `shop` | `/`, `/system`, `/access`, `/recruit` |
| `gallery` | `/gallery` |

## プレビュー

下書きコンテンツのプレビューは以下の URL で確認できる。

```
GET https://your-domain.vercel.app/api/preview?secret=PREVIEW_SECRET&draftKey=DRAFT_KEY&contentType=CONTENT_TYPE&slug=SLUG
```

| パラメータ | 説明 |
|-----------|------|
| `secret` | `PREVIEW_SECRET` の値 |
| `draftKey` | microCMS の下書きキー |
| `contentType` | `cast` / `news` / `schedule` / `gallery` / `shop` |
| `slug` | コンテンツのスラッグ（cast・news の詳細ページ用） |

## デプロイ（Vercel）

### 1. New Project の作成

1. [vercel.com](https://vercel.com) にログインし、**Add New > Project** を開く
2. GitHub リポジトリをインポートする

### 2. プロジェクト設定

以下の設定を確認する（基本的に自動検出されるが念のため確認）。

| 項目 | 設定値 |
|------|--------|
| Framework Preset | `Next.js` |
| Root Directory | `.`（リポジトリのルート） |
| Build Command | `npm run build`（デフォルトのまま） |
| Output Directory | `.next`（デフォルトのまま） |
| Install Command | `npm install`（デフォルトのまま） |

### 3. 環境変数の設定

**Environment Variables** セクションで以下を追加する。

| Name | Value | Environment |
|------|-------|-------------|
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン | Production, Preview, Development |
| `MICROCMS_API_KEY` | microCMS の API キー | Production, Preview, Development |
| `REVALIDATE_SECRET` | 任意の文字列 | Production, Preview, Development |
| `PREVIEW_SECRET` | 任意の文字列 | Production, Preview, Development |

### 4. デプロイ

**Deploy** ボタンを押してデプロイ完了。以降は `main` ブランチへの push で自動デプロイされる。
