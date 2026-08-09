---
type: meta
title: Log
created: 2026-08-07
updated: 2026-08-07
tags: [meta]
---

# Log

Append-only, mais recente embaixo. Cabeçalho no formato
`## [AAAA-MM-DD] tipo | Assunto`, com tipo em `ingest`, `query`, `lint` ou `schema`.

```bash
grep "^## \[" wiki/log.md | tail -5
```

---

## [2026-08-07] schema | Wiki criado

Estrutura inicial: `wiki/` com sources, entities, concepts e analyses, e o schema em
`CLAUDE.md`. Sem camada de fontes brutas — a página em `sources/` é o registro
canônico da fonte, com a proveniência no frontmatter. Domínio ainda indefinido: o
schema é genérico e vai se especializar conforme as primeiras fontes entrarem.

## [2026-08-08] schema | Domínio definido e código como fonte

O wiki passou 8 commits sem uma única entrada enquanto a API inteira era escrita. A
causa era o próprio schema: ele declarava a stack fora de escopo e esperava fonte
externa. Corrigido — o domínio agora é este projeto, `medium: código` é válido com
`origin` em caminho de repositório e `commits` com os SHAs, e commit que muda
arquitetura ou contrato dispara ingest.

## [2026-08-08] ingest | API TechX e infraestrutura Docker

Sete fontes de uma vez, cobrindo `docs/infra.md` e todo o `api/src`. A tese que
emergiu: a infraestrutura foi construída antes da aplicação, e isso explica tanto a
consistência da API (falhar cedo e alto) quanto os defeitos do front (contrato
declarado e não cumprido).

Quatro contradições registradas em `synthesis.md`: zod declarado e não usado,
`LOG_RETENTION_DAYS` com dois valores em quatro lugares, `docs/infra.md` descrevendo
um front Angular que não existe mais no disco, e `web/Dockerfile` copiando um caminho
de build que nunca bateu. Entidades e conceitos ficaram pendentes.

## [2026-08-09] ingest | Domínio de tarefas, front e paginação por cursor

Cinco fontes novas cobrindo tudo que entrou desde 2026-08-08: denylist de token,
CRUD de usuário, CRUD de tarefas, autenticação no Angular e paginação por cursor.
Quatro conceitos escritos — `posse-por-consulta`, `remocao-logica`,
`desfazer-por-adiamento`, `paginacao-por-cursor` —, os primeiros do wiki.

A tese se moveu: a aplicação alcançou a infraestrutura. Duas contradições antigas
caíram (zod declarado e não usado, `deletedAt` que não filtrava) e uma afirmação
central de `api-auth-jwt` foi reescrita — passou a existir logout no servidor. Duas
tensões novas entraram: posse com duas respostas (403 em usuários, 404 em tarefas) e
a sobreposição entre confirmar e desfazer.

Registrada a primeira decisão revertida: o rastreamento de entrada e saída por função
com pino foi implementado e desfeito por inteiro. Corrigidos oito SHAs de proveniência
que a reescrita de histórico do dia tinha matado — remapeados por assunto de commit.
Três branches de front e API seguem fora da branch de integração, e as páginas dizem
isso.

## [2026-08-09] ingest | Testes de HTTP, CI e rate limit

Suíte da API foi de 51 para 76 casos, com `app.test.ts` exercitando o `createApp()`
inteiro — ordem de middleware, routers nos paths certos, handler de erro no fim, e o
caso que faltava: a denylist barrando uma requisição real depois do logout. Quatro
mutações confirmaram que a suíte acusa (mover o i18n derruba 14 dos 18).

Achado: a `main` estava com 3 testes quebrados. `feat/api-testes` e
`feat/task-pagination` mudaram `listByUser` em paralelo e foram mergeadas separadas —
ninguém percebeu porque não havia CI. Agora há, e a paginação ganhou os testes que
nunca teve.

Registrada em `api-token-denylist` a decisão das duas idas ao banco por requisição
autenticada, com o que ela compra, o que custa e as saídas conhecidas. Rate limit de
5r/m em `/api/auth/` no nginx fecha a força bruta no login. O teste tautológico do
repo virou regra de lint, que vale sobre o código de produção.
