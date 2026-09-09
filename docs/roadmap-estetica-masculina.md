# Roadmap de Implementação — Marketplace de Estética Masculina

Stack definida: **Next.js (App Router) + Supabase** (Postgres, Auth, Storage). Segmento: barbearias, esteticistas e clínicas de estética masculina — o mesmo padrão de "oferta verificada + demanda + confiança" observado em pinkmed.com.br e growthstore.com.br, aplicado a esse nicho.

Cada fase abaixo separa o mapeamento em **Backend** (banco de dados, regras de acesso, lógica de servidor) e **Frontend** (telas, componentes, fluxos que o usuário vê), para servir como checklist de implementação.

## Fase 0 — Fundação (1–2 semanas)

Objetivo: banco de dados, autenticação e telas centrais funcionando localmente, mesmo sem nenhum parceiro real cadastrado ainda.

### Backend

- Schema inicial: tabelas `profiles`, `categories`, `professionals`, `services`, `portfolio_cases`, `reviews`, `contact_requests`.
- Enums de domínio: papel do usuário (cliente/profissional/admin), status de verificação (pendente/verificado/rejeitado), status do lead (novo/respondido/concluído).
- Row Level Security em todas as tabelas: leitura pública restrita a profissional verificado; escrita restrita ao dono do registro.
- Trigger: criação automática de `profile` quando alguém se cadastra no Supabase Auth.
- Trigger: recálculo de `avg_rating`/`review_count` em `professionals` a cada review criada/editada/apagada.
- Autenticação por e-mail/senha (Supabase Auth), com papel (cliente/profissional) definido no cadastro.
- Server Actions: criar sessão (login/cadastro), criar profissional, enviar lead de contato.

### Frontend

- Layout raiz (header, footer, tipografia, paleta).
- Home: hero, categorias em destaque, grid de profissionais em destaque.
- Diretório: busca por cidade e categoria, listagem em grid.
- Perfil público do profissional: dados, lista de serviços, galeria de antes-e-depois, lista de avaliações, formulário de contato.
- Cadastro de profissional: formulário de dados do negócio (entra como "pendente").
- Login / criar conta: alternância entre entrar e cadastrar, com escolha de papel.

## Fase 1 — MVP navegável (3–4 semanas) ✅ concluída

Deploy de homologação no ar (Netlify + Supabase). Todos os itens abaixo estão
implementados.



Objetivo: um parceiro real consegue se cadastrar, subir fotos, e um cliente consegue encontrá-lo e mandar mensagem — sem intervenção manual no banco.

### Backend

- Integração com Supabase Storage: bucket para fotos de capa e para pares de antes-e-depois, com política de acesso (upload só pelo dono, leitura pública se verificado).
- Endpoint/Server Action de upload de imagem (redimensionamento ou compressão básica antes de salvar, se necessário).
- Papel `admin`: coluna/checagem de permissão + políticas de RLS específicas para aprovação de cadastro.
- Server Action: aprovar/rejeitar profissional (muda `verification_status`, dispara notificação).
- Server Action: enviar avaliação (`reviews`), com checagem de que o cliente não avalia o mesmo profissional duas vezes (já existe `unique` no banco — falta a rota/formulário).
- Query/Server Action: listar `contact_requests` do profissional logado.
- E-mail transacional básico (ex: Resend ou Supabase + serviço externo): confirmação de cadastro, aviso de aprovação/rejeição, aviso de lead novo.

### Frontend

- Formulário de cadastro de profissional: campos de upload de foto de capa e de casos antes-e-depois (com preview).
- Painel `/admin`: lista de profissionais pendentes, visualização de documento/dados enviados, botões aprovar/rejeitar.
- Painel do profissional `/painel` (ou `/meus-leads`): lista de leads recebidos, com status.
- Formulário de avaliação na página do profissional (nota + comentário), visível só para cliente autenticado.
- Estado de "cadastro em análise" na página do próprio profissional, antes da aprovação.
- Deploy de homologação (Netlify — a organização do repositório no GitHub é
  paga na Vercel; a Netlify aceita repositório de organização no plano free)
  com variáveis de ambiente do Supabase de produção.

**Critério de saída da fase**: 5–10 parceiros reais cadastrados e aprovados, com pelo menos 1 lead real recebido por cada um. *(Infraestrutura pronta; validação com parceiros reais é o próximo passo fora do código.)*

## Fase 2 — Tração & Confiança (2–3 meses)

Objetivo: crescer a oferta sem depender de cadastro manual, e dar ao cliente motivo pra confiar antes de entrar em contato.

### Backend

- Geração de dados para SEO programático: rotas dinâmicas por categoria + cidade, com metadata (`title`/`description`) montada a partir dos dados reais do diretório.
- Sitemap dinâmico (`sitemap.xml`) incluindo perfis verificados e páginas de categoria/cidade.
- Verificação semi-automatizada: integração com API de validação de CPF/CNPJ; checagem de registro profissional onde aplicável (ex: conselho de classe).
- Notificações em tempo real ou near-real-time de lead novo (webhook para WhatsApp Business API ou e-mail imediato).
- Modelagem de monetização: nova tabela `plans`/`subscriptions` ou campo `featured_until` em `professionals` para destaque pago.
- Métricas básicas: tabela ou view de eventos (visualizações de perfil, cliques em "contato") para alimentar o dashboard da Fase 3.
- Colunas de geolocalização (`latitude`/`longitude`) em `professionals`, preenchidas via geocoding da cidade/endereço no cadastro (necessário pro mapa do diretório).

### Frontend

- Onboarding self-service completo: fluxo passo a passo (dados → serviços → fotos → documentos) sem necessidade de suporte humano.
- Páginas de categoria/cidade otimizadas para SEO (`/diretorio/barba/uberlandia`), com conteúdo único por combinação.
- Selo/indicador visual de "verificado" mais elaborado (com data de verificação ou tipo de checagem).
- Indicador de destaque pago no card do profissional (ex: "patrocinado" ou posição fixa no topo).
- Formulário de escolha de plano/destaque para o profissional dentro do próprio painel.
- Mapa de profissionais no diretório (visualizar quem está perto de você), com Leaflet + OpenStreetMap.

**Critério de saída da fase**: crescimento de oferta sem intervenção manual constante, e a primeira receita entrando.

## Fase 3 — Escala & Monetização (contínuo)

Objetivo: o marketplace se sustenta e cresce sozinho.

### Backend

- Cobrança recorrente (assinatura) ou comissão por transação — integração com gateway de pagamento (Stripe ou Pagar.me/Mercado Pago para o mercado brasileiro).
- Motor de recomendação simples (baseado em cidade/categoria/histórico de navegação) — pode começar como regra de negócio antes de virar modelo de dados.
- Sistema antifraude e canal de disputa: tabela de denúncias, fluxo de moderação.
- API de relatórios para o dashboard do parceiro (agregações de leads, visualizações, avaliações ao longo do tempo).
- Programa de indicação: tabela de códigos de referência e créditos/recompensas.

### Frontend

- Fluxo de checkout/assinatura dentro do painel do profissional.
- Dashboard do parceiro com gráficos (visualizações, leads, taxa de resposta, evolução da nota).
- Tela de "profissionais recomendados para você" na home/diretório.
- Canal de denúncia acessível na página do profissional e nas avaliações.
- Painel de indicação (compartilhar link, acompanhar créditos ganhos).

## Decisões técnicas já tomadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Frontend + backend | Next.js (App Router) | Um único deploy, Server Actions cobrem a maior parte da Fase 0–1 sem precisar de uma API separada |
| Banco de dados | Postgres via Supabase | RLS nativo resolve boa parte da segurança de acesso sem código extra |
| Autenticação | Supabase Auth | Já integrado ao banco, cobre e-mail/senha e pode crescer para OAuth depois |
| Armazenamento de imagem | Supabase Storage | Mesmo provedor do banco, evita mais uma conta/serviço na Fase 1 |
| Deploy (frontend) | Netlify | Vercel exige plano Pro pago pra deployar repositório de organização no GitHub; Netlify free aceita |
| Mapa de profissionais | Leaflet + OpenStreetMap | Google Maps exige cartão de crédito cadastrado mesmo na cota grátis; Leaflet/OSM é gratuito sem esse atrito, com qualidade suficiente pro estágio atual |

## Riscos a observar

Verificação de credencial é o coração da confiança do produto (como no pinkmed) — vale decidir cedo, com um advogado ou especialista do nicho, o que exatamente precisa ser checado num barbeiro/esteticista/clínica antes de aprovar um cadastro, porque isso muda o desenho do painel de verificação da Fase 1. E como o modelo de receita (Fase 2) ainda não está validado, vale conversar com os primeiros parceiros reais antes de construir cobrança — para não construir um checkout que ninguém usa.
