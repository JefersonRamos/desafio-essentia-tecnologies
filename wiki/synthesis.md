---
type: meta
title: Síntese
created: 2026-08-07
updated: 2026-08-08
tags: [meta]
sources: ["[[api-express-bootstrap]]", "[[api-prisma-mysql]]", "[[api-auth-jwt]]", "[[api-audit-mongo]]", "[[api-swagger]]", "[[api-i18n]]"]
confidence: média
---

# Síntese

A tese corrente: o que as fontes, tomadas em conjunto, sustentam. Esta página é a que
mais muda — toda ingestão que move o entendimento passa por aqui. Quando uma fonte
nova derruba uma afirmação, a afirmação é reescrita, não anexada.

## Tese

O projeto é um desafio técnico cuja **infraestrutura foi construída antes da
aplicação**, e essa ordem explica quase tudo o que se vê.

A stack de 5 containers ([[docs-infra]]) foi montada primeiro, com contratos
declarados para aplicações que ainda não existiam — os Dockerfiles esperam certos
scripts de `package.json` e certos caminhos de build. A API preencheu seu lado do
contrato; o front **não**, e a divergência já se materializou em dois defeitos (ver
tensões).

No que a API decidiu, há um padrão consistente: **falhar cedo e alto**. Configuração
ausente derruba o boot ([[api-express-bootstrap]]), segredo de dev em produção
derruba o boot ([[api-auth-jwt]]), chave de tradução inexistente não compila
([[api-i18n]]). A exceção é deliberada e única: o Mongo fora do ar **não** derruba
nada ([[api-audit-mongo]]) — disponibilidade ganha de auditoria, e essa é a única
troca desse tipo feita até agora.

A segunda linha consistente é **separar identificador de apresentação**. `code`
estável ao lado da mensagem traduzida, UUID em vez de auto-increment, `camelCase` no
TypeScript contra `snake_case` no MySQL. Em todos os casos o que a máquina consome é
estável e o que o humano lê é livre para mudar.

O que ainda não existe é o domínio do desafio. Só há `User`. Não há `Task`, nem
modelo, nem rota — embora [[api-audit-mongo]] já exporte `taskAudit` e
[[api-swagger]] já reserve as tags. A aplicação está toda em volta do problema e
nenhuma parte dentro dele.

## Tensões abertas

> [!warning] Contradição
> **zod está declarado e não é usado.** `api/package.json` traz `zod@4.4.3` como
> dependência de produção, mas [[api-auth-jwt]] valida o corpo do login com `typeof`
> manual e nenhum arquivo importa zod. Não resolvido — ou zod substitui a validação
> manual, ou sai do `package.json`.

> [!warning] Contradição
> **`LOG_RETENTION_DAYS` tem dois valores em quatro lugares.** 30 em
> `api/src/config/env.ts` e `.env.example`; 60 em `docker-compose.yml` e na tabela de
> [[docs-infra]]. Quem segue a documentação roda com 30 enquanto a mesma documentação
> afirma 60. Detalhe agravante em [[api-audit-mongo]]: como a retenção vira TTL index
> na criação, corrigir a variável não corrige um container que já rodou.

> [!warning] Contradição
> **[[docs-infra]] descreve um front que não existe.** O documento afirma que `web/`
> é um projeto Angular com `npm start` e build em `dist/web/browser`. Em 2026-08-08
> não há `angular.json`, `package.json` nem `src/` em `web/`; `git ls-files web`
> devolve 4 arquivos, todos de infra. Não resolvido — causa desconhecida, e o código
> Angular nunca chegou a ser versionado.

> [!warning] Contradição
> **O caminho de build do front está errado dos dois lados.** `web/Dockerfile:26`
> copia `dist/web/browser`; o único build que existe no disco é `dist/code/browser`.
> Mesmo que o projeto volte, o stage `prod` quebra. Não resolvido — depende de decidir
> o nome do projeto Angular.

## Gaps

- **O container `web` está em loop de restart** (`ENOENT: /app/package.json`) e a
  stack documentada em [[docs-infra]] não sobe inteira. Nenhuma fonte explica o que
  aconteceu com o código.
- **`web/.gitignore` deixou o `src/` fora do versionamento** sem que ninguém notasse
  até a perda. Falta uma fonte sobre a política de versionamento do front.
- **`deletedAt` existe e não filtra.** [[api-prisma-mysql]] registra a coluna, mas
  nenhum repositório checa `deletedAt is null` e o `@unique` do e-mail trava o
  endereço de um usuário apagado para sempre. Falta decidir a estratégia.
- **Nada garante paridade entre locales** ([[api-i18n]]): uma chave faltando em
  `en-US` cai no fallback em silêncio.
- **Nada valida o OpenAPI contra as rotas reais** ([[api-swagger]]).
- **Não há teste automatizado em lugar nenhum.** `createApp()` foi desenhado para ser
  testável ([[api-express-bootstrap]]) e não é testado.
- **`AuditLog.list()` não tem rota** e `actorId` chega sempre `null` fora do seed
  ([[api-audit-mongo]]) — o histórico é gravado, não é legível, e não diz quem fez.
- Faltam as páginas de entidade e conceito que as fontes já linkam. O lint vai
  acusá-las como links quebrados até serem escritas.
