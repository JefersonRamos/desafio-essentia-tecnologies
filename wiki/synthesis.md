---
type: meta
title: Síntese
created: 2026-08-07
updated: 2026-08-09
tags: [meta]
sources: ["[[docs-infra]]", "[[api-express-bootstrap]]", "[[api-prisma-mysql]]", "[[api-auth-jwt]]", "[[api-audit-mongo]]", "[[api-swagger]]", "[[api-i18n]]", "[[api-users-crud]]", "[[api-token-denylist]]", "[[api-tasks-crud]]", "[[api-paginacao-cursor]]", "[[web-auth-sessao]]", "[[web-tarefas-crud]]"]
confidence: média
---

# Síntese

A tese corrente: o que as fontes, tomadas em conjunto, sustentam. Esta página é a que
mais muda — toda ingestão que move o entendimento passa por aqui. Quando uma fonte
nova derruba uma afirmação, a afirmação é reescrita, não anexada.

## Tese

O projeto é um desafio técnico cuja **infraestrutura foi construída antes da
aplicação**, e essa ordem explicava quase tudo até 2026-08-08. Em 2026-08-09 a
aplicação alcançou a infraestrutura: o domínio existe, o front consome a API, e o
desafio passou a ter as duas pontas.

No que a API decide, o padrão continua sendo **falhar cedo e alto**. Configuração
ausente derruba o boot ([[api-express-bootstrap]]), segredo de dev em produção derruba
o boot ([[api-auth-jwt]]), chave de tradução inexistente não compila ([[api-i18n]]),
corpo inválido morre na borda com `details` por campo ([[api-users-crud]]). A exceção
deliberada segue única: Mongo fora do ar **não** derruba nada ([[api-audit-mongo]]).

A segunda linha consistente é **separar identificador de apresentação**. `code`
estável ao lado da mensagem traduzida, UUID em vez de auto-increment, `camelCase` no
TypeScript contra `snake_case` no MySQL. O front herdou a regra ao exibir o `error`
da API cru, em vez de manter um segundo dicionário ([[web-auth-sessao]]).

A terceira linha, que só ficou visível com o domínio pronto, é **preferir que o dado
suma a negar acesso a ele**. `deletedAt` filtra em toda consulta ([[remocao-logica]])
e tarefa alheia responde 404, não 403 ([[posse-por-consulta]]). O mesmo instinto
aparece no cursor de paginação, que precisa ter dono para não posicionar a listagem
de terceiros ([[paginacao-por-cursor]]).

A quarta, mais recente, é **não mostrar o que não se pode sustentar**. O card de
tarefa perdeu prioridade, prazo, responsáveis e comentários porque o modelo não tem
esses campos ([[web-tarefas-crud]]); o desfazer adia a chamada em vez de recriar a
tarefa, porque recriar produziria outro registro com a mesma cara
([[desfazer-por-adiamento]]).

Onde o projeto ainda está fraco é em **prova**: nenhum teste automatizado cobre a API,
nada valida o OpenAPI contra as rotas, e a verificação que existe foi feita à mão,
uma vez, por quem escreveu o código.

## Tensões abertas

> [!warning] Contradição
> **Posse tem duas respostas.** [[api-users-crud]] usa middleware e devolve 403 para
> conta alheia; [[api-tasks-crud]] filtra na consulta e devolve 404 para tarefa
> alheia. As duas escolhas são defensáveis e estão documentadas em
> [[posse-por-consulta]], mas convivem no mesmo contrato sem que nada explique ao
> cliente por que o comportamento muda conforme o recurso. Não resolvido.

> [!warning] Contradição
> **`LOG_RETENTION_DAYS` tem dois valores em quatro lugares.** 30 em
> `api/src/config/env.ts` e `.env.example`; 60 em `docker-compose.yml` e na tabela de
> [[docs-infra]]. Quem segue a documentação roda com 30 enquanto a mesma documentação
> afirma 60. Detalhe agravante em [[api-audit-mongo]]: como a retenção vira TTL index
> na criação, corrigir a variável não corrige um container que já rodou. Não
> resolvido.

> [!warning] Contradição
> **Confirmar e desfazer cobrem o mesmo medo.** [[web-tarefas-crud]] pede confirmação
> em modal antes de remover **e** oferece desfazer depois. Concluir uma tarefa tem só
> o desfazer. Não resolvido — a redundância foi pedida, mas nada registra qual dos
> dois sai se alguém quiser simplificar.

## Gaps

- **Não há teste automatizado na API.** `createApp()` foi desenhado para ser testável
  ([[api-express-bootstrap]]) e nunca foi testado. No front existem specs, mas todos
  verificam apenas que o componente instancia.
- **Nada valida o OpenAPI contra as rotas reais** ([[api-swagger]]). A cada rota nova,
  a sincronia depende de disciplina.
- **Nada garante paridade entre locales** ([[api-i18n]]): uma chave faltando em
  `en-US` cai no fallback em silêncio.
- **O e-mail de um usuário removido fica reservado para sempre** — consequência de
  [[remocao-logica]] com `@unique`, sem política decidida.
- **`AuditLog.list()` continua sem rota.** O histórico é gravado e não é legível por
  nenhuma interface ([[api-audit-mongo]]).
- **O front não trata 401 no meio do uso** ([[web-auth-sessao]]): a sessão expira em
  1h e a tela mostra erro em vez de mandar para o login.
- **O contador de tarefas mente a partir da segunda página** ([[api-paginacao-cursor]]),
  porque conta só o que está carregado.
- **Três branches de front e API não estão na branch de integração**
  (`feat/tasks-web`, `feat/task-confirm-undo`, `feat/task-pagination`). O que
  `jeferson-ramos` entrega hoje é o board com cards estáticos.
- **Dez links apontam para páginas que não existem.** As fontes de 2026-08-08 já
  linkavam conceitos e entidades que nunca foram escritos: `autenticacao-jwt`,
  `i18n-por-request`, `log-de-auditoria`, `driver-adapter-prisma`,
  `node-modules-em-volume-nomeado`, `techx-api`, `techx-web`, `prisma`, `pino`,
  `i18next`. A ingestão de 2026-08-09 escreveu os quatro conceitos novos e não mexeu
  nessa dívida.
- **A reescrita de histórico de 2026-08-09 invalidou os SHAs citados no wiki.** Foram
  remapeados por assunto de commit nesta ingestão, mas o episódio mostra que
  `commits:` no frontmatter é frágil a `filter-branch`. Nada impede que aconteça de
  novo.

## Decisões revertidas

Registro do que foi construído e desfeito — o wiki também serve para não retentar o
que já foi recusado.

- **Rastreamento de entrada e saída por função com pino** (2026-08-09). Foi
  implementado com um wrapper `traced()`, contexto de requisição por
  `AsyncLocalStorage` e redação de segredos, e **revertido inteiro** por decisão do
  autor: a instrumentação atravessava todos os módulos de domínio e o ganho não pagou
  o ruído no código. O que permanece é o logging pontual que já existia
  ([[api-audit-mongo]]).
