-- ============================================================================
-- Geolocalização dos profissionais (mapa no diretório, Fase 2).
-- Coordenadas em nível de cidade — obtidas por geocoding de cidade/estado no
-- momento do cadastro, não é endereço exato.
-- ============================================================================

alter table public.professionals
  add column latitude numeric(9, 6),
  add column longitude numeric(9, 6);
