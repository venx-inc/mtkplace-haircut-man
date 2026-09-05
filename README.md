# Barba&Cia — marketplace de estética masculina

Fundação do projeto: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase
(Postgres, Auth e Storage). Este é o esqueleto do MVP — diretório de
profissionais, perfil com portfólio, avaliações, lead de contato e cadastro de
parceiro com fila de verificação.

## Como rodar localmente

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Crie um projeto no [Supabase](https://supabase.com)** (gratuito para começar).

3. **Rode a migração inicial** — abra o SQL Editor do seu projeto Supabase e
   cole o conteúdo de `supabase/migrations/0001_init.sql` (cria as tabelas,
   os triggers de rating/perfil automático e as políticas de RLS).

   Se preferir a CLI:
   ```bash
   npx supabase link --project-ref SEU_PROJECT_REF
   npx supabase db push
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os
   valores em *Project Settings → API* no painel do Supabase.

5. **Suba o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## Estrutura

```
src/
  app/
    page.tsx                     → home (destaques + categorias)
    diretorio/page.tsx           → busca/listagem de profissionais
    profissional/[slug]/         → perfil público (serviços, portfólio, avaliações, contato)
    cadastro-profissional/       → onboarding do parceiro (entra como "pendente")
    login/                       → entrar / criar conta (cliente ou profissional)
  components/                    → Header, Footer, ProfessionalCard
  lib/supabase/                  → clientes Supabase (browser, server, middleware)
  types/database.types.ts        → tipos manuais espelhando o schema SQL
supabase/migrations/0001_init.sql → schema completo + RLS
```

## Modelo de dados (resumo)

- `profiles` — todo usuário autenticado (cliente/profissional/admin), criado
  automaticamente via trigger quando alguém se cadastra.
- `professionals` — o parceiro (barbeiro, esteticista, clínica). Só aparece
  publicamente quando `verification_status = 'verificado'`.
- `categories` — Barba, Cabelo, Pele, Estética Corporal, Transplante Capilar,
  Bem-estar (ajuste livremente).
- `services` — o que cada profissional oferece, com preço "a partir de".
- `portfolio_cases` — antes-e-depois (a prova social do nicho).
- `reviews` — nota + comentário; `avg_rating`/`review_count` em
  `professionals` são recalculados automaticamente por trigger.
- `contact_requests` — lead simples (nome/telefone/mensagem), sem agenda
  completa nesta fase — o MVP é validar demanda antes de construir booking.

Row Level Security já está configurado: qualquer visitante lê profissionais
**verificados**, mas só o dono edita o próprio cadastro; leads de contato só
são visíveis para o profissional dono.

## O que falta para a Fase 1 (MVP completo)

Isso aqui é a fundação — banco, auth e as telas centrais. Para fechar a Fase 1
do roadmap, os próximos passos são:

1. Upload de imagens (Supabase Storage) para foto de capa e antes-e-depois no
   formulário de cadastro do parceiro.
2. Painel admin simples para aprovar/rejeitar profissionais em `pendente`
   (hoje isso só dá pra fazer direto no painel do Supabase).
3. Formulário de avaliação (hoje só a leitura está implementada).
4. Página "meus leads" para o profissional ver as `contact_requests` recebidas.
5. Deploy: Vercel (frontend) + Supabase (já é hospedado) — bem direto.

## Próxima fase (Tração & Confiança)

Ver o roadmap completo no board publicado: avaliações com prova social,
motor de SEO por categoria/cidade, onboarding self-service e primeiro modelo
de monetização (destaque pago / lead cobrado / assinatura do parceiro).
