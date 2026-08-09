---
type: concept
title: Remoção lógica
created: 2026-08-09
updated: 2026-08-09
tags: [dados, prisma, auditoria]
sources: ["[[api-users-crud]]", "[[api-tasks-crud]]", "[[api-prisma-mysql]]"]
confidence: alta
---

# Remoção lógica

Apagar é gravar `deleted_at`, não remover a linha. Toda consulta acrescenta
`deletedAt: null`, e o `DELETE` da API responde 204 sem que nada saia do banco.

## Como aparece nas fontes

A coluna nasceu em [[api-prisma-mysql]] e ficou inerte: [[synthesis]] registrou por
um tempo o gap de que `deletedAt` existia e **nenhum repositório filtrava por ela**.
[[api-users-crud]] fechou esse buraco, e [[api-tasks-crud]] já nasceu com o filtro.

Aplica-se a `users` e `tasks`. Não se aplica a `revoked_tokens`, que é a exceção
coerente: aquela tabela existe para ser podada, e [[api-token-denylist]] apaga linha
de verdade quando o token vence.

## Por que

O log de auditoria em [[api-audit-mongo]] guarda `entityId` de coisas que precisam
continuar existindo para o histórico fazer sentido. Remover fisicamente deixaria o
Mongo apontando para o vazio.

## O preço

- **O e-mail fica reservado para sempre.** O `@unique` não distingue linha viva de
  morta, então quem apagou a conta não consegue recadastrar o mesmo endereço.
  Registrado como pendência em [[api-users-crud]].
- **Não há rota de restauração.** Grava-se `deleted_at` e ninguém sabe desfazer pela
  API — o único "desfazer" que existe é o do front, que age antes da chamada sair
  ([[desfazer-por-adiamento]]).
- **A tabela só cresce.** Nada poda linhas antigas.

## Conexões

- [[posse-por-consulta]] — o mesmo `where` carrega as duas condições.
- [[api-audit-mongo]] — a razão de ser da escolha.
