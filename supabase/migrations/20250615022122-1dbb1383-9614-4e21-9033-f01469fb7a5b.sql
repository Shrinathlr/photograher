
-- 1. Create the kyc-docs bucket (private)
insert into storage.buckets (id, name, public)
values ('kyc-docs', 'kyc-docs', false)
on conflict (id) do nothing;

-- 2. Allow each user to INSERT only their own doc (named {userId}/...)
create policy "Users can insert own KYC doc"
  on storage.objects
  for insert
  with check (
    bucket_id = 'kyc-docs'
    and (name like (auth.uid() || '/%'))
  );

-- 3. Allow each user to read only their own KYC doc
create policy "Users can read own KYC doc"
  on storage.objects
  for select
  using (
    bucket_id = 'kyc-docs'
    and (name like (auth.uid() || '/%'))
  );

-- 4. Allow each user to update/delete only their own KYC doc
create policy "Users can update own KYC doc"
  on storage.objects
  for update
  using (
    bucket_id = 'kyc-docs'
    and (name like (auth.uid() || '/%'))
  );

create policy "Users can delete own KYC doc"
  on storage.objects
  for delete
  using (
    bucket_id = 'kyc-docs'
    and (name like (auth.uid() || '/%'))
  );
