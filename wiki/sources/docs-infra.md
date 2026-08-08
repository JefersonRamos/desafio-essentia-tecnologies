---
type: source
title: Infraestrutura Docker do desafio TechX
created: 2026-08-08
updated: 2026-08-08
tags: [infra, docker, nginx, redes]
origin: docs/infra.md, docker-compose.yml, docker-compose.prod.yml, nginx/, web/Dockerfile, api/Dockerfile
retrieved: 2026-08-08
published: 2026-08-07
author: Jeff
medium: código
commits: [7549e70]
---

# Infraestrutura Docker do desafio TechX

Cinco containers em Docker Compose: nginx na borda, front Angular, API Express, MySQL
para dados, MongoDB para logs. `docs/infra.md` é a documentação operacional; esta
página registra o porquê e o que já divergiu.

## Takeaways

**Isolamento é por rede, não por firewall.** Duas bridges: `frontend` e `backend`. O
serviço `web` está só na `frontend`, então **não alcança os bancos** — todo acesso a
dado passa pela API por construção topológica, não por convenção. `api` está nas
duas; os bancos, só na `backend`.

**O nginx é a única porta publicada.** O front chama `/api/...` na mesma origem, o
que elimina CORS do navegador inteiro. Não há configuração de CORS na API porque não
precisa haver.

**`nginx/default.conf` é estático em dev e prod.** Dentro da rede `web` sempre escuta
na 80 e `api` na 3000, nos dois ambientes. É o que permite um arquivo só, sem
template nem variável.

**Dev e prod são arquivos independentes, sem merge de override.** Cada compose
descreve os 5 serviços por inteiro. Mais repetição, menos surpresa.

**Produção não tem default de senha.** As três senhas (`MYSQL_ROOT_PASSWORD`,
`MYSQL_PASSWORD`, `MONGO_ROOT_PASSWORD`) não têm fallback no compose de produção: sem
`.env`, os containers de banco falham no boot. Mesma filosofia de
[[api-express-bootstrap]] — falhar alto em vez de subir inseguro.

**Os Dockerfiles declaram contrato para aplicações que ainda não existiam.** A infra
foi commitada primeiro (`7549e70`, "Hello World (Infraestrutura)"), exigindo scripts
`dev`/`build`/`start` no `package.json` e caminhos de build específicos. A API cumpriu
o contrato; o front não — ver contradições.

## Dados citáveis

| Item | Valor |
|---|---|
| Porta pública dev / prod | 8080 / 80 |
| Projeto compose | `techx` (dev), `techx-prod` (prod) |
| MySQL | 8.4, utf8mb4 / utf8mb4_unicode_ci |
| MongoDB | 8 |
| Node (imagens) | `node:22-alpine` |
| Volumes de dados | `mysql_data`, `mongo_data` |
| Volumes de deps | `web_node_modules`, `api_node_modules` |
| Containers dev | `techx-nginx`, `techx-web`, `techx-api`, `techx-mysql`, `techx-mongo` |
| Portas de banco em dev | ligadas a `127.0.0.1`, para GUIs |
| Portas de banco em prod | nenhuma |

## O padrão de `node_modules` em volume nomeado

Os dois serviços de aplicação montam o código do host (`./api:/app`) **e** um volume
nomeado por cima de `/app/node_modules`. Sem o segundo, o bind-mount do host apagaria
as dependências instaladas na imagem.

A consequência não está escrita em `docs/infra.md` e custou caro três vezes: **o
volume tem precedência sobre a imagem**. Rebuildar com `--build` reinstala dentro da
imagem e o volume antigo continua sombreando o resultado. Instalar dependência exige:

```bash
docker compose exec <svc> npm install <pkg>   # instala no volume, não na imagem
docker compose restart <svc>                  # o watcher já rodando não vê o pacote novo
```

Instalar do host tampouco funciona: `api/node_modules` é um diretório vazio criado
pelo Docker e pertencente a root. Mesma raiz: pastas geradas pelo container (uma
migration recém-criada, por exemplo) chegam ao host como root e não são editáveis
pelo usuário. Ver [[node-modules-em-volume-nomeado]].

## O que isto muda no wiki

É a fonte-raiz do projeto: define as restrições topológicas que [[techx-api]] e
[[techx-web]] herdam, e explica por que não há CORS nem configuração de host em
lugar nenhum.

> [!warning] Contradição
> `docs/infra.md` descreve `web/` como projeto Angular com `npm start` e build em
> `dist/web/browser`. Em 2026-08-08 não existe `angular.json`, `package.json` nem
> `src/` em `web/` — `git ls-files web` devolve 4 arquivos, todos de infra. O
> container `techx-web` está em loop de restart com `ENOENT: /app/package.json`. Não
> resolvido.

> [!warning] Contradição
> `web/Dockerfile:26` copia `dist/web/browser`; o único build presente no disco é
> `dist/code/browser`, porque o projeto Angular se chamava `code`. O stage `prod` do
> front quebraria mesmo com o código no lugar. Não resolvido.

## Em aberto

- `depends_on` garante ordem de start, não readiness. `docs/infra.md` diz que a API
  precisa tolerar banco indisponível e ter retry na conexão inicial; hoje só o Mongo
  tolera ([[api-audit-mongo]]) — o Prisma não tem retry explícito.
- `/api/health` não checa banco nenhum ([[api-express-bootstrap]]), então não serve
  como readiness probe apesar do nome.
- Nenhum healthcheck declarado no compose.
