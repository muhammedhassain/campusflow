-- Create a table for public profiles
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Set up triggers to update the 'updated_at' column
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on profiles
  for each row execute procedure moddatetime (updated_at);

-- Set up a trigger to automatically create a profile for a new user
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
