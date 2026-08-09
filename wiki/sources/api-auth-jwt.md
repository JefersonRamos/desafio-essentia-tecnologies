---
type: source
title: Autenticação JWT — login, token e middleware
created: 2026-08-08
updated: 2026-08-08
tags: [api, auth, jwt, seguranca]
origin: api/src/auth/, api/src/config/env.ts
retrieved: 2026-08-08
published: 2026-08-08
author: Jeff
medium: código
commits: [1563a79, c7ae849]
---

# Autenticação JWT — login, token e middleware

Quatro arquivos em `api/src/auth/`: `password.ts` (hash), `token.ts` (assinatura),
`auth.routes.ts` (login e `/me`), `auth.middleware.ts` (proteção de rota).

## Takeaways

**Só access token, sem refresh.** A sessão morre em 1h e não se renova. Esta página
registrava também que não havia sessão no servidor nem blacklist, e que por isso
**não existia logout** — isso deixou de valer em 2026-08-09, quando
[[api-token-denylist]] introduziu a revogação por `jti`. O que permanece é a ausência
de refresh token.

**Bearer no header, não cookie.** Sem cookie não há CSRF; em troca, o token fica
onde o front puser (memória, `localStorage`) e o XSS passa a ser o vetor.

**O middleware bate no banco a cada requisição.** `requireAuth` decodifica o token e
ainda chama `findById`. Isso custa uma query por request e paga por dois cenários:
usuário apagado com token válido, e dados frescos em `req.user`. Era a única forma de
revogação que existia aqui; hoje divide o papel com a denylist de
[[api-token-denylist]], que acrescenta uma segunda query por requisição.

**Resposta de login é deliberadamente ambígua.** E-mail inexistente e senha errada
devolvem o mesmo 401 `auth.invalid_credentials`. Impede enumeração de usuários. Está
documentado no OpenAPI (`api-swagger`) para ninguém "corrigir" depois.

**Segredo de dev derruba a produção.** `env.ts` joga no boot se
`NODE_ENV=production` e `JWT_SECRET` ainda for `dev_secret_change_me`. Falha de
container é ruidosa; API rodando com segredo público é silenciosa.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Hash | bcryptjs, 12 rounds | `password.ts:3` |
| Biblioteca JWT | jsonwebtoken 9.0.3 | `api/package.json` |
| Expiração | `JWT_EXPIRES_IN`, default `1h` | `env.ts:17` |
| Payload | `{ sub: UserId, email }` | `token.ts:5` |
| Header | `Authorization: Bearer <token>` | `auth.middleware.ts:17` |
| Segredo de dev | `dev_secret_change_me` | `.env.example:23` |

## Fluxo

```
POST /api/auth/login  {email, password}
  → findByEmail        (traz passwordHash)
  → bcrypt.compare
  → jwt.sign({sub, email})
  → 200 {token, user}

GET /api/auth/me  Authorization: Bearer <token>
  → requireAuth: verifyToken → findById → req.user
  → 200 {user}
```

`verifyPassword` só roda se o usuário existir, mas o resultado é combinado num único
`if` — o código não devolve cedo entre as duas checagens. O timing ainda difere entre
"e-mail não existe" (sem bcrypt) e "senha errada" (com bcrypt), então a proteção
contra enumeração é da mensagem, não do tempo.

## Contrato de erro

Desde a introdução de `src/http/fail.ts`, toda resposta de erro carrega **código
estável + mensagem traduzida**:

```json
{ "code": "auth.invalid_credentials", "error": "Credenciais inválidas" }
```

O `code` é derivado da chave de tradução por regex (`tokenInvalid` →
`token_invalid`), então não existe tabela paralela para dessincronizar. Ver
[[i18n-por-request]].

| Situação | HTTP | `code` |
|---|---|---|
| Corpo sem e-mail ou senha | 400 | `auth.credentials_required` |
| E-mail ou senha errados | 401 | `auth.invalid_credentials` |
| Header `Authorization` ausente | 401 | `auth.token_missing` |
| Token inválido, expirado, ou usuário sumiu | 401 | `auth.token_invalid` |

## O que isto muda no wiki

Cria [[autenticacao-jwt]] como conceito. Define o contrato de erro que toda rota
futura herda.

> [!note] Contradição resolvida
> `api/package.json` declarava `zod@4.4.3` sem nenhum import, enquanto o login
> validava o corpo com `typeof` manual. Resolvido em `7da9255`: [[api-users-crud]]
> implementa a validação com zod e `http/validate.ts`. O login continua com a
> checagem manual, porque aceita corpo de forma tolerante para devolver
> `auth.credentials_required` — é a única rota que não passa por schema.

## Em aberto

- Sem refresh token, a sessão morre em 1h sem aviso. O front ainda não trata 401 no
  meio do uso ([[web-auth-sessao]]).
- Sem rate limit no login. Bcrypt de 12 rounds é caro, então o endpoint é um alvo de
  exaustão de CPU.
- Não há troca esquecida nem recuperação de senha. Cadastro e alteração existem desde
  [[api-users-crud]] e [[api-token-denylist]].
