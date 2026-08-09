---
type: concept
title: Paginação por cursor
created: 2026-08-09
updated: 2026-08-09
tags: [api, dados, desempenho]
sources: ["[[api-paginacao-cursor]]"]
confidence: alta
---

# Paginação por cursor

Pedir a próxima página dizendo **onde a anterior parou**, em vez de quantas linhas
pular. O cliente devolve o `nextCursor` que recebeu; o servidor continua dali.

## Por que não offset

`LIMIT n OFFSET k` custa cada vez mais caro conforme `k` cresce — o banco varre e
descarta as `k` primeiras linhas. Pior: entre uma página e outra a lista muda. Uma
tarefa criada enquanto o usuário lê a página 1 empurra tudo, e a página 2 repete um
item; uma removida faz um item ser pulado.

O cursor não tem esse problema porque a pergunta é sobre conteúdo — "o que vem depois
deste ponto" —, não sobre posição.

## A condição que ninguém avisa: a ordem tem que ser total

O cursor só funciona se "depois deste ponto" tiver resposta única. Ordenar por
`createdAt DESC` não basta: duas linhas com o mesmo timestamp são um empate, e o
banco pode desempatar de um jeito na página 1 e de outro na página 2 — item repetido
ou item pulado, exatamente o que a paginação por cursor deveria evitar.

Por isso [[api-paginacao-cursor]] acrescentou o `id` como último critério. Qualquer
coluna única serve; a chave primária é a que sempre existe.

## O cursor precisa de dono

Se o cursor referencia uma linha, quem manda o cursor está apontando para uma linha —
e nada garante que seja dele. Em [[api-paginacao-cursor]] um cursor de tarefa alheia
não vazava conteúdo, porque o filtro por usuário continuava valendo, mas posicionava a
listagem pelo `createdAt` daquela linha. Cursor é entrada do usuário e se valida como
tal: [[posse-por-consulta]] resolve, e a resposta vira 400.

## O índice acompanha a ordem

Paginação por chave sem índice cobrindo a ordenação funciona no teste pequeno e
degrada com volume — o banco volta a varrer. O índice tem que ter as mesmas colunas,
na mesma sequência da cláusula de ordenação.

## Conexões

- [[posse-por-consulta]] — o cursor é validado pelo mesmo princípio.
- [[api-tasks-crud]] — a ordenação original, de onde a ordem total partiu.
