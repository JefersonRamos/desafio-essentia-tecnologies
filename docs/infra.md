# Desafio TechX — infraestrutura Docker

Stack de 5 containers orquestrada por Docker Compose: um nginx na borda, o front em
Angular, uma API em Express + TypeScript e dois bancos — MySQL para os dados da
aplicação e MongoDB para os logs de requisição.

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

São duas redes bridge. `web` está só na `frontend`, então **não alcança os bancos** —
todo acesso a dado passa pela API. Os bancos ficam só na `backend`.

O nginx é a única porta publicada: o front chama `/api/...` no mesmo host e origem,
sem CORS no navegador.

Dentro da rede, `web` escuta na `80` e `api` na `3000` nos dois ambientes — por isso
o `nginx/default.conf` é um arquivo estático, igual em dev e prod.

## Pré-requisitos

- Docker Engine 24+ e Docker Compose v2 (`docker compose`, sem hífen)
- No Windows: Docker Desktop com WSL Integration habilitada para a distro

## Como rodar

```bash
cp .env.example .env
docker compose up -d --build
```

Front em <http://localhost:8080> e API em <http://localhost:8080/api>.

Produção:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Os dois arquivos são independentes — cada um descreve os 5 serviços por inteiro,
sem merge de override.

|                | dev                                  | prod                              |
| -------------- | ------------------------------------ | --------------------------------- |
| build          | stage `dev`                          | stage `prod`                      |
| código         | bind-mount do host, com hot reload   | copiado para dentro da imagem     |
| front          | `ng serve`                           | build estático servido por nginx  |
| nginx          | publicado na `8080`                  | publicado na `80`                 |
| senhas         | default do `.env.example`            | exigidas do `.env`                |
| MySQL / Mongo  | porta em `127.0.0.1` para GUIs       | sem porta publicada               |
| projeto        | `techx`                              | `techx-prod` (volumes separados)  |

## Estrutura

```
docker-compose.yml        stack de desenvolvimento
docker-compose.prod.yml   stack de produção
.env.example              modelo de variáveis (copiar para .env)

nginx/
  Dockerfile
  default.conf            proxy de borda: / -> web:80, /api/ -> api:3000

api/
  Dockerfile              stages: dev | build | prod
  .dockerignore

web/
  Dockerfile              stages: dev | build | prod
  nginx.conf              serve o Angular compilado (usado no stage prod)
  .dockerignore
```

Os dados dos bancos ficam em volumes nomeados (`mysql_data`, `mongo_data`), então
sobrevivem a `docker compose down`. Para zerar, `docker compose down -v`.

## Variáveis de ambiente

| Variável                                | Default          | Para que serve                          |
| --------------------------------------- | ---------------- | --------------------------------------- |
| `NGINX_PORT`                            | `8080` (dev)     | porta pública da stack                  |
| `API_PORT`                              | `3000`           | porta da API dentro da rede             |
| `MYSQL_DATABASE` / `MYSQL_USER`         | `techx`          | banco e usuário da aplicação            |
| `MYSQL_PASSWORD`                        | `techx_secret`   | senha do usuário da aplicação           |
| `MYSQL_ROOT_PASSWORD`                   | `root_secret`    | senha de root do MySQL                  |
| `MYSQL_HOST_PORT`                       | `3306`           | porta no host, só em dev                |
| `MONGO_ROOT_USERNAME` / `..._PASSWORD`  | `root` / `root_secret` | credenciais do Mongo              |
| `MONGO_DATABASE`                        | `techx_logs`     | banco de logs                           |
| `MONGO_HOST_PORT`                       | `27017`          | porta no host, só em dev                |
| `LOG_RETENTION_DAYS`                    | `60`             | retenção dos logs, aplicada pela API    |

Em produção as três senhas não têm default: precisam estar no `.env` ou os
containers de banco falham no boot.

## O que os Dockerfiles esperam das aplicações

**`api/`** — `package.json` com os scripts:

| script  | comando esperado          | usado em      |
| ------- | ------------------------- | ------------- |
| `dev`   | watch do TypeScript       | stage `dev`   |
| `build` | compila para `dist/`      | stage `build` |
| `start` | `node dist/server.js`     | stage `prod`  |

O servidor deve escutar na porta `3000` (`process.env.PORT`) e tolerar os bancos
ainda não estarem prontos — o `depends_on` garante ordem de start, não readiness.
A conexão inicial precisa de retry.

**`web/`** — projeto Angular com `npm start` = `ng serve` e `npm run build` gerando
`dist/web/browser` (padrão do builder `@angular/build:application`). O stage `prod`
copia essa pasta para dentro do nginx.

## Comandos úteis

```bash
docker compose logs -f api           # logs de um serviço
docker compose ps                    # estado dos containers
docker compose restart api           # reinicia sem rebuild
docker compose up -d --build api     # rebuild de um serviço só
docker compose down                  # derruba, mantém os dados
docker compose down -v               # derruba e APAGA os volumes

docker compose exec mysql mysql -utechx -p techx
docker compose exec mongo mongosh -u root -p --authenticationDatabase admin
```

Em dev os containers têm nome fixo (`techx-api`, `techx-web`, `techx-nginx`,
`techx-mysql`, `techx-mongo`), então `docker logs techx-api` também funciona.
