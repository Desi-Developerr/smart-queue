-- ============================================
-- SMART QUEUE MANAGEMENT SYSTEM — DATABASE SCHEMA
-- ============================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user',
  organization_id uuid references organizations(id),
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  description text,
  avg_service_minutes int default 5,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table counters (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) not null,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table tokens (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) not null,
  user_id uuid references auth.users(id) not null,
  token_number serial,
  status text not null default 'waiting',
  created_at timestamptz default now(),
  called_at timestamptz,
  completed_at timestamptz
);

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table services enable row level security;
alter table counters enable row level security;
alter table tokens enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Authenticated users can view organizations"
  on organizations for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can view services"
  on services for select
  using (auth.role() = 'authenticated');

create policy "Admins manage own org services"
  on services for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and profiles.organization_id = services.organization_id
    )
  );

create policy "Authenticated users can view counters"
  on counters for select
  using (auth.role() = 'authenticated');

create policy "Admins manage own org counters"
  on counters for all
  using (
    exists (
      select 1 from profiles p
      join services s on s.id = counters.service_id
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.organization_id = s.organization_id
    )
  );

create policy "Users view own tokens"
  on tokens for select
  using (auth.uid() = user_id);

create policy "Users insert own tokens"
  on tokens for insert
  with check (auth.uid() = user_id);

create policy "Users cancel own tokens"
  on tokens for update
  using (auth.uid() = user_id);

create policy "Admins view org tokens"
  on tokens for select
  using (
    exists (
      select 1 from profiles p
      join services s on s.id = tokens.service_id
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.organization_id = s.organization_id
    )
  );

create policy "Admins update org tokens"
  on tokens for update
  using (
    exists (
      select 1 from profiles p
      join services s on s.id = tokens.service_id
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.organization_id = s.organization_id
    )
  );

alter publication supabase_realtime add table tokens;

insert into organizations (name, type) values ('BTU General Hospital', 'hospital');
