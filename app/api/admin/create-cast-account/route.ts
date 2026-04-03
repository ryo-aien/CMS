import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // 呼び出し元がオーナーかチェック
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

  const { email, password, cast_id } = await request.json();

  if (!email || !password || !cast_id) {
    return NextResponse.json({ error: 'email・password・cast_id は必須です' }, { status: 400 });
  }

  // service_role で Auth ユーザー作成
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !newUser.user) {
    return NextResponse.json({ error: createError?.message ?? 'ユーザー作成に失敗しました' }, { status: 500 });
  }

  // profiles に cast ロールで登録
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({ id: newUser.user.id, role: 'cast', cast_id });

  if (profileError) {
    // ロールバック: 作成した Auth ユーザーを削除
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ user_id: newUser.user.id });
}
