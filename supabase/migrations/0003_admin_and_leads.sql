-- ============================================================================
-- Painel admin (aprovar/rejeitar profissionais) e painel de leads do
-- profissional (atualizar status do próprio contact_request).
-- Rode depois de 0001_init.sql e 0002_storage.sql.
-- ============================================================================

-- admin enxerga todos os profissionais, inclusive pendentes de outros donos
create policy "admin vê todos os profissionais" on public.professionals
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- admin aprova/rejeita qualquer profissional
create policy "admin atualiza qualquer profissional" on public.professionals
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- dono do profissional atualiza o status (novo/respondido/concluído) dos próprios leads
create policy "profissional atualiza status dos próprios leads" on public.contact_requests
  for update using (
    exists (
      select 1 from public.professionals p
      where p.id = contact_requests.professional_id and p.profile_id = auth.uid()
    )
  );
