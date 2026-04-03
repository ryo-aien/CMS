import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'owner') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // cast ロールの profiles を casts と JOIN して取得
  const { data: castProfiles, error } = await adminClient
    .from('profiles')
    .select('id, cast_id, created_at, casts(name)')
    .eq('role', 'cast');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auth ユーザー一覧からメールアドレスを取得
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const emailMap = new Map(users.map((u) => [u.id, u.email ?? '']));

  const accounts = (castProfiles ?? []).map((p) => ({
    user_id: p.id,
    email: emailMap.get(p.id) ?? '',
    cast_id: p.cast_id,
    cast_name: (p.casts as { name: string } | null)?.name ?? null,
    created_at: p.created_at,
  }));

  return NextResponse.json({ accounts });
}
