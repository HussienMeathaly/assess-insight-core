-- Add a safe helper to read request headers inside RLS policies
create or replace function public.request_header(p_name text)
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select (current_setting('request.headers', true))::json ->> lower(p_name);
$$;

-- Allow public/token-based reads of evaluation_reports for sharing
-- (token supplied via request header: x-share-token)
drop policy if exists "Public can read active evaluation report by share token" on public.evaluation_reports;
create policy "Public can read active evaluation report by share token"
on public.evaluation_reports
for select
to public
using (
  share_token::text = public.request_header('x-share-token')
  and is_active = true
  and (expires_at is null or expires_at > now())
);

-- Ensure roles can actually SELECT (RLS still applies)
grant select on table public.evaluation_reports to anon, authenticated;