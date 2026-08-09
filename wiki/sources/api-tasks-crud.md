---
type: source
title: CRUD de tarefas — o domínio do desafio finalmente existe
created: 2026-08-09
updated: 2026-08-09
tags: [api, tarefas, dominio]
origin: api/src/tasks/
retrieved: 2026-08-09
published: 2026-08-09
author: Jeff
medium: código
commits: [6563698]
---

# CRUD de tarefas — o domínio do desafio finalmente existe

Cinco rotas sob `/api/tasks`, no mesmo desenho em camadas de [[api-users-crud]]. É a
primeira parte do código que fica **dentro** do problema do desafio, e não em volta
dele.

## Takeaways

**O escopo por dono vive na consulta, não num middleware.** `findOwned` filtra `id` e
`user_id` juntos em toda leitura. Tarefa de outro usuário responde **404, não 403** —
quem não é dono não descobre nem que ela existe. É o oposto da escolha feita em
[[api-users-crud]], e de propósito: ver [[posse-por-consulta]].

**Não existe rota para concluir.** Marcar como feita é `PATCH { done: true }`, o mesmo
verbo que altera título e descrição. Uma rota `/:id/done` seria um segundo caminho
para o mesmo efeito.

**O modelo é enxuto por decisão explícita.** `title`, `description`, `done` e as
datas. O card do design pedia código, prioridade, projeto, prazo, responsáveis e
comentários; nada disso entrou. A consequência apareceu no front, que teve de perder
esses elementos para não exibir dado inventado — ver [[web-tarefas-crud]].

**A ordenação é do servidor, não do cliente.** `done ASC, createdAt DESC`: pendentes
primeiro, mais recentes no topo. O front replica a mesma regra ao inserir localmente,
para não precisar refazer o `GET` a cada mutação.

**Express 5 obrigou a validar o path param.** `req.params.id` tipa como
`string | string[] | undefined` nos tipos do Express 5, então não há como passá-lo
adiante sem estreitar. Em vez de um cast, a validação virou zod: `parseParams` reusa
o miolo de `validateBody`, e o id ganha checagem de uuid de brinde — id malformado
responde 400 com `details`, antes de qualquer ida ao banco.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Título | 1 a 255 caracteres, com trim | `task.schema.ts:3` |
| Descrição | opcional, anulável, máx. 5000 | `task.schema.ts:5` |
| Atualização | exige ao menos um campo | `refine` em `task.schema.ts` |
| Tarefa alheia | 404 `tasks.not_found` | `task.service.ts` |
| Índice | `(user_id, done)` | migration `20260809130553` |
| Remoção | lógica, via `deleted_at` | `task.repo.ts` |

## Contrato

| Rota | Resposta |
|---|---|
| `GET /api/tasks` | 200 `{ tasks: [] }` |
| `POST /api/tasks` | 201 `{ task }` |
| `GET /api/tasks/:id` | 200 `{ task }` |
| `PATCH /api/tasks/:id` | 200 `{ task }` |
| `DELETE /api/tasks/:id` | 204 |

Todas exigem Bearer. O router inteiro é protegido por um `use(requireAuth)`, em vez
de repetir o middleware rota a rota.

## O que isto muda no wiki

Derruba a afirmação de [[synthesis]] de que "não há `Task`, nem modelo, nem rota". O
`taskAudit` que [[api-audit-mongo]] já exportava e as tags que [[api-swagger]] já
reservava deixaram de ser promessa. Cria [[posse-por-consulta]].

## Em aberto

- Sem filtro por status na API: quem quiser só as pendentes filtra no cliente.
- A remoção é lógica, mas não há rota para restaurar. `deleted_at` só cresce.
- Nenhum teste automatizado cobre o módulo — o gap de [[synthesis]] segue de pé.
