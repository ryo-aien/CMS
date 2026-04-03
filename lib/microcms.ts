import { createClient } from 'microcms-js-sdk';
import type { Cast, Schedule, News, Gallery, Shop } from '@/types';

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN ?? '';
const apiKey = process.env.MICROCMS_API_KEY ?? '';

export const client = createClient({
  serviceDomain,
  apiKey,
});

// ---- Cast ----

export async function getCasts(draftKey?: string) {
  const res = await client.getList<Cast>({
    endpoint: 'cast',
    queries: {
      filters: 'is_public[equals]true',
      orders: 'sort_order',
      limit: 100,
    },
    ...(draftKey ? { queries: { draftKey } } : {}),
  });
  return res.contents;
}

export async function getCastBySlug(slug: string, draftKey?: string) {
  const res = await client.getList<Cast>({
    endpoint: 'cast',
    queries: {
      filters: `slug[equals]${slug}`,
      limit: 1,
      ...(draftKey ? { draftKey } : {}),
    },
  });
  return res.contents[0] ?? null;
}

export async function getCastSlugs() {
  const res = await client.getList<Cast>({
    endpoint: 'cast',
    queries: {
      filters: 'is_public[equals]true',
      fields: 'slug',
      limit: 100,
    },
  });
  return res.contents.map((c) => c.slug);
}

// ---- Schedule ----

export async function getSchedules(limit = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = today.toISOString().split('T')[0];

  const res = await client.getList<Schedule>({
    endpoint: 'schedule',
    queries: {
      filters: `is_public[equals]true[and]date[greater_than_equal]${dateStr}`,
      orders: 'date',
      limit,
    },
  });
  return res.contents;
}

export async function getTodaySchedule() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const res = await client.getList<Schedule>({
    endpoint: 'schedule',
    queries: {
      filters: `is_public[equals]true[and]date[equals]${dateStr}`,
      limit: 1,
    },
  });
  return res.contents[0] ?? null;
}

// ---- News ----

export async function getNewsList(limit = 20, offset = 0) {
  const res = await client.getList<News>({
    endpoint: 'news',
    queries: {
      filters: 'is_public[equals]true',
      orders: '-published_at',
      limit,
      offset,
    },
  });
  return res;
}

export async function getLatestNews(limit = 3) {
  const res = await client.getList<News>({
    endpoint: 'news',
    queries: {
      filters: 'is_public[equals]true',
      orders: '-published_at',
      limit,
    },
  });
  return res.contents;
}

export async function getNewsBySlug(slug: string, draftKey?: string) {
  const res = await client.getList<News>({
    endpoint: 'news',
    queries: {
      filters: `slug[equals]${slug}`,
      limit: 1,
      ...(draftKey ? { draftKey } : {}),
    },
  });
  return res.contents[0] ?? null;
}

export async function getNewsSlugs() {
  const res = await client.getList<News>({
    endpoint: 'news',
    queries: {
      filters: 'is_public[equals]true',
      fields: 'slug',
      limit: 100,
    },
  });
  return res.contents.map((n) => n.slug);
}

// ---- Gallery ----

export async function getGalleries(limit = 50) {
  const res = await client.getList<Gallery>({
    endpoint: 'gallery',
    queries: {
      filters: 'is_public[equals]true',
      orders: 'sort_order',
      limit,
    },
  });
  return res.contents;
}

// ---- Shop ----

export async function getShop(): Promise<Shop | null> {
  try {
    const res = await client.getObject<Shop>({
      endpoint: 'shop',
    });
    return res;
  } catch {
    return null;
  }
}
