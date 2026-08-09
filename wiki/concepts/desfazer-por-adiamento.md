---
type: concept
title: Desfazer por adiamento
created: 2026-08-09
updated: 2026-08-09
tags: [ux, web, tarefas]
sources: ["[[web-tarefas-crud]]"]
confidence: alta
---

# Desfazer por adiamento

Desfazer implementado **não executando ainda**. A interface reage na hora, a chamada
destrutiva fica num timer, e o "Desfazer" cancela o timer antes de qualquer coisa
sair para o servidor.

## Como aparece nas fontes

[[web-tarefas-crud]] usa isso na remoção de tarefa: o card some da lista e vai para um
`leaving`; o `DELETE` só parte quando o toast expira, aos 6 segundos. Desfazer devolve
o card e nada chega à API — verificado em navegador, com zero requisições após o
desfazer.

## Contra o quê se decidiu

A alternativa óbvia é **executar e compensar**: deletar na hora e, no desfazer,
recriar. Foi recusada porque a API só tem `POST /tasks`, então a tarefa "restaurada"
teria **id e `createdAt` novos**. Seria outra tarefa com a mesma aparência — links,
histórico de auditoria e qualquer referência anterior apontariam para o registro
antigo.

Para edição a compensação funciona e é o que se usa: o `PATCH` vai na hora e o
desfazer manda os valores anteriores de volta. A diferença é que editar é reversível
sem perder identidade; remover não é.

## O preço

Existe uma janela em que a tela e o servidor discordam. Fechar a aba dentro dos 6
segundos cancela a remoção sem que ninguém tenha pedido: a chamada nunca sai e a
tarefa reaparece no próximo carregamento. Fechar essa janela exigiria disparar a
chamada no `beforeunload`, o que troca um problema por outro — a requisição pode não
completar.

## Conexões

- [[remocao-logica]] — a API poderia oferecer restauração de verdade, já que a linha
  continua no banco; enquanto não oferece, o adiamento é o único desfazer honesto.
- A confirmação em modal cobre o mesmo medo por outro caminho, e as duas coexistem em
  [[web-tarefas-crud]].
