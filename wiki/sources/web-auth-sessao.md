---
type: source
title: Autenticação no Angular — rotas, sessão e guarda
created: 2026-08-09
updated: 2026-08-09
tags: [web, angular, auth, sessao]
origin: web/src/app/auth/, web/src/app/login/, web/src/app/register/
retrieved: 2026-08-09
published: 2026-08-09
author: Jeff
medium: código
commits: [a6bce07, 3956952]
---

# Autenticação no Angular — rotas, sessão e guarda

O front tinha `routes = []`, nenhum `HttpClient` provido e um interceptor que só
repassava a requisição. Login e cadastro obrigaram a montar o roteamento inteiro.

## Takeaways

**O board saiu do `app.html`.** O shell renderizava a barra lateral e os cards
direto, então qualquer rota nova apareceria embaixo deles. O markup foi extraído para
um componente `board` e o `app.html` virou só `<router-outlet />`.

**A sessão inteira mora em `localStorage`.** Token e perfil sob a chave
`techx.session`. O `UserStore` hidrata a partir dela na inicialização — sem isso, um
F5 deslogava. É o vetor XSS que [[api-auth-jwt]] já previa ao escolher Bearer em vez
de cookie; a escolha foi mantida com o custo conhecido.

**A guarda existe para as rotas serem alcançáveis.** Sem `authGuard` em `/`, quem
abrisse a aplicação cairia no board e nunca veria a tela de login, porque não há link
para ela em lugar nenhum.

**O interceptor deixou de ser stub quando o logout precisou dele.** Anexar o Bearer
só passou a ser necessário quando surgiu a primeira chamada autenticada de verdade: o
`POST /api/auth/logout` de [[api-token-denylist]]. Sem o header, a API não sabe qual
`jti` revogar.

**A limpeza local acontece mesmo se a API recusar.** `signOut` chama a API, mas o
`catchError` garante que sessão e stores sejam zerados de qualquer forma. Token já
expirado devolve 401, e travar o usuário logado por causa disso seria pior.

**O tema escuro é derivado dos tokens existentes.** Um único bloco
`:root[data-theme='dark']` redefine superfícies, linhas e texto; marca e cores
semânticas ficam. A especificidade `(0,2,0)` vence o `:root` do Tailwind sem depender
da ordem do arquivo. Aplicado no bootstrap por `provideAppInitializer`, para que
login e cadastro respeitem o tema mesmo sem o header na tela.

## Dados citáveis

| Item | Valor | Onde |
|---|---|---|
| Rotas | `/login`, `/register`, `/` (guardada) | `app.routes.ts` |
| Chave da sessão | `techx.session` | `auth/session-storage.ts` |
| Chave do tema | `techx.theme` | `core/theme/theme-storage.ts` |
| Validação | espelha a da API: nome ≥ 2, senha ≥ 8 | `login.ts`, `register.ts` |
| Erro exibido | o campo `error` da resposta, já traduzido | `core/http/api-error.ts` |

## Por que o erro da API é exibido cru

A API já negocia idioma por requisição ([[api-i18n]]) e devolve `error` traduzido. O
front mostra esse texto direto e só cai num genérico quando a requisição nem chega ao
servidor. Traduzir de novo no cliente criaria uma segunda tabela de mensagens para
dessincronizar.

## Verificação

O fluxo foi exercitado em navegador real: cadastro devolve 201 e redireciona; F5
mantém sessão e tema; "Sair" dispara `POST /api/auth/logout` com 204; e o token
antigo, reusado depois, responde 401 `auth.token_revoked`.

## O que isto muda no wiki

Derruba o gap de [[synthesis]] de que o front não existia e nunca fora versionado — o
projeto Angular está no repositório e roda. Fecha em parte a tensão de [[docs-infra]]
sobre o front ausente.

## Em aberto

- Nada trata 401 de token expirado durante o uso: a chamada falha e a tela mostra o
  erro, sem redirecionar para o login.
- `AuthService.signOut()` existe e nada além do menu de conta o chama.
- Não há teste de comportamento — os specs verificam que o componente instancia.
