-- supabase/migrations/YYYYMMDDHHMMSS_add_jobs_and_messages.sql

-- Step 1: Create a status enum for jobs
create type job_status as enum ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Step 2: Add a status column to customer_requests
alter table public.customer_requests
add column status job_status not null default 'pending';

-- Step 3: Create the jobs table from accepted requests
-- (This step is more of a logical separation; we'll manage it via the status column for now)

-- Step 4: Create a new table for job-related messages
create table public.job_messages (
    id uuid primary key default gen_random_uuid(),
    request_id uuid not null references public.customer_requests(id) on delete cascade,
    sender_id uuid not null references public.profiles(id) on delete cascade,
    message_text text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    constraint check_message_has_content check (message_text is not null or image_url is not null)
);

-- Step 5: Enable RLS for the new messages table
alter table public.job_messages enable row level security;

-- Step 6: Create RLS policies for job_messages
-- Policy: Allow users to see messages for requests they are part of (photographer or customer)
create policy "Allow access to involved parties"
on public.job_messages for select
using (
  auth.uid() in (
    select photographer_id from public.customer_requests where id = request_id
  ) or 
  auth.uid() in (
    select customer_id from public.customer_requests where id = request_id
  )
);

-- Policy: Allow users to send messages in their own jobs
create policy "Allow insert for involved parties"
on public.job_messages for insert
with check (
  auth.uid() = sender_id and
  auth.uid() in (
    select photographer_id from public.customer_requests where id = request_id
  ) or
  auth.uid() in (
    select customer_id from public.customer_requests where id = request_id
  )
);

-- Create a new storage bucket for job-related photos
-- This will be done in the Supabase dashboard under Storage, but the policy is here.

-- Bucket: 'job-photos'
-- Policy for 'job-photos': Allow photographers/clients to upload/download images for their specific jobs.
-- (This is a simplified representation; full policies would be more complex)
-- Example SELECT policy for job-photos
-- ((bucket_id = 'job-photos'::text) AND ((storage.foldername(name))[1] = ( SELECT cr.id::text
--    FROM customer_requests cr
--   WHERE ((cr.photographer_id = auth.uid()) OR (cr.customer_id = auth.uid()))))) 