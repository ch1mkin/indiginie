-- Add richer profile fields for normal signup/login flow

alter table public.profiles
  add column if not exists phone_country_code text,
  add column if not exists phone_number text,
  add column if not exists indian_address text,
  add column if not exists nri_address text,
  add column if not exists country_of_residence text,
  add column if not exists additional_details text;
