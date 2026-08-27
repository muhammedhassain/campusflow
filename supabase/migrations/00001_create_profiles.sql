-- Create a private profile for each authenticated user

create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can view only their own profile
create policy "Users can view their own profile."
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Users can create only their own profile
create policy "Users can insert their own profile."
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update their own profile."
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow authenticated users to use the required operations
grant select, insert, update on public.profiles to authenticated;

-- Automatically create a profile when a new user registers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );

  return new;
end;
$$;

-- Trigger for automatic profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Automatically update updated_at
create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_profile_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_profile_updated_at();