create table if not exists public.user_email_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_email_preferences_user_category_key unique (user_id, category)
);

alter table public.user_email_preferences enable row level security;

drop policy if exists "Users can view their email preferences" on public.user_email_preferences;
create policy "Users can view their email preferences"
on public.user_email_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their email preferences" on public.user_email_preferences;
create policy "Users can insert their email preferences"
on public.user_email_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their email preferences" on public.user_email_preferences;
create policy "Users can update their email preferences"
on public.user_email_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their email preferences" on public.user_email_preferences;
create policy "Users can delete their email preferences"
on public.user_email_preferences
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.touch_user_email_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_user_email_preferences_updated_at on public.user_email_preferences;
create trigger touch_user_email_preferences_updated_at
before update on public.user_email_preferences
for each row
execute function public.touch_user_email_preferences_updated_at();
