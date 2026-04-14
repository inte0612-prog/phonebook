-- Create contacts table
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null, -- Owner of the contact
  name text not null, -- Encrypted
  phone text not null, -- Encrypted
  name_search text, -- Hash for searching
  phone_search text, -- Hash for searching
  category text not null,
  memo text,
  image_url text, -- Contact profile image path
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.contacts enable row level security;

-- Policies
create policy "Users can perform all actions on their own contacts"
on public.contacts
for all
using (auth.uid() = user_id);

-- Indexes
create index idx_contacts_user_id on public.contacts (user_id);
create index idx_contacts_name_search on public.contacts (name_search);
create index idx_contacts_phone_search on public.contacts (phone_search);
create index idx_contacts_category on public.contacts (category);

-- Storage Setup (Execute in Supabase Storage SQL or via UI)
-- 1. Create 'contact_images' bucket
-- 2. Allow public read access to 'contact_images'
-- 3. Allow authenticated users to upload to 'contact_images/public'
