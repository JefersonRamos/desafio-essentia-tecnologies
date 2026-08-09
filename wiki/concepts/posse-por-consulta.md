---
type: concept
title: Posse por consulta
created: 2026-08-09
updated: 2026-08-09
tags: [seguranca, autorizacao, api]
sources: ["[[api-users-crud]]", "[[api-tasks-crud]]"]
confidence: alta
---

# Posse por consulta

Garantir que um recurso pertence a quem pede **filtrando pelo dono na própria
consulta**, em vez de buscar o recurso e depois comparar o dono.

```ts
findFirst({ where: { id, userId, deletedAt: null } })
```

Se a linha não é sua, ela simplesmente não aparece — e o serviço trata o resultado
vazio como 404.

## Como aparece nas fontes

O projeto usa **as duas** estratégias, em módulos diferentes, e a diferença é
deliberada:

| | [[api-users-crud]] | [[api-tasks-crud]] |
|---|---|---|
| Onde a posse é checada | middleware `requireOwnership` | dentro do `where` da consulta |
| Resposta para recurso alheio | 403 `users.forbidden` | 404 `tasks.not_found` |
| O que o atacante aprende | que a conta existe | nada |

## A disputa: 403 ou 404

**403 diz "existe, mas não é seu".** É honesto sobre o que aconteceu e ajuda a
depurar. O custo é confirmar a existência do recurso para quem não deveria saber.

**404 não confirma nada.** Para tarefas isso importa: ids são uuid e ninguém deveria
conseguir sondar quantas tarefas alheias existem. Para usuários o vazamento é menor —
o id na URL precisa ser o do próprio token de qualquer forma, e a rota de cadastro já
revela existência de e-mail por outro caminho (409 `users.email_taken`).

Vale registrar que a assimetria não foi decidida de uma vez: o módulo de usuários veio
primeiro com middleware, e o de tarefas escolheu o outro caminho depois. Não houve
volta para uniformizar.

## Conexões

- Combina com [[remocao-logica]]: o mesmo `where` que filtra por dono filtra
  `deletedAt: null`, então tarefa removida também some em vez de dar 403.
- O middleware de [[api-users-crud]] roda antes do controller e não custa query; a
  posse por consulta não custa query extra porque aproveita a que já ia acontecer.
