import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // Verify secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Invalid secret' },
      { status: 401 }
    );
  }

  let body: { api?: string } = {};
  try {
    body = await request.json();
  } catch {
    // body might be empty
  }

  const api = body?.api ?? '';

  try {
    switch (api) {
      case 'cast':
        revalidatePath('/cast', 'layout');
        revalidatePath('/', 'page');
        break;

      case 'news':
        revalidatePath('/news', 'layout');
        revalidatePath('/', 'page');
        break;

      case 'schedule':
        revalidatePath('/schedule', 'page');
        revalidatePath('/', 'page');
        break;

      case 'shop':
        revalidatePath('/', 'page');
        revalidatePath('/system', 'page');
        revalidatePath('/access', 'page');
        revalidatePath('/recruit', 'page');
        break;

      case 'gallery':
        revalidatePath('/gallery', 'page');
        break;

      default:
        // Revalidate all
        revalidatePath('/', 'layout');
        break;
    }

    return NextResponse.json({
      revalidated: true,
      api,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}
