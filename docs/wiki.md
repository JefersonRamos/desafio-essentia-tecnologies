# Wiki mantido por LLM

Um wiki de markdown que um LLM escreve e mantém a partir das fontes que você lhe dá.
Neste repositório ele guarda as fontes, decisões e anotações do desafio.

A diferença para RAG: em RAG o LLM redescobre o conhecimento a cada pergunta —
recupera trechos, responde, esquece. Nada se acumula. Aqui o conhecimento é
compilado uma vez e mantido: quando uma fonte nova entra, o LLM lê, extrai e
**integra** ao que já existe — atualiza páginas de entidade, revisa sínteses, marca
onde o dado novo contradiz o antigo. As referências cruzadas já estão feitas, as
contradições já estão sinalizadas. O wiki fica mais rico a cada fonte e a cada
pergunta.

Obsidian de um lado, agente do outro: o LLM edita, você navega os links e o grafo em
tempo real. O Obsidian é a IDE, o LLM é o programador, o wiki é o código.

## Como funciona

Duas camadas:

| Camada | Onde | Quem escreve |
|---|---|---|
| **Wiki** | `wiki/` | o LLM, inteiramente. Fontes, entidades, conceitos, síntese. |
| **Schema** | `CLAUDE.md` | os dois. Define convenções e workflows. |

Não existe uma pasta de fontes brutas. A fonte chega como URL, arquivo, transcrição
ou texto colado, e a página em `wiki/sources/` vira o **registro canônico** dela:
proveniência no frontmatter, conteúdo destilado no corpo, citações precisas o
bastante para voltar ao original. Se a fonte sumir da internet, essa página é o que
resta.

O schema é a peça central: é o que transforma o LLM num mantenedor de wiki
disciplinado em vez de um chatbot genérico. Ele e você o coevoluem conforme
descobrem o que funciona no seu domínio.

```
wiki/
  overview.md   porta de entrada
  synthesis.md  tese evolutiva, tensões abertas, gaps
  index.md      catálogo de todas as páginas
  log.md        registro cronológico append-only
  sources/      uma página por fonte — o registro canônico dela
  entities/     pessoas, organizações, produtos, lugares
  concepts/     ideias, temas, mecanismos
  analyses/     respostas de query arquivadas
  assets/       imagens e anexos
CLAUDE.md       o schema
```

`index.md` é orientado a conteúdo — um catálogo com resumo de uma linha por página.
É o que o LLM lê primeiro numa pergunta, antes de abrir qualquer página. Funciona
surpreendentemente bem até algumas centenas de páginas, sem precisar de embeddings.

`log.md` é cronológico e append-only. Cabeçalho em formato fixo, então vira dado:

```bash
grep "^## \[" wiki/log.md | tail -5
```

## Operações

**Ingest.** Você manda uma fonte e pede para processar. O LLM lê, discute os
takeaways com você, escreve a página de fonte, propaga para as páginas de entidade e
conceito afetadas, revisa a síntese, atualiza o índice e registra no log. Uma fonte
boa toca 10–15 páginas. Ingerir uma de cada vez e ficar no circuito dá o melhor
resultado — mas dá para pedir lote com menos supervisão.

**Query.** Você pergunta contra o wiki. O LLM lê o índice, abre as páginas relevantes
e responde com citações. Quando a resposta tem valor durável, ela é arquivada em
`analyses/` — assim suas explorações compõem no wiki do mesmo jeito que as fontes.

**Lint.** De tempos em tempos, um health check: contradições, afirmações que uma fonte
nova já superou, páginas órfãs, links quebrados, conceitos citados sem página própria,
páginas de fonte magras demais, gaps. O LLM reporta e propõe; você aprova.

## Uso

Converse com o agente na raiz do repo:

```
"ingira https://exemplo.com/artigo"
"ingira esse pdf aqui: ~/Downloads/relatorio.pdf"
"o que as fontes dizem sobre X?"
"roda um lint no wiki"
```

Abra a raiz do repo como vault no Obsidian para navegar os wikilinks e o grafo.
O wiki é só um repo git de markdown — histórico, branch e diff saem de graça.

## Por que funciona

A parte cansativa de um wiki não é ler nem pensar — é a burocracia: atualizar
referência cruzada, manter resumo em dia, anotar quando um dado novo contradiz o
antigo, manter consistência entre dezenas de páginas. Humanos abandonam wikis porque
o custo de manutenção cresce mais rápido que o valor. O LLM não enjoa, não esquece de
atualizar um link e mexe em 15 arquivos numa passada. Sobra para você o que importa:
curar fontes, dirigir a análise, fazer as perguntas certas.
