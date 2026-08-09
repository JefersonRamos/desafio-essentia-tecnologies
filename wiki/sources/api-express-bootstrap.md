---
type: source
title: Bootstrap da API — Express, TypeScript e ambiente
created: 2026-08-08
updated: 2026-08-08
tags: [api, express, typescript, configuracao]
origin: api/package.json, api/tsconfig.json, api/src/config/env.ts, api/src/app.ts, api/src/server.ts
retrieved: 2026-08-08
published: 2026-08-08
author: Jeff
medium: código
commits: [08f6176, f065678, 6a1e25c]
---

# Bootstrap da API — Express, TypeScript e ambiente

A base da [[techx-api]]: Express 5 em ESM puro sobre TypeScript estrito, configuração
lida de variáveis de ambiente com falha no boot, e um `server.ts` que separa montagem
da aplicação de subida do processo.

## Takeaways

**Express 5, não 4.** A diferença que importa aqui: no Express 5 um handler `async`
que rejeita propaga pro error handler sozinho, sem `express-async-errors` nem
`try/catch` em toda rota. É por isso que `auth.routes.ts` chama `await findByEmail`
sem envolver nada.

**ESM de verdade, com a pegadinha do `.js`.** `tsconfig.json` usa
`module: NodeNext` + `verbatimModuleSyntax`, então todo import relativo escreve a
extensão `.js` mesmo apontando pra um arquivo `.ts` (`import { env } from
'../config/env.js'`). Não é engano — é o caminho pós-compilação, e o TypeScript
resolve pro `.ts` correspondente.

**O tsconfig é mais estrito que o default.** Além de `strict`, liga
`noUncheckedIndexedAccess` — acesso indexado devolve `T | undefined`. É o que força
`String(decoded['email'] ?? '')` em `token.ts:25`.

**`createApp()` devolve o app sem escutar.** `app.ts` só monta; `server.ts` sobe.
A separação existe para teste de integração poder montar o app sem abrir porta.

**Configuração falha no boot, não na primeira requisição.** `env.ts` tem um helper
`required()` que joga se a variável estiver ausente. `JWT_SECRET`, `DATABASE_URL` e
`MONGO_URL` são obrigatórias; o resto tem default.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Express | 5.2.1 | `api/package.json` |
| TypeScript | ~5.9.2 | `api/package.json` |
| Target / module | ES2023 / NodeNext | `api/tsconfig.json` |
| Runtime de dev | `tsx watch src/server.ts` | script `dev` |
| Porta | `PORT`, default 3000 | `env.ts:12` |
| Rota de saúde | `GET /api/health` → `{status, uptime}` | `app.ts` |

## Ordem dos middlewares

A ordem em `createApp()` é significativa e frágil:

1. `express.json()`
2. `i18nMiddleware` — precisa vir antes de qualquer rota, senão `req.t` não existe
3. rotas (`/api/health`, `/api/auth`, `/api/openapi.json`, `/api/docs`)
4. handler de 404 — captura tudo que sobrou
5. handler de erro — assinatura de 4 argumentos, tem que ser o último

Ver [[i18n-por-request]] para por que o passo 2 não pode descer.

## Encerramento

`server.ts` registra `SIGINT` e `SIGTERM`, fecha o servidor HTTP e só então desconecta
o Mongo. Importa em container: `docker compose stop` manda `SIGTERM`, e sem isso as
conexões ficam penduradas até o timeout.

## O que isto muda no wiki

Estabelece [[techx-api]] como entidade e fixa as restrições que todas as outras
páginas de API assumem: ESM, imports com `.js`, strict, config que falha cedo.

## Em aberto

- Não há teste automatizado. `createApp()` foi desenhado pra ser testável e não é
  testado.
- `/api/health` responde `ok` sem verificar MySQL nem Mongo — é liveness, não
  readiness. Um health check de orquestrador seria enganado por ele.
