-- Public marketing/content assets bucket for thumbnails and landing visuals

insert into storage.buckets (id, name, public)
values ('content-assets', 'content-assets', true)
on conflict (id) do nothing;

create policy "content_assets_public_read"
on storage.objects
for select
using (bucket_id = 'content-assets');

create policy "content_assets_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'content-assets' and public.current_role() = 'admin');

create policy "content_assets_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'content-assets' and public.current_role() = 'admin')
with check (bucket_id = 'content-assets' and public.current_role() = 'admin');

create policy "content_assets_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'content-assets' and public.current_role() = 'admin');
