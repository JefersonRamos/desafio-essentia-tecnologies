---
type: meta
title: Visão geral
created: 2026-08-07
updated: 2026-08-08
tags: [meta]
---

# Visão geral

Porta de entrada do wiki. Diz do que ele trata, o que já foi coberto e por onde
alguém que chega agora deveria começar a ler.

## Do que trata

Deste projeto: o desafio TechX e as decisões técnicas que o constroem. Uma stack
Docker de 5 containers com API Express + TypeScript, MySQL para dados, MongoDB para
auditoria, e um front Angular atrás de um nginx de borda.

A divisão com `docs/infra.md`: aquele arquivo diz **o que fazer** (comandos,
variáveis, como rodar); o wiki diz **por que é assim** e o que custou descobrir.

## Estado

| | |
|---|---|
| Fontes ingeridas | 7 |
| Páginas | 11 |
| Última ingestão | 2026-08-08 — API completa e infraestrutura |
| Contradições abertas | 4 |
| Cobertura | API e infra ingeridas; front **não** (ver gaps) |

## Por onde começar

- [[docs-infra]] — a fonte-raiz. Topologia, redes, o contrato que os Dockerfiles
  impõem às aplicações. Quase tudo o mais herda restrição daqui.
- [[api-express-bootstrap]] — as convenções que toda página de API assume.
- [[synthesis]] — a tese corrente, as 4 contradições abertas e os gaps.
- [[index]] — catálogo completo, com um resumo por página.

## Como usar

Mande uma fonte — URL, arquivo, transcrição, texto colado — e peça a ingestão. Commit
que muda arquitetura, contrato de API ou decisão técnica também dispara ingest.
Pergunte contra o wiki quando quiser uma resposta; respostas boas viram páginas em
`wiki/analyses/`. Peça um lint de vez em quando para achar contradições, órfãs e
buracos.
