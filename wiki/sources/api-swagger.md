---
type: source
title: Documentação OpenAPI escrita à mão
created: 2026-08-08
updated: 2026-08-08
tags: [api, openapi, swagger, documentacao]
origin: api/src/docs/openapi.ts, api/src/app.ts
retrieved: 2026-08-08
published: 2026-08-08
author: Jeff
medium: código
commits: [585f56a]
---

# Documentação OpenAPI escrita à mão

`src/docs/openapi.ts` é um objeto TypeScript literal de ~140 linhas com `as const`,
servido cru em `/api/openapi.json` e via `swagger-ui-express` em `/api/docs`.

## Takeaways

**Escrito à mão, não gerado.** Não há decorator, não há JSDoc parseado, não há
derivação dos schemas zod (que nem estão em uso — ver [[api-auth-jwt]]). É a opção
mais simples e a mais frágil: **nada impede a rota mudar e o documento não**. O
contrato é sincronizado por disciplina.

**`servers: [{ url: '/api' }]`** — caminho relativo, sem host. Faz o "Try it out" do
Swagger UI funcionar em qualquer origem, atrás do nginx, sem CORS e sem variável de
ambiente por ambiente. Consequência: os `paths` são declarados **sem** o prefixo
`/api` (`/auth/login`, não `/api/auth/login`).

**A documentação é pública.** `/api/docs` e `/api/openapi.json` estão montados antes
do 404 e fora de `requireAuth`. Qualquer um alcança o inventário completo de rotas.

**O 401 do login tem descrição própria**, não reusa `#/components/responses/`, só pra
poder dizer: *"A resposta é a mesma para e-mail inexistente e senha errada."* A
decisão de segurança de [[autenticacao-jwt]] está escrita no contrato para não ser
"consertada" por engano.

## Dados citáveis

| Item | Valor |
|---|---|
| Versão OpenAPI | 3.0.3 |
| Título / versão da API | TechX API, 0.1.0 |
| UI | `swagger-ui-express`, `customSiteTitle: 'TechX API'` |
| JSON cru | `GET /api/openapi.json` |
| UI | `GET /api/docs` |
| Security scheme | `bearerAuth` — http / bearer / JWT |
| Tags | `Sistema`, `Autenticação` |
| Schemas | `User`, `LoginRequest`, `LoginResponse`, `Error`, `Health` |
| Rotas documentadas | `/health`, `/auth/login`, `/auth/me` |

## Schema `Error`

Atualizado junto com `src/http/fail.ts`: exige `code` e `error`.

```json
{ "code": "auth.invalid_credentials", "error": "Credenciais inválidas" }
```

`code` é o identificador estável da condição; `error` é a mensagem no idioma
negociado. Ver [[i18n-por-request]].

## O que isto muda no wiki

Fixa `/api/docs` como a referência executável do contrato HTTP. As páginas de rota
passam a poder apontar pra lá em vez de repetir schema.

## Em aberto

- Divergência doc↔código não é detectável: nada valida o documento contra as rotas
  reais. Um teste de contrato resolveria.
- Só 3 rotas documentadas porque só 3 existem — as de task ainda não foram escritas.
- A exposição pública em produção não foi decidida, só herdada.
