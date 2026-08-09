---
type: source
title: Denylist de token — logout que existe do lado do servidor
created: 2026-08-09
updated: 2026-08-09
tags: [api, auth, jwt, seguranca]
origin: api/src/auth/token.repo.ts, api/src/auth/token.cleanup.ts, api/src/auth/auth.service.ts
retrieved: 2026-08-09
published: 2026-08-09
author: Jeff
medium: código
commits: [dd1b6c2, 770b10f]
---

# Denylist de token — logout que existe do lado do servidor

Uma tabela `revoked_tokens` guarda o `jti` de cada token revogado até o `exp`
original. `requireAuth` consulta a tabela antes de aceitar qualquer requisição.

## Takeaways

**O `jti` virou obrigatório no payload.** Antes o token carregava `{ sub, email }`;
agora `signToken` gera um `jwtid` por emissão. Sem identificador por token não há o
que revogar — revogar por `sub` derrubaria todas as sessões do usuário.

**Revogar não invalida a assinatura.** O token continua criptograficamente válido e
continua decodificando; o que muda é que a API passa a recusá-lo com
`auth.token_revoked`. A verdade sobre a sessão saiu do token e foi para o banco.

**O custo é uma query a mais por requisição autenticada.** Somada à que já existia
([[api-auth-jwt]] registra que `requireAuth` chama `findById`), são duas idas ao
MySQL por request. A troca foi aceita pelo mesmo motivo da primeira: correção acima
de latência, com índice cobrindo as duas colunas consultadas.

**A tabela se limpa sozinha.** `startTokenCleanup` roda no boot e a cada hora, e
apaga as linhas cujo `expiresAt` já passou — depois do vencimento, a assinatura já
recusa o token e a linha vira lixo. O `setInterval` é `unref()`, então não segura o
processo no shutdown.

**Cadastro passou a devolver sessão.** `POST /api/auth/register` cria o usuário e já
responde `201 { token, user }`, em vez de exigir um login logo em seguida. A rota
saiu de `/api/users` para `/api/auth` porque o que ela devolve é sessão, não recurso.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Tabela | `revoked_tokens` (id, user_id, expires_at, revoked_at) | `prisma/schema.prisma` |
| Chave primária | o próprio `jti` do token | `token.repo.ts` |
| Índices | `user_id` e `expires_at` | migration `20260809021131` |
| Intervalo de limpeza | 1 hora, e uma vez no boot | `token.cleanup.ts:4` |
| Gravação | `upsert` — revogar duas vezes não quebra | `token.repo.ts` |
| Cascade | apagar o usuário apaga suas revogações | `schema.prisma` |

## Fluxo

```
POST /api/auth/logout   Authorization: Bearer <token>
  → requireAuth: verifyToken → isRevoked? → findById
  → revoke({ id: jti, userId: sub, expiresAt: exp })
  → 204

qualquer rota protegida com o mesmo token
  → requireAuth: isRevoked(jti) === true
  → 401 auth.token_revoked
```

## O que isto muda no wiki

Derruba a afirmação central de [[api-auth-jwt]] de que "não existe logout do lado do
servidor" e de que apagar o usuário era "a única forma de revogação que existe aqui".
As duas frases foram reescritas naquela página.

> [!warning] Contradição resolvida
> [[api-auth-jwt]] (2026-08-08) afirmava não haver blacklist nem sessão no servidor,
> e tratava isso como consequência aceita conscientemente. O commit `dd1b6c2`
> (2026-08-09) reverte a decisão e introduz a denylist. Resolvido em favor da fonte
> mais nova: **existe logout no servidor**. O que permanece verdadeiro da página
> antiga é o motivo original — só access token, sem refresh.

## Em aberto

- A denylist é consultada a cada request, mas nada mede o custo. Não há métrica.
- Um token roubado ainda vale até alguém chamar `/auth/logout` com ele. Não há
  "revogar todas as sessões" nem rota administrativa.
- Sem rate limit no login, o ponto levantado em [[api-auth-jwt]] segue de pé.
