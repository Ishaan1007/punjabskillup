-- Run this once in Supabase: Project > SQL Editor > New query > paste this > Run

create table if not exists course_data (
  id smallint primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

insert into course_data (id, data)
values (1, '{"tree":[],"content":{}}'::jsonb)
on conflict (id) do nothing;

alter table course_data enable row level security;

-- Anyone can read the notes (this powers the public site)
drop policy if exists "Public can read course data" on course_data;
create policy "Public can read course data"
  on course_data for select
  using (true);

-- No insert/update/delete policy is defined for anon/authenticated roles,
-- so only the service role key (used server-side by the admin API) can write.
