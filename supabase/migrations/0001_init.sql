-- ============================================================================
-- Fundação do marketplace de estética masculina
-- Rode este arquivo no SQL editor do Supabase (ou via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Perfis: todo usuário autenticado (cliente, profissional ou admin) tem um.
-- ---------------------------------------------------------------------------
create type user_role as enum ('cliente', 'profissional', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'cliente',
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- cria o profile automaticamente quando alguém se cadastra no Supabase Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Novo usuário'),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'cliente')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. Categorias de procedimento (Barba, Cabelo, Pele, Corpo, Capilar...)
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

insert into public.categories (name, slug, sort_order) values
  ('Barba', 'barba', 1),
  ('Cabelo', 'cabelo', 2),
  ('Pele', 'pele', 3),
  ('Estética Corporal', 'estetica-corporal', 4),
  ('Transplante Capilar', 'transplante-capilar', 5),
  ('Bem-estar', 'bem-estar', 6);

-- ---------------------------------------------------------------------------
-- 3. Profissionais/parceiros (a "oferta" do marketplace)
-- ---------------------------------------------------------------------------
create type verification_status as enum ('pendente', 'verificado', 'rejeitado');

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  bio text,
  city text not null,
  state text not null,
  cover_image_url text,
  verification_status verification_status not null default 'pendente',
  verification_doc_url text,
  avg_rating numeric(3, 2) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now()
);

create index professionals_city_idx on public.professionals (city);
create index professionals_status_idx on public.professionals (verification_status);

-- ---------------------------------------------------------------------------
-- 4. Serviços oferecidos por cada profissional
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  name text not null,
  description text,
  price_from numeric(10, 2),
  duration_minutes int,
  created_at timestamptz not null default now()
);

create index services_professional_idx on public.services (professional_id);
create index services_category_idx on public.services (category_id);

-- ---------------------------------------------------------------------------
-- 5. Galeria de casos / antes-e-depois (prova social)
-- ---------------------------------------------------------------------------
create table public.portfolio_cases (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  title text not null,
  before_image_url text not null,
  after_image_url text not null,
  description text,
  created_at timestamptz not null default now()
);

create index portfolio_cases_professional_idx on public.portfolio_cases (professional_id);

-- ---------------------------------------------------------------------------
-- 6. Avaliações de clientes
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  client_profile_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (professional_id, client_profile_id)
);

-- mantém avg_rating/review_count em professionals sempre corretos
create function public.refresh_professional_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_id uuid := coalesce(new.professional_id, old.professional_id);
begin
  update public.professionals p
  set
    review_count = sub.count,
    avg_rating = coalesce(sub.avg_rating, 0)
  from (
    select count(*) as count, avg(rating)::numeric(3,2) as avg_rating
    from public.reviews
    where professional_id = target_id
  ) sub
  where p.id = target_id;
  return null;
end;
$$;

create trigger reviews_after_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.refresh_professional_rating();

-- ---------------------------------------------------------------------------
-- 7. Contato/lead (MVP: sem agenda completa, só uma solicitação direta)
-- ---------------------------------------------------------------------------
create type contact_status as enum ('novo', 'respondido', 'concluido');

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  client_email text,
  message text,
  status contact_status not null default 'novo',
  created_at timestamptz not null default now()
);

create index contact_requests_professional_idx on public.contact_requests (professional_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_cases enable row level security;
alter table public.reviews enable row level security;
alter table public.contact_requests enable row level security;

-- profiles: cada um vê/edita o próprio; leitura pública do nome p/ exibir em reviews
create policy "profiles são visíveis publicamente" on public.profiles
  for select using (true);

create policy "usuário edita o próprio perfil" on public.profiles
  for update using (auth.uid() = id);

-- professionals: qualquer um lê os verificados; o dono lê/edita o seu mesmo se pendente
create policy "profissionais verificados são públicos" on public.professionals
  for select using (
    verification_status = 'verificado' or profile_id = auth.uid()
  );

create policy "profissional cria seu próprio cadastro" on public.professionals
  for insert with check (profile_id = auth.uid());

create policy "profissional edita seu próprio cadastro" on public.professionals
  for update using (profile_id = auth.uid());

-- services / portfolio_cases: leitura pública se o profissional for verificado; escrita só pelo dono
create policy "serviços de profissionais verificados são públicos" on public.services
  for select using (
    exists (
      select 1 from public.professionals p
      where p.id = services.professional_id
        and (p.verification_status = 'verificado' or p.profile_id = auth.uid())
    )
  );

create policy "dono gerencia seus serviços" on public.services
  for all using (
    exists (
      select 1 from public.professionals p
      where p.id = services.professional_id and p.profile_id = auth.uid()
    )
  );

create policy "casos de profissionais verificados são públicos" on public.portfolio_cases
  for select using (
    exists (
      select 1 from public.professionals p
      where p.id = portfolio_cases.professional_id
        and (p.verification_status = 'verificado' or p.profile_id = auth.uid())
    )
  );

create policy "dono gerencia seus casos" on public.portfolio_cases
  for all using (
    exists (
      select 1 from public.professionals p
      where p.id = portfolio_cases.professional_id and p.profile_id = auth.uid()
    )
  );

-- reviews: leitura pública; só o cliente autenticado cria a sua
create policy "reviews são públicas" on public.reviews
  for select using (true);

create policy "cliente autenticado cria sua review" on public.reviews
  for insert with check (client_profile_id = auth.uid());

-- contact_requests: qualquer visitante pode criar (mesmo sem login); só o dono do
-- profissional (ou admin) enxerga os leads recebidos
create policy "qualquer um envia uma solicitação de contato" on public.contact_requests
  for insert with check (true);

create policy "profissional vê os próprios leads" on public.contact_requests
  for select using (
    exists (
      select 1 from public.professionals p
      where p.id = contact_requests.professional_id and p.profile_id = auth.uid()
    )
  );
