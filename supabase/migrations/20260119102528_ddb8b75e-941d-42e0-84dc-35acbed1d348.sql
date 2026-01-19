-- Harden organizations ownership by ensuring every row is owned by a user
-- (prevents orphan rows and reduces risk of accidental broad exposure if policies change)
alter table public.organizations
  alter column user_id set not null;

-- Performance: common access pattern is by user_id
create index if not exists organizations_user_id_idx on public.organizations(user_id);
