-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table tasks enable row level security;

-- Create policies
create policy "Users can view their own tasks."
  on tasks for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own tasks."
  on tasks for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own tasks."
  on tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks."
  on tasks for delete
  using ( auth.uid() = user_id );

-- Create indexes
create index tasks_user_id_idx on tasks(user_id);
create index tasks_due_date_idx on tasks(due_date);
create index tasks_status_idx on tasks(status);

-- Create a function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Set up trigger to update the 'updated_at' column
create trigger on_task_updated
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();
