---
type: source
title: CRUD de usuário — zod, posse e remoção lógica
created: 2026-08-09
updated: 2026-08-09
tags: [api, usuarios, validacao, auditoria]
origin: api/src/users/, api/src/http/validate.ts
retrieved: 2026-08-09
published: 2026-08-09
author: Jeff
medium: código
commits: [3e0f9c4, 7da9255, 0cbbd25]
---

# CRUD de usuário — zod, posse e remoção lógica

O módulo `users/` fixou o formato que os módulos seguintes copiaram: `model`,
`schema`, `repo`, `service`, `controller`, `routes`, `middleware`. Seis arquivos, uma
responsabilidade cada.

## Takeaways

**zod saiu do papel.** A dependência estava declarada e não era importada por
ninguém. Agora `user.schema.ts` valida corpo de requisição e `validateBody` traduz
cada `ZodIssue` em `{ field, message }` dentro do `details` do erro padrão. O
contrato de erro de [[api-auth-jwt]] ganhou um terceiro campo, opcional.

**A validação normaliza, não só aprova.** `email` passa por `.trim().toLowerCase()`
antes de virar e-mail válido, e `req.body` é substituído pelo dado já parseado. O
service nunca vê entrada crua.

**`deletedAt` finalmente filtra.** Todo repositório passou a consultar com
`{ deletedAt: null }`. Remover é `update` com data, não `delete` — o histórico de
auditoria continua apontando para uma linha que existe. Ver [[remocao-logica]].

**Posse é checada por middleware, com 403.** `requireOwnership` compara o `id` da URL
com o do token e recusa antes de o controller rodar. A escolha do código é
significativa e contrasta com o que o módulo de tarefas fez depois — ver
[[posse-por-consulta]].

**Trocar a senha exige a senha atual.** O schema tem um `refine` que torna
`currentPassword` obrigatório quando `password` vem no corpo, e o service confere o
hash antes de gravar. Sem isso, um token roubado trocaria a senha e tomaria a conta.

**A auditoria passou a saber quem fez.** `actorId` é preenchido em toda escrita, e o
`before`/`after` guarda um snapshot só dos campos públicos. Troca de senha entra como
`passwordChanged: true`, nunca como hash.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Nome | 2 a 255 caracteres, com trim | `user.schema.ts:3` |
| E-mail | trim + lowercase, máx. 255 | `user.schema.ts:5` |
| Senha | 8 a 128 caracteres | `user.schema.ts:7` |
| Atualização | exige ao menos um campo | `refine` em `user.schema.ts` |
| E-mail duplicado | 409 `users.email_taken` | `user.service.ts` |
| Conta alheia | 403 `users.forbidden` | `user.middleware.ts` |

## Corrida de e-mail duplicado

`assertEmailAvailable` consulta antes de gravar, mas duas requisições simultâneas
passariam as duas pela consulta. O service não confia nela: envolve o `create` num
`try` e traduz o `P2002` do Prisma para o mesmo 409. A checagem prévia existe para a
mensagem boa; o `@unique` do banco é quem garante.

## O que isto muda no wiki

Resolve duas pendências abertas em [[synthesis]]: a contradição do zod declarado e não
usado, e o gap do `deletedAt` que não filtrava. Cria [[remocao-logica]] e
[[posse-por-consulta]] como conceitos.

> [!warning] Contradição resolvida
> [[api-auth-jwt]] registrava que `zod@4.4.3` era dependência de produção sem nenhum
> import. O commit `7da9255` implementa a validação com zod em `user.schema.ts` e
> `http/validate.ts`. Resolvido: a decisão foi executada, não revertida.

## Em aberto

- O e-mail de um usuário removido continua reservado pelo `@unique`. Recadastrar com
  o mesmo endereço é impossível, e ninguém decidiu se isso é bug ou política.
- `AuditLog.list()` continua sem rota — o histórico é gravado e não é legível.
- Não há rota de recuperação de senha.
