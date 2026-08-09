---
type: source
title: Tarefas no Angular — CRUD, confirmação e desfazer
created: 2026-08-09
updated: 2026-08-09
tags: [web, angular, tarefas, ux, pendente]
origin: web/src/app/tasks/, web/src/app/task-card/, web/src/app/task-dialog/, web/src/app/confirm-dialog/, web/src/app/toast-host/
retrieved: 2026-08-09
published: 2026-08-09
author: Jeff
medium: código
commits: [7e03394, 5e8c63e, 57c05ec, 414315f, b2713da]
---

# Tarefas no Angular — CRUD, confirmação e desfazer

O board passou a viver de dado real: `TaskService` fala HTTP, `TaskStore` guarda a
lista em signals, e o card virou componente com `input.required<Task>()` e três
`output`.

> [!warning] Estado
> **Não está em `jeferson-ramos`.** Vive nas branches `feat/tasks-web`,
> `feat/task-confirm-undo` e `feat/task-pagination`, nessa ordem de dependência. O
> que a branch de integração tem hoje é o board com cards estáticos.

## Takeaways

**O card foi enxugado até só mostrar dado que existe.** Saíram o código `TAR - 28`, a
tag `Urgente`, o projeto, o prazo, os dois avatares e o contador de comentários — o
modelo de [[api-tasks-crud]] não tem nenhum desses campos. Ficaram título, descrição,
estado e data. A alternativa, manter os enfeites fixos no template, exibiria dado
inventado.

**O badge de status usa vocabulário que o design já previa.** `Pendente` em
`surface-pill` com texto `strong`, `Concluída` em `success-soft` com texto `success` —
exatamente o par que os comentários de `styles.css` descreviam para a pílula "A
fazer" e para "Concluído", e que ninguém tinha usado.

**Desfazer remoção é desfazer de verdade.** O `DELETE` **não** sai na confirmação: a
tarefa some da lista, fica num `leaving`, e a chamada só parte quando o toast expira.
Desfazer cancela o timer. Deletar e recriar no undo geraria id e `createdAt` novos —
seria uma tarefa diferente com a mesma aparência. Ver [[desfazer-por-adiamento]].

**Confirmação e desfazer coexistem, e se sobrepõem.** O modal pergunta antes; o toast
corrige depois. São dois mecanismos para o mesmo medo. Concluir uma tarefa tem só o
desfazer, porque a ação é de um clique e reversível no próprio card.

**A criação tem duas portas.** Enter no campo rápido cria na hora e abre o modal para
refinar — a tarefa **já existe**, fechar o modal não desfaz nada. O botão "Nova
tarefa" abre o modal vazio e só cria no submit.

**`setValue` não limpa `touched`.** Reabrir o modal reexibia o erro de uma tentativa
anterior de salvar vazio, porque `setValue` troca o valor e preserva o estado de
validação. `reset(valor)` faz as duas coisas. O mesmo padrão estava na edição inline
do card, onde o sintoma não aparecia só porque aquele formulário não renderiza
mensagem de erro.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Duração do toast | 6000 ms, com barra em `linear` | `toast-service.ts` |
| Ordenação local | `done ASC, createdAt DESC, id DESC` | `task-store.ts` |
| Modal | `<dialog>` nativo — foco preso e Escape de graça | `confirm-dialog.html` |
| Confirmação | edição e remoção; **não** no toggle | `board.ts` |
| Limpeza no logout | `TaskStore.reset()` chamado por `AuthService` | `auth-service.ts` |

## Por que o card não fecha mais no submit

A edição inline fechava assim que o formulário era enviado. Com o modal de
confirmação no meio, cancelar jogaria fora o texto digitado. Agora o card só fecha
quando a tarefa recebida muda de fato — ou seja, quando o `PATCH` voltou.

## Verificação

Exercitado em navegador real contra a API: criar, concluir, editar e remover
disparam as chamadas esperadas; depois de desfazer uma remoção, **nenhuma** requisição
`DELETE` chegou a sair; deixar o toast expirar dispara o `DELETE`; e o F5 confirma o
estado no servidor.

## O que isto muda no wiki

Cria [[desfazer-por-adiamento]]. Fecha o gap de [[synthesis]] sobre o front não
consumir a API — parcialmente, porque o código não está na branch de integração.

## Em aberto

- Fechar a aba nos 6 segundos do toast cancela a remoção sem querer: a chamada nunca
  sai e a tarefa reaparece no próximo carregamento.
- O contador do cabeçalho conta só as tarefas carregadas — ver
  [[paginacao-por-cursor]].
- Salvar pelo modal não passa pela confirmação, a edição inline passa. A assimetria é
  deliberada, mas é assimetria.
