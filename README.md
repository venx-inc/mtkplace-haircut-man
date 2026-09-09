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

3. **Rode as migrações, nesta ordem** — abra o SQL Editor do seu projeto
   Supabase e cole o conteúdo de:
   - `0001_init.sql` — tabelas, triggers de rating/perfil automático e RLS;
   - `0002_storage.sql` — bucket `professional-photos` para fotos de capa e
     antes-e-depois, com políticas de acesso;
   - `0003_admin_and_leads.sql` — políticas de RLS para o painel admin
     (aprovar/rejeitar) e para o profissional atualizar o status dos próprios
     leads;
   - `0004_geolocation.sql` — colunas `latitude`/`longitude` em
     `professionals`, usadas pelo mapa do diretório.

   Para testar o painel `/admin`, promova seu usuário a admin direto no banco:
   `update public.profiles set role = 'admin' where id = 'SEU_USER_ID';`

   Se preferir a CLI:
   ```bash
   npx supabase link --project-ref SEU_PROJECT_REF
   npx supabase db push
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
   `SUPABASE_SERVICE_ROLE_KEY` com os valores em *Project Settings → API* no
   painel do Supabase (a service role key é usada só server-side, para o
   admin buscar o e-mail do dono de um profissional e mandar os avisos).
   `RESEND_API_KEY`/`EMAIL_FROM` são opcionais — sem eles, os e-mails
   transacionais só são logados no console em vez de enviados de verdade.

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

## Mapa de profissionais (Fase 2)

`/diretorio` mostra um mapa (Leaflet + tiles do OpenStreetMap, sem chave de
API) com os profissionais verificados que têm coordenadas. As coordenadas são
preenchidas automaticamente no cadastro via geocoding gratuito da
cidade/estado (Nominatim/OpenStreetMap) — granularidade de cidade, não
endereço exato.

**Limitação atual**: como ainda não existe uma tela de edição de cadastro,
profissionais que já existiam no banco **antes** da migration
`0004_geolocation.sql` não têm coordenadas e não aparecem no mapa até serem
recadastrados (ou até alguém rodar um `update` manual preenchendo
`latitude`/`longitude` no SQL Editor do Supabase).

## O que falta para a Fase 1 (MVP completo)

Isso aqui é a fundação — banco, auth e as telas centrais. Para fechar a Fase 1
do roadmap, os próximos passos são:

1. ~~Upload de imagens (Supabase Storage) para foto de capa e antes-e-depois no
   formulário de cadastro do parceiro.~~ ✅ feito — bucket `professional-photos`
   (`0002_storage.sql`) + upload de foto de capa e casos antes-e-depois (com
   preview) direto no formulário de cadastro.
2. ~~Painel admin simples para aprovar/rejeitar profissionais em `pendente`.~~
   ✅ feito — `/admin` lista os pendentes com botões aprovar/rejeitar
   (`0003_admin_and_leads.sql` dá a policy de RLS pro admin enxergar/editar
   qualquer profissional).
3. ~~Formulário de avaliação.~~ ✅ feito — cliente autenticado avalia direto na
   página do profissional (nota de 1 a 5 + comentário), bloqueado se já
   avaliou ou se não estiver logado.
4. ~~Página "meus leads" para o profissional ver as `contact_requests`
   recebidas.~~ ✅ feito — `/painel` lista os leads do próprio profissional e
   deixa marcar como respondido/concluído.
5. ~~E-mail transacional (confirmação de cadastro, aviso de aprovação/rejeição,
   aviso de lead novo).~~ ✅ feito via [Resend](https://resend.com)
   (`src/lib/email.ts`) — confirmação ao cadastrar, aviso de
   aprovação/rejeição e aviso de lead novo. Sem `RESEND_API_KEY` configurada,
   os envios só são logados no console (não quebra o fluxo em dev).
6. ~~Deploy: Netlify (frontend) + Supabase.~~ ✅ feito — homologação no ar.

**Fase 1 concluída.** O header mostra "Admin" e "Meus leads" condicionalmente
ao papel do usuário logado, e um botão "Sair". Próximo passo do roadmap:
Fase 2 (Tração & Confiança) — ver `docs/roadmap-estetica-masculina.md`.

## Deploy de homologação (Netlify + Supabase)

Escolhemos Netlify em vez de Vercel porque o repositório vive na organização
`venx-inc` no GitHub — na Vercel isso exige um time Pro (pago); no Netlify o
plano free aceita repositórios de organização, mas só se o repositório for
**público** (privado de organização também exige upgrade lá). O repo foi
tornado público por não ter nenhum segredo commitado (só `.env.example` com
placeholders).

O `netlify.toml` na raiz do projeto já declara o build command e o plugin
`@netlify/plugin-nextjs` — sem ele, o Netlify publica o `.next` como site
estático puro (0 functions) e todas as rotas dinâmicas dão 404. Isso já
está resolvido no repo; só documentando o motivo pra não se perder de novo
se o arquivo for removido por engano.

1. **Supabase — banco**
   - Use o mesmo projeto do passo "Como rodar localmente" ou crie um novo
     exclusivo para homologação.
   - Rode as três migrações **nesta ordem**, se ainda não rodou:
     `0001_init.sql` → `0002_storage.sql` → `0003_admin_and_leads.sql`.
   - Promova pelo menos um usuário a admin:
     `update public.profiles set role = 'admin' where id = 'SEU_USER_ID';`

2. **Supabase — Auth URLs** (*Authentication → URL Configuration*)
   - `Site URL`: a URL de produção do Netlify (ex: `https://seu-projeto.netlify.app`).
   - `Redirect URLs`: adicione a mesma URL e, se quiser testar deploy previews,
     o padrão `https://deploy-preview-*--seu-projeto.netlify.app/**`.
   - Sem isso, os links de confirmação de e-mail/redefinição de senha do
     Supabase Auth apontam pro `localhost`.

3. **Resend (opcional, mas recomendado em homologação)**
   - Crie a API key em [resend.com](https://resend.com).
   - Sem domínio próprio verificado, use `EMAIL_FROM=onboarding@resend.dev` —
     funciona, mas só entrega para o e-mail cadastrado na sua conta Resend.
     Para mandar e-mail de verdade pros parceiros, verifique um domínio no
     Resend e use esse domínio em `EMAIL_FROM`.

4. **Netlify**
   - Entre em [netlify.com](https://netlify.com) com sua conta GitHub e
     autorize o app da Netlify a acessar a organização `venx-inc`.
   - "Add new site" → "Import an existing project" → GitHub → selecione
     `venx-inc/mtkplace-haircut-man`, branch `main`.
   - Deixe o build command e publish directory no automático (o Netlify
     detecta Next.js sozinho).
   - Antes de clicar em "Deploy site", adicione as variáveis de ambiente (as
     mesmas do `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`,
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
     `RESEND_API_KEY`, `EMAIL_FROM`.
   - Deploy.

5. **Checklist pós-deploy** — teste o fluxo completo na URL publicada:
   criar conta → cadastrar profissional → aprovar em `/admin` → ver o
   perfil público → mandar um lead de contato → conferir em `/painel` →
   avaliar o profissional. Confira também se os e-mails chegaram (ou
   apareceram no log da função, se o Resend não estiver configurado).

## Próxima fase (Tração & Confiança)

Ver o roadmap completo no board publicado: avaliações com prova social,
motor de SEO por categoria/cidade, onboarding self-service e primeiro modelo
de monetização (destaque pago / lead cobrado / assinatura do parceiro).
