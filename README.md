# 公式ウェブサイト

カフェの公式ウェブサイト＋自作CMS。Next.js + Supabase で構築。

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase**（データベース・画像ストレージ・認証）
- **Vercel**

---

## ページ構成

### 公開サイト

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

### 管理画面

| パス | 内容 |
|------|------|
| `/admin/login` | ログイン |
| `/admin` | ダッシュボード |
| `/admin/cast` | キャスト管理 |
| `/admin/schedule` | シフト管理 |
| `/admin/news` | ニュース管理 |
| `/admin/gallery` | ギャラリー管理 |
| `/admin/shop` | 店舗情報管理 |

---

## セットアップ

### 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) にログインし、**New Project** を作成
2. プロジェクト名・パスワード・リージョン（Northeast Asia / Tokyo 推奨）を設定

---

### 2. データベースのテーブル作成

Supabase の **SQL Editor** を開き、以下の SQL を順番に実行する。

#### テーブル作成

```sql
-- キャスト
create table casts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  main_image_url text,
  sub_image_urls text[] default '{}',
  message text,
  birthday text,
  blood_type text,
  hobby text,
  x_url text,
  instagram_url text,
  tiktok_url text,
  status text,
  default_workdays int[] default '{}',
  is_public boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 出勤スケジュール
create table schedules (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  note text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- シフト×キャスト中間テーブル
create table schedule_casts (
  schedule_id uuid references schedules(id) on delete cascade,
  cast_id uuid references casts(id) on delete cascade,
  primary key (schedule_id, cast_id)
);

-- ニュース
create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  thumbnail_url text,
  content text,
  published_at date,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ギャラリー
create table gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  is_public boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 店舗情報（常に1行）
create table shop (
  id int primary key default 1,
  shop_name text,
  business_hours text,
  closed_days text,
  address text,
  google_map_embed_url text,
  top_banner_url text,
  line_url text,
  form_url text,
  apply_type text default 'both',
  system_text text,
  access_text text,
  recruit_text text,
  updated_at timestamptz default now()
);

-- 店舗情報の初期レコード挿入
insert into shop (id) values (1);

-- ユーザープロフィール（権限管理）
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null default 'cast',
  cast_id uuid references casts(id),
  created_at timestamptz default now()
);
```

#### Row Level Security（RLS）の設定

```sql
-- RLS を有効化
alter table casts enable row level security;
alter table schedules enable row level security;
alter table schedule_casts enable row level security;
alter table news enable row level security;
alter table gallery enable row level security;
alter table shop enable row level security;
alter table profiles enable row level security;

-- 公開サイト向け：全員が公開済みコンテンツを読める
create policy "public can read public casts"
  on casts for select using (is_public = true);

create policy "public can read public schedules"
  on schedules for select using (is_public = true);

create policy "public can read schedule_casts"
  on schedule_casts for select using (true);

create policy "public can read public news"
  on news for select using (is_public = true);

create policy "public can read public gallery"
  on gallery for select using (is_public = true);

create policy "public can read shop"
  on shop for select using (true);

-- 認証済みユーザーは全コンテンツを読める（管理画面用）
create policy "authenticated can read all casts"
  on casts for select to authenticated using (true);

create policy "authenticated can read all schedules"
  on schedules for select to authenticated using (true);

create policy "authenticated can read all news"
  on news for select to authenticated using (true);

create policy "authenticated can read all gallery"
  on gallery for select to authenticated using (true);

create policy "authenticated can read profiles"
  on profiles for select to authenticated using (true);

-- オーナーは全テーブルを操作できる
create policy "owner can do everything on casts"
  on casts for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'owner');

create policy "owner can do everything on schedules"
  on schedules for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'owner');

create policy "owner can do everything on schedule_casts"
  on schedule_casts for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'owner');

create policy "owner can do everything on news"
  on news for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'owner');

create policy "owner can do everything on gallery"
  on gallery for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'owner');

create policy "owner can do everything on shop"
  on shop for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'owner');

create policy "owner can manage profiles"
  on profiles for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'owner');

-- キャストは自分のプロフィールのみ更新できる
create policy "cast can update own profile"
  on casts for update to authenticated
  using (id = (select cast_id from profiles where id = auth.uid()));

-- キャストは自分が含まれるシフトのみ更新できる
create policy "cast can update own schedule"
  on schedules for update to authenticated
  using (
    id in (
      select schedule_id from schedule_casts
      where cast_id = (select cast_id from profiles where id = auth.uid())
    )
  );
```

---

### 3. Storage のバケット作成

Supabase の **Storage** を開き、以下のバケットを作成する。  
各バケットとも **Public bucket** にチェックを入れること。

| バケット名 | 用途 |
|-----------|------|
| `cast-images` | キャスト画像 |
| `news-images` | ニュース画像 |
| `gallery-images` | ギャラリー画像 |
| `shop-images` | 店舗バナー画像 |

---

### 4. オーナーアカウントの作成

1. Supabase の **Authentication > Users** を開く
2. **Invite user** でオーナーのメールアドレスを入力して招待メールを送る
3. オーナーがメールのリンクからパスワードを設定してログイン完了
4. 作成されたユーザーの UUID を確認し、**SQL Editor** で以下を実行してオーナー権限を付与する

```sql
insert into profiles (id, role)
values ('ここにオーナーのUUIDを貼る', 'owner');
```

---

### 5. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成する。

```bash
cp env.local.example .env.local
```

各値は Supabase の **Project Settings** から取得する。

---

#### `NEXT_PUBLIC_SUPABASE_URL` の取得

**Project Settings > General** を開く。

![General設定画面](docs/images/General.png)

**Project ID** の欄に表示されている値をもとに、以下の形式で設定する。

```
https://<Project ID>.supabase.co
```

---

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` の取得

**Project Settings > API Keys** を開く。

![API Keys設定画面](docs/images/API_Keys.png)

| 変数名 | 取得場所 | 説明 |
|--------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings > General > Project ID | `https://<ID>.supabase.co` の形式で設定 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable key** > default の API KEY | `sb_publishable_...` で始まるキー。ブラウザに公開してOK |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret keys** > default の API KEY（目のアイコンで表示） | `sb_secret_...` で始まるキー。絶対に公開しないこと |
| `REVALIDATE_SECRET` | 任意の文字列を自分で決める | ISR ページ再生成用。`openssl rand -hex 32` 等で生成推奨 |

---

### 6. 開発サーバーの起動

```bash
npm install
npm run dev
```

管理画面は `http://localhost:3000/admin` からアクセスできる。

---

## デプロイ（Vercel）

### 1. New Project の作成

1. [vercel.com](https://vercel.com) にログインし、**Add New > Project** を開く
2. GitHub リポジトリをインポートする

### 2. プロジェクト設定

| 項目 | 設定値 |
|------|--------|
| Framework Preset | `Next.js` |
| Root Directory | `.`（デフォルトのまま） |
| Build Command | `npm run build`（デフォルトのまま） |
| Output Directory | `.next`（デフォルトのまま） |
| Install Command | `npm install`（デフォルトのまま） |

### 3. 環境変数の設定

**Environment Variables** セクションで以下を追加する。

| Name | Environment |
|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development |
| `REVALIDATE_SECRET` | Production, Preview, Development |

### 4. デプロイ

**Deploy** ボタンを押してデプロイ完了。以降は `main` ブランチへの push で自動デプロイされる。

---

## キャストアカウントの追加方法

1. **Authentication > Users** で **Invite user** からキャストのメールアドレスを招待
2. キャストがパスワードを設定してログイン
3. 先にキャストのプロフィールを `/admin/cast` から作成しておく
4. **SQL Editor** で以下を実行してキャスト権限を付与する

```sql
insert into profiles (id, role, cast_id)
values (
  'キャストのUUID',
  'cast',
  'キャストテーブルのID'
);
```
