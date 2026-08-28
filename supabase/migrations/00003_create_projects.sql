-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'on_hold')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  start_date date,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Grant permissions to authenticated users
grant select, insert, update, delete on public.projects to authenticated;

-- Create RLS policies
create policy "Users can view their own projects."
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects."
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects."
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own projects."
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create indexes
create index projects_user_id_idx on public.projects(user_id);
create index projects_status_idx on public.projects(status);

-- Set up trigger to update the 'updated_at' column using the existing function
create trigger on_project_updated
  before update on public.projects
  for each row execute procedure public.handle_updated_at();
