
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_doc_url text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_status text;
