-- Pre-approved admins: add an email before the person signs up.
-- They become admin automatically once they confirm their email.
-- Safe to re-run. Run in Supabase Dashboard → SQL Editor.

create table if not exists public.admin_invites (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

-- Server/SQL only: no policies, so the public key can't read or write it.
alter table public.admin_invites enable row level security;

-- Grants admin when a user with an invited email is (or becomes) confirmed.
create or replace function public.apply_admin_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and exists (select 1 from admin_invites where email = lower(new.email)) then
    insert into profiles (id, full_name, role)
    values (new.id, new.raw_user_meta_data ->> 'full_name', 'admin')
    on conflict (id) do update set role = 'admin';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_admin_invite on auth.users;
create trigger on_auth_user_admin_invite
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.apply_admin_invite();

-- ---------------------------------------------------------------
-- Invite list. Add more emails here (lowercase) and re-run.
-- ---------------------------------------------------------------
insert into public.admin_invites (email) values
  ('cantallhenkee@gmail.com')
on conflict (email) do nothing;

-- Also apply to anyone on the list who has already signed up and confirmed.
update public.profiles p set role = 'admin'
  from auth.users u
 where u.id = p.id
   and u.email_confirmed_at is not null
   and lower(u.email) in (select email from public.admin_invites);
