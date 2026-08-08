---
type: source
title: Prisma 7 sobre MySQL — generator, adapter e migrations
created: 2026-08-08
updated: 2026-08-08
tags: [api, prisma, mysql, orm, migrations]
origin: api/prisma/, api/prisma.config.ts, api/src/db/prisma.ts, api/src/users/
retrieved: 2026-08-08
published: 2026-08-08
author: Jeff
medium: código
commits: [3d40876, 8bd6bbd]
---

# Prisma 7 sobre MySQL — generator, adapter e migrations

A camada de dados da [[techx-api]]. Prisma 7 mudou o suficiente em relação ao 5/6 que
quase todo tutorial na internet está errado para esta configuração — três detalhes
abaixo não têm como ser adivinhados.

## Takeaways

**O generator é `prisma-client`, não `prisma-client-js`.** O antigo está depreciado
no 7. O novo **exige** o campo `output` — sem ele o generate falha — e para ESM exige
`moduleFormat = "esm"`. O cliente sai em `api/src/generated/prisma/` e é importado de
`../generated/prisma/client.js`, não de `@prisma/client`.

**O `datasource` no schema não tem `url`.** Isso quebra a expectativa de todo mundo.
A URL entra por duas vias separadas: o `prisma.config.ts` alimenta a CLI (migrate,
studio), e o `PrismaMariaDb` alimenta o runtime. Ver [[driver-adapter-prisma]].

**Driver adapter, sem engine binária.** `db/prisma.ts` passa
`adapter: new PrismaMariaDb(env.databaseUrl)`. O adapter `@prisma/adapter-mariadb`
fala com MySQL 8.4 normalmente — MariaDB no nome é o driver, não o banco.

**Shadow database é explícita.** `prisma migrate dev` precisa de um banco descartável
para diffar o schema. O usuário `techx` não tem permissão para criar bancos, então
`mysql/init/01-prisma-shadow.sql` cria `prisma_migrate_shadow` no primeiro boot do
container, e `SHADOW_DATABASE_URL` aponta pra lá **como root**.

**Singleton com cache no `globalThis` em dev.** Evita esgotar o pool quando o `tsx
watch` recarrega o módulo. Em produção não guarda no global.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Prisma / client | 7.9.1 | `api/package.json` |
| Adapter | `@prisma/adapter-mariadb` | `src/db/prisma.ts:1` |
| Banco | MySQL 8.4, utf8mb4/unicode_ci | `docker-compose.yml:72` |
| Migration inicial | `20260808221716_init` | `prisma/migrations/` |
| Shadow DB | `prisma_migrate_shadow`, criada como root | `mysql/init/01-prisma-shadow.sql` |
| Log do client | `['error']` em prod, `['warn','error']` em dev | `src/db/prisma.ts` |

## O modelo `User`

```prisma
model User {
  id           String    @id @default(uuid()) @db.Char(36)
  name         String    @db.VarChar(255)
  email        String    @unique @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")
  @@map("users")
}
```

Decisões embutidas:

- **UUID em `CHAR(36)`**, não auto-increment. ID não vaza contagem de usuários nem
  permite enumeração sequencial. Custo: índice mais gordo e ordenação por `id` sem
  significado temporal — por isso `createdAt` existe.
- **`camelCase` no TypeScript, `snake_case` no MySQL**, via `@map`. O `@@map`
  pluraliza a tabela. O código nunca vê `password_hash`.
- **`@updatedAt`, não `@default(now())`.** O default só marcaria a criação; o
  atributo é o que faz o Prisma reescrever a coluna a cada update.
- **`deletedAt` opcional = soft delete.** Nulo significa vivo. Ainda é só a coluna —
  ver "Em aberto".

A migration `20260808235302_user_timestamps_soft_delete` foi editada à mão: o Prisma
gerou `updated_at` como `NOT NULL` sem default numa tabela já povoada, o que não
executa. A versão aplicada cria a coluna com `DEFAULT CURRENT_TIMESTAMP(3)`, faz
`UPDATE users SET updated_at = created_at`, e então `DROP DEFAULT` para o schema
físico voltar a bater com o que o Prisma espera.

## Repositório fino, `select` explícito

`user.repo.ts` tem duas funções e nenhuma classe. O detalhe que importa:
`findByEmail` inclui `passwordHash` no `select` e devolve `UserWithSecret`;
`findById` **não inclui** e devolve `User`. O tipo carrega a diferença, então é erro
de compilação vazar hash numa resposta. Ver [[autenticacao-jwt]].

## O que isto muda no wiki

Cria [[prisma]] como entidade e [[driver-adapter-prisma]] como conceito. Fixa UUID
como padrão de identidade para toda entidade futura do projeto.

## Em aberto

- **`deletedAt` não filtra nada.** `findByEmail` e `findById` não checam
  `deletedAt: null`, e o Prisma 7 não tem filtro global sem client extension.
  Enquanto nenhuma rota escrever a coluna não há brecha, mas no instante em que
  existir um delete, o usuário "apagado" continua logando.
- **`email @unique` trava o e-mail para sempre.** Um usuário soft-deleted mantém o
  e-mail ocupado e ninguém consegue se registrar com ele de novo.
- Só existe o modelo `User`. A entidade `task`, que o desafio pede e que
  [[log-de-auditoria]] já prevê em `taskAudit`, não tem modelo nem migration.
- Não há `onDelete` nem relação alguma ainda — a primeira relação vai exigir decidir
  a política de cascata.
