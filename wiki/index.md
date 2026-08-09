---
type: meta
title: Índice
created: 2026-08-07
updated: 2026-08-08
tags: [meta]
---

# Índice

Catálogo de todas as páginas do wiki. É por aqui que se começa qualquer busca:
escolha as páginas pelo resumo, abra, e siga os links a partir delas.

Atualizado a cada ingest e a cada análise arquivada.

## Meta

- [[overview]] — o que é este wiki, do que ele trata, estado atual.
- [[synthesis]] — a tese evolutiva, as tensões abertas e os gaps conhecidos.
- [[log]] — registro cronológico de ingests, queries e lints.

## Fontes

- [[docs-infra]] — a stack de 5 containers, as duas redes, e o contrato que os
  Dockerfiles impõem às aplicações. Comece por aqui. (commit 7549e70)
- [[api-express-bootstrap]] — Express 5 + ESM estrito, ordem dos middlewares, config que
  falha no boot. Leia antes de qualquer outra página de API. (commits 08f6176, f065678, 6a1e25c)
- [[api-prisma-mysql]] — Prisma 7: generator novo, driver adapter, shadow database, e o
  modelo `User` com UUID e soft delete. Três detalhes que nenhum tutorial cobre. (3d40876, 8bd6bbd)
- [[api-auth-jwt]] — login, bcrypt 12 rounds, Bearer no header, e por que não existe
  logout no servidor. (e6e5d8f, 8bd6bbd)
- [[api-audit-mongo]] — `audit_logs` no Mongo com TTL, pino no stdout, e a decisão de
  seguir no ar sem auditoria. (a98c4d3)
- [[api-swagger]] — OpenAPI 3.0.3 escrito à mão, servido em `/api/docs`. Sincronizado
  por disciplina, nada valida. (6b93de1)
- [[api-i18n]] — idioma por requisição, código de erro estável separado da mensagem
  traduzida, chaves tipadas a partir do locale.

## Entidades

*Pendente.* Previstas: `techx-api`, `techx-web`, `prisma`, `pino`, `i18next`.

## Conceitos

*Pendente.* Previstos: `autenticacao-jwt`, `log-de-auditoria`,
`driver-adapter-prisma`, `i18n-por-request`, `node-modules-em-volume-nomeado`.

## Análises

*Vazio.*
