---
type: source
title: i18n das respostas da API com i18next
created: 2026-08-08
updated: 2026-08-08
tags: [api, i18n, i18next, erros]
origin: api/src/i18n/, api/src/http/fail.ts
retrieved: 2026-08-08
published: 2026-08-08
author: Jeff
medium: código
commits: []
---

# i18n das respostas da API com i18next

> [!note] Fonte ainda não commitada
> Em 2026-08-08 este código está em `api/src/i18n/` como **untracked** (`??` no `git
> status`), e `src/http/fail.ts` idem. A proveniência aponta para o working tree, não
> para um SHA. Atualizar `commits:` quando entrar.

## Takeaways

**A negociação é por requisição, não por instalação.** `i18next-http-middleware`
resolve o idioma na ordem `querystring` → `header`: `?lang=en` vence
`Accept-Language`. Fallback `pt-BR`.

**`req.t` só existe depois do middleware.** `i18nMiddleware` é montado logo após
`express.json()` em `app.ts`. Qualquer rota registrada antes dele quebraria em
runtime, não em compilação.

**Quatro idiomas registrados, dois conjuntos de tradução.** `pt-BR`/`pt` e
`en-US`/`en` apontam para os mesmos objetos. Cobre cliente que manda `Accept-Language:
pt` sem região.

**Log não é traduzido, e isso é a decisão central.** A resposta HTTP tem idioma da
requisição; o log tem idioma da instalação. `app.ts` loga `'erro nao tratado'` fixo e
responde `req.t('common.internalError')`. Ver [[i18n-por-request]] para o raciocínio
completo.

**Código de erro é derivado, não catalogado.** `errorCode()` converte a chave de
tradução por regex: `auth.tokenInvalid` → `auth.token_invalid`. Não existe tabela
paralela, então não existe drift entre chave e código.

**As chaves são tipadas a partir do locale.** O tipo `KeyPath<typeof ptBR>` em
`fail.ts` extrai recursivamente os caminhos das folhas, então
`fail(res, 404, 'common.notFund')` é erro de compilação. O `pt-BR` é a fonte da
verdade do formato; um `en-US` incompleto **não** seria detectado.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Biblioteca | `i18next` + `i18next-http-middleware` | `api/package.json` |
| Idiomas | `pt-BR`, `pt`, `en-US`, `en` | `i18n/index.ts:6` |
| Fallback | `pt-BR` | `i18n/index.ts:12` |
| Detecção | `['querystring', 'header']`, param `lang` | `i18n/index.ts:20` |
| Escape | desligado (`escapeValue: false`) | `i18n/index.ts:24` |
| Inicialização | `await initI18n()` antes do `listen` | `server.ts` |

## Chaves existentes

| Chave | `code` derivado | pt-BR |
|---|---|---|
| `auth.credentialsRequired` | `auth.credentials_required` | E-mail e senha são obrigatórios |
| `auth.invalidCredentials` | `auth.invalid_credentials` | Credenciais inválidas |
| `auth.tokenMissing` | `auth.token_missing` | Token ausente |
| `auth.tokenInvalid` | `auth.token_invalid` | Token inválido |
| `common.notFound` | `common.not_found` | Rota não encontrada |
| `common.internalError` | `common.internal_error` | Erro interno |

Verificado em runtime através do nginx em 2026-08-08: `?lang=en` troca só o campo
`error`, o `code` permanece.

## O que isto muda no wiki

Cria [[i18n-por-request]] e [[i18next]]. Define que **toda mensagem destinada ao
cliente passa por `fail()`** — resposta de erro montada à mão vira exceção a
justificar.

## Em aberto

- `escapeValue: false` é o correto para JSON, mas se alguma mensagem for renderizada
  como HTML pelo front, o XSS é responsabilidade do consumidor. Não está escrito em
  lugar nenhum.
- Nada garante paridade entre `pt-BR` e `en-US`. Um `en-US` faltando chave cai no
  fallback em silêncio.
- O front ainda não manda `Accept-Language` nem lê o campo `code`.
