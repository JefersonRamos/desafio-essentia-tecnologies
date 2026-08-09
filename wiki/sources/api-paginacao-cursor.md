---
type: source
title: Paginação por cursor — ordem total e cursor com dono
created: 2026-08-09
updated: 2026-08-09
tags: [api, tarefas, paginacao, seguranca, pendente]
origin: api/src/tasks/task.service.ts, api/src/tasks/task.repo.ts, api/prisma/migrations/20260809154603_tasks_pagination_index/
retrieved: 2026-08-09
published: 2026-08-09
author: Jeff
medium: código
commits: [0a0480a]
---

# Paginação por cursor — ordem total e cursor com dono

`GET /api/tasks?limit=20&cursor=<uuid>` devolve `{ tasks, nextCursor }`. Repete-se a
chamada com o cursor devolvido até ele vir `null`.

> [!warning] Estado
> **Não está em `jeferson-ramos`.** Vive na branch `feat/task-pagination`.

## Takeaways

**O `id` entrou na ordenação para a ordem ficar total.** Era
`done ASC, createdAt DESC`; virou `done ASC, createdAt DESC, id DESC`. Sem desempate,
duas tarefas criadas no mesmo milissegundo podem repetir ou sumir na virada de
página, porque o cursor só sabe dizer "depois deste ponto" se o ponto for único.

**Cursor de outro usuário era aceito.** O filtro por `user_id` continuava valendo, então
nenhuma tarefa alheia vazava — mas o `createdAt` daquela linha posicionava a
listagem, o que permitiria inferir a ordenação de tarefas de terceiros. O service
passou a exigir que o cursor pertença a quem pergunta, e responde 400
`tasks.invalid_cursor`. O mesmo tratamento cobre cursor de tarefa já removida, que
antes devolvia página vazia em silêncio.

**`limit + 1` responde "tem mais?" sem `COUNT`.** Pede-se um item além do pedido; se
ele veio, existe próxima página e ele é descartado. Evita uma segunda query.

**O índice acompanhou a ordenação.** `(user_id, done)` virou
`(user_id, done, created_at)`. Paginação por chave sem índice que cubra a ordem é
armadilha: funciona no teste com 25 linhas e degrada com volume.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| `limit` | 1 a 100, default 20 | `task.schema.ts` |
| `cursor` | uuid; opaco por contrato | `task.schema.ts` |
| Cursor inválido | 400 `tasks.invalid_cursor` | `task.service.ts` |
| Índice | `(user_id, done, created_at)` | migration `20260809154603` |

## A migration saiu errada do gerador

`prisma migrate dev` gerou um arquivo que derrubava a foreign key de `tasks` e, no
lugar de recriá-la, tentava recriar a de `revoked_tokens` — que já existia. A
migration falhou no meio: o índice novo entrou, a FK de `tasks` **sumiu do banco de
dev** e o registro ficou marcado como falho.

O conserto foi manual: reescrever o SQL na ordem correta (derruba FK → troca índice →
recria FK), devolver a constraint ao banco, `prisma migrate resolve --applied`, e
depois rodar a cadeia inteira num banco descartável para provar que funciona do zero.
Lição registrada: **migration gerada não é migration verificada** — vale rodar a
cadeia num banco vazio antes de confiar.

## Verificação

25 tarefas, 3 concluídas, páginas de 10: três páginas de 10/10/5, 25 percorridas e 25
únicas, com as concluídas caindo no fim mesmo atravessando a fronteira de página.
`limit=999` e cursor não-uuid respondem 400.

## O que isto muda no wiki

Cria [[paginacao-por-cursor]]. Altera o contrato de listagem descrito em
[[api-tasks-crud]] — a resposta deixou de ser `{ tasks }` e passou a
`{ tasks, nextCursor }`.

## Em aberto

- O contador do cabeçalho do front conta só o que está carregado, e fica errado a
  partir da segunda página. O caminho seria a API devolver os totais junto da página.
- Não há filtro por status nem ordenação alternativa; se surgirem, o cursor como id
  cru continua funcionando, mas o contrato precisa dizer que ele é opaco.
