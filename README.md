# TechX To-Do List

Aplicação full-stack de gerenciamento de tarefas — Desafio Técnico Essentia
Technologies (TechX).

Front em Angular, API em Express + TypeScript, MySQL para os dados da aplicação e
MongoDB para os logs de requisição, tudo atrás de um nginx que é o único ponto
público. A stack inteira sobe com dois comandos: não é preciso ter Node, Angular
CLI, MySQL ou Mongo instalados na máquina — só Docker.

| | |
| --- | --- |
| Repositório | `github.com/JefersonRamos/desafio-essentia-tecnologies` |
| Aplicação (local) | <http://localhost:8080> |
| API (local) | <http://localhost:8080/api> |
| Health do proxy | <http://localhost:8080/nginx-health> |

> **Status:** a infraestrutura Docker está completa e a stack sobe inteira. O front
> Angular está em andamento e a API ainda não tem código — veja
> [Estado da entrega](#estado-da-entrega). Este README documenta o que existe hoje;
> nada aqui descreve funcionalidade que ainda não foi escrita.

## Sumário

- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Quick Start](#quick-start)
- [Desenvolvimento](#desenvolvimento)
- [Produção](#produção)
- [Docker](#docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Estado da entrega](#estado-da-entrega)
- [Problemas comuns](#problemas-comuns)
- [Documentação adicional](#documentação-adicional)

## Arquitetura

```
                          ┌───────────────────────────────┐
   navegador ──── :8080 ──│  nginx  (único ponto público) │
                          └───────────┬───────────────────┘
                              /       │       /api/
                              ▼       │       ▼
                    ┌──────────────┐  │  ┌──────────────────────┐
                    │ web (Angular)│  │  │ api (Express + TS)   │
                    └──────────────┘  │  └───────┬──────────────┘
                                      │          │
                     rede: frontend ──┘          │  rede: backend
                                                 ▼
                                    ┌────────────┴────────────┐
                                    ▼                         ▼
                            ┌──────────────┐         ┌────────────────┐
                            │ mysql (dados)│         │ mongo  (logs)  │
                            └──────────────┘         └────────────────┘
```

| Decisão | Escolha | Motivo |
| --- | --- | --- |
| Borda | nginx como único container publicado | front e API na mesma origem — sem CORS no navegador |
| Redes | `frontend` e `backend` separadas | o front não alcança os bancos; todo acesso a dado passa pela API |
| Dual DB | MySQL (dados) + MongoDB (logs) | dado estruturado no relacional, log de requisição sem schema fixo |
| Compose | dois arquivos independentes, sem override | cada ambiente é legível de cima a baixo, sem merge implícito |
| Dev | bind-mount do código + hot reload | editar no host reflete no container sem rebuild |

Racional completo da infraestrutura em [`docs/infra.md`](docs/infra.md).

## Tecnologias

**Frontend**

| Camada | Stack |
| --- | --- |
| SPA | Angular 21, TypeScript 5.9 |
| Estado | `@ngrx/signals` (signal store) |
| Estilo | Tailwind CSS 4 (via PostCSS) |
| Ícones | Font Awesome |
| Testes | Vitest |

**Backend**

| Camada | Stack |
| --- | --- |
| Runtime | Node.js 22, TypeScript |
| API | Express |
| SQL | MySQL 8.4 + Prisma |
| NoSQL | MongoDB 8 (logs de requisição) |
| Auth | JWT (`JWT_SECRET` / `JWT_EXPIRES_IN` já previstos no `.env`) |

**Infra**

nginx 1.27 · Docker Engine 24+ · Docker Compose v2

## Quick Start

### Pré-requisitos

| Requisito | Versão | Como verificar |
| --- | --- | --- |
| Docker Engine | 24+ | `docker --version` |
| Docker Compose | v2 (`docker compose`, sem hífen) | `docker compose version` |
| git | qualquer | `git --version` |

No Windows, use o Docker Desktop com **WSL Integration** habilitada para a sua
distro (*Settings → Resources → WSL Integration*) e rode os comandos de dentro do
WSL, não do PowerShell — o bind-mount do código depende disso para o hot reload
funcionar.

As portas `8080` (aplicação), `3306` (MySQL) e `27017` (Mongo) precisam estar livres
no host. Se alguma estiver ocupada, veja [Problemas comuns](#problemas-comuns).

### 1. Clone o repositório

```bash
git clone git@github.com:JefersonRamos/desafio-essentia-tecnologies.git
cd desafio-essentia-tecnologies
```

### 2. Crie o arquivo de ambiente

```bash
# Linux / macOS / WSL / Git Bash
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

O `.env.example` já vem com valores de desenvolvimento que funcionam sem edição. O
`.env` não é versionado — para produção, troque as senhas e gere um segredo real
(`openssl rand -hex 32`).

### 3. Suba a stack

```bash
docker compose up -d --build
```

A primeira execução baixa as imagens base e instala as dependências do front dentro
do container; leva alguns minutos. As seguintes são quase instantâneas.

### 4. Verifique

```bash
docker compose ps                        # os 5 serviços em "Up"
curl http://localhost:8080/nginx-health  # responde: ok
```

Abra <http://localhost:8080>. A API responde em <http://localhost:8080/api>, no mesmo
host e origem do front.

## Desenvolvimento

O código de `web/` e `api/` é montado dentro dos containers, então editar um arquivo
no host recarrega a aplicação sem rebuild. Rebuild só é necessário quando muda o
`Dockerfile` ou as dependências.

```bash
docker compose logs -f api           # acompanha os logs de um serviço
docker compose ps                    # estado dos containers
docker compose restart api           # reinicia sem rebuild
docker compose up -d --build api     # rebuild de um serviço só
docker compose down                  # derruba, mantém os dados
docker compose down -v               # derruba e APAGA os volumes (zera os bancos)
```

Rodar comandos dentro dos containers:

```bash
docker compose exec api npm test         # suíte da API (vitest)
docker compose exec api npm run typecheck
docker compose exec web npm test
docker compose exec api npm run build
```

Acesso direto aos bancos — em dev eles publicam porta em `127.0.0.1`, então qualquer
GUI (DBeaver, TablePlus, Compass) conecta:

```bash
docker compose exec mysql mysql -utechx -p techx
docker compose exec mongo mongosh -u root -p --authenticationDatabase admin
```

Os containers têm nome fixo em dev (`techx-api`, `techx-web`, `techx-nginx`,
`techx-mysql`, `techx-mongo`), então `docker logs techx-api` também funciona.

## Produção

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

| | dev | prod |
| --- | --- | --- |
| build | stage `dev` | stage `prod` |
| código | bind-mount do host, com hot reload | copiado para dentro da imagem |
| front | `ng serve` | build estático servido por nginx |
| nginx | publicado na `8080` | publicado na `80` |
| senhas | default do `.env.example` | exigidas do `.env` |
| MySQL / Mongo | porta em `127.0.0.1` para GUIs | sem porta publicada |
| projeto | `techx` | `techx-prod` (volumes separados) |

Em produção as senhas **não têm default**: `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` e
`MONGO_ROOT_PASSWORD` precisam estar no `.env` ou os bancos falham no boot.

## Docker

| Serviço | Imagem / build | Porta no host | Rede |
| --- | --- | --- | --- |
| `nginx` | `nginx/` | `8080` | frontend |
| `web` | `web/` (stage `dev`) | — (interna `80`) | frontend |
| `api` | `api/` (stage `dev`) | — (interna `3000`) | frontend + backend |
| `mysql` | `mysql:8.4` | `127.0.0.1:3306` | backend |
| `mongo` | `mongo:8` | `127.0.0.1:27017` | backend |

Dentro da rede, `web` escuta na `80` e `api` na `3000` nos dois ambientes — por isso
o `nginx/default.conf` é um arquivo estático, igual em dev e prod.

Os dados dos bancos ficam em volumes nomeados (`mysql_data`, `mongo_data`) e
sobrevivem a `docker compose down`. Para zerar, `docker compose down -v`.

## Variáveis de ambiente

Todas ficam num único `.env` na raiz, a partir do `.env.example`.

| Variável | Default (dev) | Para que serve |
| --- | --- | --- |
| `NGINX_PORT` | `8080` | porta pública da stack |
| `API_PORT` | `3000` | porta da API dentro da rede |
| `MYSQL_DATABASE` / `MYSQL_USER` | `techx` | banco e usuário da aplicação |
| `MYSQL_PASSWORD` | `techx_secret` | senha do usuário da aplicação |
| `MYSQL_ROOT_PASSWORD` | `root_secret` | senha de root do MySQL |
| `MYSQL_HOST_PORT` | `3306` | porta no host, só em dev |
| `MONGO_ROOT_USERNAME` / `..._PASSWORD` | `root` / `root_secret` | credenciais do Mongo |
| `MONGO_DATABASE` | `techx_logs` | banco de logs |
| `MONGO_HOST_PORT` | `27017` | porta no host, só em dev |
| `LOG_RETENTION_DAYS` | `30` | retenção dos logs, aplicada pela API |
| `JWT_SECRET` | `dev_secret_change_me` | assinatura dos tokens — troque em produção |
| `JWT_EXPIRES_IN` | `1h` | expiração do token |

Nunca coloque `JWT_SECRET` no front — variáveis do Angular ficam expostas no bundle.

## Estrutura do repositório

```
docker-compose.yml        stack de desenvolvimento
docker-compose.prod.yml   stack de produção
.env.example              modelo de variáveis (copiar para .env)

nginx/
  Dockerfile
  default.conf            proxy de borda: / -> web:80, /api/ -> api:3000

api/
  Dockerfile              stages: dev | build | prod
  src/                    Express + TypeScript (Prisma em src/generated)

web/
  Dockerfile              stages: dev | build | prod
  nginx.conf              serve o Angular compilado (stage prod)
  src/app/
    core/http/            interceptors HTTP
    navigation/           componente de navegação
    task-card/            card de tarefa
    user/                 signal store e model do usuário

docs/
  infra.md                documentação da infraestrutura
  wiki.md                 o wiki mantido por LLM

wiki/                     fontes, decisões e anotações do desafio
CLAUDE.md                 schema do wiki
```

## Estado da entrega

| Requisito do desafio | Status |
| --- | --- |
| Docker + README com setup | ✅ stack de 5 containers, dev e prod |
| MySQL (dados principais) | ✅ container e credenciais prontos |
| MongoDB (metadados/logs extras) | ✅ container e credenciais prontos |
| Frontend Angular 14+ | 🚧 Angular 21 — navegação, task card e store de usuário |
| API REST Node.js + TypeScript | 🚧 Prisma client gerado; servidor a implementar |
| CRUD de tarefas + marcar concluída | 🚧 |
| JWT + autenticação | 🚧 variáveis e interceptor no lugar; fluxo a implementar |
| Commits incrementais | ✅ histórico por feature branch |

O container `techx-api` sobe e reinicia em loop até `api/package.json` e
`api/src/server.ts` existirem. O contrato que os Dockerfiles esperam de cada
aplicação — scripts de `package.json`, porta, retry de conexão, pasta de build do
Angular — está especificado em [`docs/infra.md`](docs/infra.md).

## Problemas comuns

**Porta já em uso.** Se a `8080` estiver ocupada, mude `NGINX_PORT` no `.env` e suba
de novo. Se você já tem MySQL ou Mongo rodando no host, mude `MYSQL_HOST_PORT` e
`MONGO_HOST_PORT` — só a porta do host muda, dentro da rede continua `3306`/`27017`.

**Mudei o `package.json` e a dependência nova não aparece.** As `node_modules` dos
containers ficam em volumes nomeados, que não são recriados por um rebuild comum:

```bash
docker compose down
docker volume rm techx_web_node_modules techx_api_node_modules
docker compose up -d --build
```

**Um container fica reiniciando.** `docker compose logs -f <serviço>` mostra o
motivo. Como todos usam `restart: unless-stopped`, uma falha no start vira loop de
reinício em vez de container parado.

**A API sobe antes dos bancos.** O `depends_on` garante ordem de start, não
readiness — a conexão inicial da API precisa de retry.

**`permission denied` no socket do Docker (Linux).** `sudo usermod -aG docker $USER`
e reabra o terminal.

**Quero começar do zero.** `docker compose down -v` derruba tudo e apaga os volumes,
incluindo os dados dos bancos.

## Documentação adicional

| Documento | Conteúdo |
| --- | --- |
| [`docs/infra.md`](docs/infra.md) | arquitetura Docker, redes, comparação dev/prod, contrato dos Dockerfiles |
| [`docs/wiki.md`](docs/wiki.md) | o wiki mantido por LLM: como funciona e como operar |
| [`CLAUDE.md`](CLAUDE.md) | schema do wiki — convenções e workflows |

---

Desenvolvido por Jeferson Ramos — Desafio Essentia Technologies / TechX.
