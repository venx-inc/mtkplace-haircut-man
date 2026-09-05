-- ============================================================================
-- Storage: fotos de capa e casos antes-e-depois dos profissionais
-- Rode depois de 0001_init.sql.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('professional-photos', 'professional-photos', true)
on conflict (id) do nothing;

-- Convenção de path: <profile_id>/<arquivo> — o primeiro segmento do path
-- precisa ser o uuid do dono, é isso que as policies abaixo checam.

create policy "fotos de profissionais são públicas para leitura"
  on storage.objects for select
  using (bucket_id = 'professional-photos');

create policy "dono envia suas próprias fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dono atualiza suas próprias fotos"
  on storage.objects for update
  using (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "dono apaga suas próprias fotos"
  on storage.objects for delete
  using (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
