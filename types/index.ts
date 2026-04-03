import type { MicroCMSImage, MicroCMSListContent, MicroCMSObjectContent } from 'microcms-js-sdk';

export type { MicroCMSImage };

// キャスト
export type Cast = MicroCMSListContent & {
  name: string;
  slug: string;
  main_image: MicroCMSImage;
  sub_images?: MicroCMSImage[];
  message?: string;
  birthday?: string;
  blood_type?: string;
  hobby?: string;
  x_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  status?: string;
  is_public: boolean;
  sort_order?: number;
};

// 出勤スケジュール
export type Schedule = MicroCMSListContent & {
  date: string;
  casts: Cast[];
  note?: string;
  is_public: boolean;
};

// ニュース
export type News = MicroCMSListContent & {
  title: string;
  slug: string;
  category?: string;
  thumbnail?: MicroCMSImage;
  content: string;
  published_at?: string;
  is_public: boolean;
};

// ギャラリー
export type Gallery = MicroCMSListContent & {
  image: MicroCMSImage;
  caption?: string;
  category?: string;
  is_public: boolean;
  sort_order?: number;
};

// 店舗情報
export type Shop = MicroCMSObjectContent & {
  shop_name: string;
  business_hours?: string;
  closed_days?: string;
  address?: string;
  google_map_embed_url?: string;
  top_banner?: MicroCMSImage;
  line_url?: string;
  form_url?: string;
  apply_type?: 'line' | 'form' | 'both';
  system_text?: string;
  access_text?: string;
  recruit_text?: string;
};
