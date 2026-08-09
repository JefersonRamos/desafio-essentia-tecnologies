---
type: source
title: Auditoria em MongoDB e log estruturado com pino
created: 2026-08-08
updated: 2026-08-08
tags: [api, logging, mongodb, pino, auditoria]
origin: api/src/logging/, api/prisma/seed.ts
retrieved: 2026-08-08
published: 2026-08-08
author: Jeff
medium: código
commits: [8d53197]
---

# Auditoria em MongoDB e log estruturado com pino

Dois sistemas distintos que o commit juntou e que convém não confundir: **pino** é o
log operacional (stdout, efêmero, para quem opera); **`audit_logs` no Mongo** é o
registro de negócio (persistente, consultável, para quem audita).

## Takeaways

**Auditoria é opcional em runtime, de propósito.** `server.ts` envolve
`connectMongo()` num try/catch e sobe a API mesmo se o Mongo estiver fora.
`AuditLog.write` checa se a coleção existe e, se não, emite `warn` e segue. Escolha:
**a API disponível vale mais que a auditoria completa**. O custo é que a perda de
auditoria é silenciosa fora do log.

**Retenção é TTL index, não job.** `{ key: { at: 1 }, expireAfterSeconds:
retentionDays * 86400 }`. O Mongo apaga sozinho. Pegadinha operacional: o TTL fica
gravado no índice na criação — **mudar `LOG_RETENTION_DAYS` num container já rodado
não tem efeito**, porque `createIndexes` não altera um índice existente.

**Uma instância de `AuditLog` por entidade.** `userAudit` e `taskAudit` são
singletons exportados. `taskAudit` já existe sem nenhuma rota de task — foi escrito
antecipando o modelo que [[api-prisma-mysql]] ainda não tem.

**Redaction no pino é por caminho, e é frágil.** `redact.paths` cobre
`req.headers.authorization`, `*.password`, `*.passwordHash`, `*.token`. O `*` é um
nível só: um segredo em `user.credentials.password` **não** seria censurado.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Coleção | `audit_logs` | `mongo.ts:20` |
| Banco | `MONGO_DATABASE`, default `techx_logs` | `env.ts` |
| Retenção | `LOG_RETENTION_DAYS` — ver contradição abaixo | `env.ts`, `docker-compose.yml:57` |
| Ações | `create`, `update`, `delete` | `audit.model.ts:3` |
| Entidades | `user`, `task` | `audit.model.ts:1` |
| Nível de log | `LOG_LEVEL`, default `info` | `env.ts` |
| Transport dev | `pino-pretty`, colorido, `HH:MM:ss` | `logger.ts` |

> [!warning] Contradição
> `LOG_RETENTION_DAYS` tem quatro declarações e dois valores:
>
> | Onde | Valor |
> |---|---|
> | `api/src/config/env.ts` (default do código) | 30 |
> | `.env.example:19` | 30 |
> | `docker-compose.yml:57` (fallback) | 60 |
> | `docs/infra.md`, tabela de variáveis | 60 |
>
> Quem segue o `docs/infra.md` (`cp .env.example .env`) roda com **30**, enquanto o
> mesmo documento afirma 60. O fallback 60 do compose só vale se a variável sumir do
> `.env`. Não resolvido — a documentação está errada, ou os defaults estão.

## Formato da entrada

```ts
interface AuditEntry {
  entity: 'user' | 'task';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  actorId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  at: Date;
}
```

`before`/`after` guardam o estado, não o diff — quem consome calcula a diferença. É
mais barato de escrever e mais caro de armazenar.

## Índices

Três de consulta e um de expiração:

| Índice | Serve para |
|---|---|
| `{at: -1}` | timeline global, mais recente primeiro |
| `{entity, entityId, at: -1}` | histórico de um registro |
| `{actorId, at: -1}` | tudo que um usuário fez |
| `{at: 1}` + TTL | expiração automática |

## O que isto muda no wiki

Cria [[log-de-auditoria]] como conceito e [[pino]] como entidade. Estabelece que
MongoDB neste projeto é **só** auditoria — dado de aplicação é MySQL, conforme
[[docs-infra]].

## Em aberto

- `AuditLog.list()` existe e nenhuma rota a expõe. O histórico é gravado e não é
  legível pela API.
- `actorId` sempre chega `null` fora do seed — nenhuma rota passa o `req.user.id`
  ainda, então não dá pra saber *quem* fez.
- Nada audita leitura. Só create/update/delete.
