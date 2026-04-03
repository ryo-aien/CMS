-- =============================================
-- テストデータ削除SQL
-- seed.sql 実行前にクリーンアップする場合に使用
-- =============================================

delete from schedule_casts
  where schedule_id in (
    select id from schedules
    where id like '22222222-0000-0000-0000-%'
  );

delete from schedules
  where id like '22222222-0000-0000-0000-%';

delete from casts
  where id like '11111111-0000-0000-0000-%';

delete from news
  where id like '33333333-0000-0000-0000-%';

delete from gallery
  where id like '44444444-0000-0000-0000-%';

-- 店舗情報をリセット
update shop set
  shop_name        = null,
  business_hours   = null,
  closed_days      = null,
  address          = null,
  google_map_embed_url = null,
  top_banner_url   = null,
  line_url         = null,
  form_url         = null,
  apply_type       = 'both',
  system_text      = null,
  access_text      = null,
  recruit_text     = null
where id = 1;
