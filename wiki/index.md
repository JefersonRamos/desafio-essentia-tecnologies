---
type: meta
title: Índice
created: 2026-08-07
updated: 2026-08-09
tags: [meta]
---

# Índice

Catálogo de todas as páginas do wiki. É por aqui que se começa qualquer busca:
escolha as páginas pelo resumo, abra, e siga os links a partir delas.

Atualizado a cada ingest e a cada análise arquivada.

## Meta

- [[overview]] — o que é este wiki, do que ele trata, estado atual.
- [[synthesis]] — a tese evolutiva, as tensões abertas, os gaps e as decisões
  revertidas.
- [[log]] — registro cronológico de ingests, queries e lints.

## Fontes

### Infraestrutura

- [[docs-infra]] — a stack de 5 containers, as duas redes, e o contrato que os
  Dockerfiles impõem às aplicações. Comece por aqui. (commit 7549e70)

### API

- [[api-express-bootstrap]] — Express 5 + ESM estrito, ordem dos middlewares, config
  que falha no boot. Leia antes de qualquer outra página de API. (1934951, bb97f43,
  1d404c9)
- [[api-prisma-mysql]] — Prisma 7: generator novo, driver adapter, shadow database, e
  o modelo `User` com UUID e soft delete. (bbf24a0, c7ae849)
- [[api-auth-jwt]] — login, bcrypt 12 rounds, Bearer no header, resposta ambígua
  contra enumeração. Corrigida em 2026-08-09: **existe** logout no servidor.
  (1563a79, c7ae849)
- [[api-token-denylist]] — revogação por `jti` numa tabela que se poda sozinha, e o
  cadastro que passou a devolver sessão. (dd1b6c2, 770b10f)
- [[api-users-crud]] — zod na borda, posse por middleware com 403, remoção lógica e
  auditoria com autor. (3e0f9c4, 7da9255, 0cbbd25)
- [[api-tasks-crud]] — o domínio do desafio: 5 rotas, posse na consulta com 404,
  modelo enxuto por decisão. (6563698)
- [[api-paginacao-cursor]] — cursor com ordem total e com dono, e a migration que o
  gerador errou. **Branch pendente.** (0a0480a)
- [[api-audit-mongo]] — `audit_logs` no Mongo com TTL, pino no stdout, e a decisão de
  seguir no ar sem auditoria. (8d53197)
- [[api-swagger]] — OpenAPI 3.0.3 escrito à mão, servido em `/api/docs`. Sincronizado
  por disciplina, nada valida. (585f56a)
- [[api-i18n]] — idioma por requisição, código de erro estável separado da mensagem
  traduzida, chaves tipadas a partir do locale.

### Front

- [[web-auth-sessao]] — rotas de login e cadastro, sessão em `localStorage`, guarda,
  interceptor e tema escuro derivado dos tokens. (a6bce07, 3956952)
- [[web-tarefas-crud]] — board consumindo a API, card enxugado, confirmação em modal e
  desfazer. **Branches pendentes.** (7e03394, 5e8c63e, 57c05ec, 414315f, b2713da)

## Conceitos

- [[posse-por-consulta]] — filtrar pelo dono na consulta; a disputa entre 403 e 404, e
  por que o projeto usa os dois.
- [[remocao-logica]] — `deleted_at` em vez de `DELETE`, por causa da auditoria; e o
  e-mail que fica reservado para sempre.
- [[desfazer-por-adiamento]] — desfazer não executando ainda, e por que recriar não
  serve como desfazer.
- [[paginacao-por-cursor]] — por que a ordem precisa ser total e o cursor precisa ter
  dono.

## Entidades

*Pendente.* Previstas: `techx-api`, `techx-web`, `prisma`, `pino`, `i18next`.

## Análises

*Vazio.*
