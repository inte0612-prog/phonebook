-- Create contacts table
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- Encrypted
  phone text not null, -- Encrypted
  name_search text, -- Hash for searching
  phone_search text, -- Hash for searching
  category text not null,
  memo text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.contacts enable row level security;

-- Policies
create policy "Users can perform all actions on their contacts"
on public.contacts
for all
using (true); -- Note: For this MVP, we are allowing all public access if no Auth is set. 
-- In a real app, use auth.uid() = user_id.

-- Indexes
create index idx_contacts_name_search on public.contacts (name_search);
create index idx_contacts_phone_search on public.contacts (phone_search);
create index idx_contacts_category on public.contacts (category);
