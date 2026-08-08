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
