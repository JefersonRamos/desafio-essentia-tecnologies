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
