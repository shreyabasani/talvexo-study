create table if not exists public.responses (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  college_name text not null,
  email text not null,
  gender text not null,
  age integer not null,
  gaming_frequency text not null,
  gaming_type text not null,
  prior_gamified_experience text not null,
  stream text not null,
  role_title text not null,
  mode_assigned text not null,
  random_decimal numeric not null,
  device_type text not null,
  section1_score integer not null,
  section2_score integer not null,
  section3_score integer not null,
  total_score integer not null,
  section1_time_seconds integer,
  section2_time_seconds integer,
  section3_time_seconds integer,
  section1_answers jsonb,
  section2_answers jsonb,
  section3_answers jsonb,
  manipulation_check integer,
  manipulation_check_tokens text,
  q1 integer not null,
  q2 integer not null,
  q3 integer not null,
  q4 integer not null,
  q5 integer not null,
  q6 integer not null,
  q7 integer not null,
  q8 integer not null,
  q9 integer not null,
  q10 integer,
  q11 integer,
  q12 integer,
  m1 integer not null,
  m2 integer not null,
  m3 integer not null,
  open_feedback text,
  engagement_avg numeric not null,
  fairness_avg numeric not null,
  attractiveness_avg numeric not null,
  clarity_competence_avg numeric,
  performance_badge_tier text not null,
  submitted_at timestamptz default now()
);

alter table public.responses
  add column if not exists manipulation_check_tokens text,
  add column if not exists q10 integer,
  add column if not exists q11 integer,
  add column if not exists q12 integer,
  add column if not exists clarity_competence_avg numeric;

alter table public.responses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'responses'
      and policyname = 'Allow public insert'
  ) then
    create policy "Allow public insert" on public.responses
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'responses'
      and policyname = 'Allow public select'
  ) then
    create policy "Allow public select" on public.responses
      for select using (true);
  end if;
end $$;
