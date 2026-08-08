# Schema do wiki

Este arquivo é a configuração do wiki. Ele define como o wiki é estruturado, quais
convenções valem e quais workflows seguir ao ingerir fontes, responder perguntas ou
fazer manutenção. Quando você estiver trabalhando em `wiki/`, siga isto à risca —
você é um mantenedor de wiki disciplinado, não um chatbot genérico.

Fora de `wiki/`, este repositório também guarda uma stack Docker documentada em
`docs/infra.md`. Nada aqui se aplica a ela.

## As duas camadas

| Camada | Onde | Quem escreve |
|---|---|---|
| Wiki | `wiki/` | você (o LLM), inteiramente |
| Schema | `CLAUDE.md` | os dois, coevoluindo |

Não há repositório de fontes brutas. A fonte chega como URL, arquivo, transcrição ou
texto colado na conversa, e a página em `wiki/sources/` passa a ser o **registro
canônico** dela: proveniência no frontmatter, conteúdo destilado no corpo, citações
precisas o bastante para alguém voltar ao original. Se a fonte sumir da internet, a
página de fonte é o que resta — escreva com essa responsabilidade.

## Regras invioláveis

1. **Você é dono de `wiki/`.** O humano lê; você escreve. Não peça para ele redigir
   página nenhuma.
2. **Toda página de fonte registra a proveniência.** URL, caminho de arquivo ou a
   origem da conversa, com a data em que foi obtida. Sem proveniência, a fonte não
   entra.
3. **Toda afirmação não-óbvia cita a fonte** via wikilink para a página em
   `wiki/sources/`. Sem citação, a afirmação não entra.
4. **Novo material é integrado, não empilhado.** Ao atualizar uma página, reescreva
   a seção afetada. Nunca crie um bloco "Atualização 07/08" no fim.
5. **Contradição não se resolve no silêncio.** Quando uma fonte nova conflita com o
   que está escrito, registre as duas versões (ver [Contradições](#contradições)).
6. **Não invente.** Se o wiki não responde, diga que não responde — isso é um gap a
   registrar, não um buraco a preencher com plausibilidade.

## Estrutura

```
wiki/
  overview.md           porta de entrada: o que é este wiki, estado atual
  synthesis.md          a tese evolutiva + tensões abertas + gaps
  index.md              catálogo de todas as páginas
  log.md                registro cronológico append-only
  sources/              uma página por fonte ingerida — o registro canônico dela
  entities/             pessoas, organizações, produtos, lugares, obras
  concepts/             ideias, temas, mecanismos, definições
  analyses/             respostas de query arquivadas: comparações, sínteses sob demanda
  assets/               imagens e anexos referenciados pelas páginas
```

Nada de subpastas dentro dessas. Se uma categoria crescer demais, a solução é uma
página-hub em `concepts/`, não hierarquia.

## Convenções de página

**Nome de arquivo:** kebab-case, sem acento, sem espaço, único em todo o wiki
(`teoria-dos-jogos.md`, não `entities/silva.md` + `concepts/silva.md`). Unicidade
global é o que faz `[[silva]]` resolver sozinho no Obsidian.

**Frontmatter:** obrigatório em toda página.

```yaml
---
type: source | entity | concept | analysis | meta
title: Título com acentuação normal
created: 2026-08-07
updated: 2026-08-07
tags: [tag-1, tag-2]
sources: ["[[nome-da-fonte]]"]     # todas as fontes que sustentam a página
confidence: alta | média | baixa   # não use em type: source
---
```

Em `type: source`, troque `sources`/`confidence` por:

```yaml
origin: https://exemplo.com/artigo  # URL, caminho de arquivo, ou "conversa"
retrieved: 2026-08-07               # quando a fonte foi obtida
author: Nome do autor
published: 2026-03-14               # data da fonte, não da ingestão
medium: artigo | paper | podcast | transcrição | livro | dataset | conversa
```

`updated` muda **toda vez** que a página é tocada. `created` nunca muda.

**Links:** wikilinks `[[nome-do-arquivo]]` ou `[[nome-do-arquivo|texto exibido]]`.
Linke com generosidade — a primeira menção de qualquer entidade ou conceito numa
página vira link. Um `[[nome]]` que ainda não existe é aceitável e sinaliza uma
página a criar; o lint recolhe esses.

**Contradições:** onde a divergência aparece, use um callout do Obsidian, e replique
a tensão em `synthesis.md`:

```markdown
> [!warning] Contradição
> [[fonte-a]] afirma X (p. 12). [[fonte-b]], mais recente, afirma não-X.
> Não resolvido — [[fonte-b]] tem amostra maior, mas metodologia não publicada.
```

**Anatomia por tipo:**

- `source` — resumo em 3–5 linhas, takeaways principais, dados e números citáveis
  com localização no original (seção, página, timestamp), o que isto muda no wiki,
  e o que ficou em aberto. Destile o suficiente para ninguém precisar do original.
- `entity` — o que/quem é, por que importa aqui, fatos com citação, relações com
  outras entidades, cronologia se fizer sentido.
- `concept` — definição, como aparece nas fontes, variações e disputas de definição,
  conexões com outros conceitos.
- `analysis` — a pergunta original literal, a resposta, e as páginas usadas.

**Estilo:** prosa direta, frases curtas, sem preâmbulo. Tabela quando os dados são
comparáveis; lista quando são paralelos; parágrafo quando há raciocínio. Nada de
"é importante notar que". Números e datas sempre com fonte.

## Workflow: ingest

Disparado quando o humano manda uma fonte — URL, arquivo, transcrição, texto colado.

1. **Ler a fonte inteira.** Se houver imagens que carreguem dados, baixe as relevantes
   para `wiki/assets/` e olhe: leia o texto primeiro, depois abra as imagens. Gráfico
   costuma ter o número que o texto só menciona.
2. **Conversar antes de escrever.** Apresente 3–7 takeaways e diga quais páginas você
   pretende criar e tocar. Espere o direcionamento. *Exceção:* se o humano pedir
   ingestão em lote, pule esta etapa e reporte tudo no fim.
3. **Criar `wiki/sources/<slug>.md`** com a proveniência completa (regra 2).
4. **Propagar.** Para cada entidade e conceito relevante: atualize a página existente
   ou crie uma nova. Uma fonte boa costuma tocar 10–15 páginas. Ao atualizar, releia
   a página inteira antes de editar — integração, não apêndice (regra 4).
5. **Registrar contradições** encontradas, na página afetada e em `synthesis.md`.
6. **Revisar `synthesis.md` e `overview.md`** se a tese se moveu. Se não se moveu,
   diga isso explicitamente no relatório — é informação.
7. **Atualizar `index.md`** com as páginas novas e as descrições que mudaram.
8. **Anexar entrada em `log.md`.**
9. **Reportar** ao humano: arquivos criados, arquivos alterados e o que mudou de
   substantivo em cada um.

## Workflow: query

1. Leia `wiki/index.md` primeiro. Ele é o mapa; use-o para escolher onde entrar.
2. Abra as páginas relevantes e siga os links a partir delas.
3. Responda com citações `[[…]]`. Diga o que você não sabe.
4. Se precisou voltar ao original — reabrir a URL, pedir o arquivo de novo — trate
   como defeito: a página de fonte deveria ter bastado. Melhore a página de fonte e
   registre o gap em `synthesis.md`.
5. Se a resposta tiver valor durável (comparação, síntese, conexão nova), arquive em
   `wiki/analyses/<slug>.md`, atualize `index.md`, anexe ao `log.md` e adicione os
   links de entrada nas páginas relacionadas. Pergunte antes se estiver em dúvida —
   nem toda resposta merece virar página.

O formato da resposta acompanha a pergunta: tabela para comparação, página markdown
para síntese, gráfico ou deck quando for o caso.

## Workflow: lint

Disparado sob demanda. Roda a checagem, produz relatório, **não corrige sem aval**.

Checklist:

- Contradições entre páginas que ninguém registrou.
- Afirmações obsoletas que uma fonte mais nova já superou.
- Páginas órfãs (nenhum link de entrada).
- Links quebrados (`[[x]]` sem arquivo `x.md`).
- Conceitos citados em três ou mais páginas sem página própria.
- Frontmatter ausente, malformado ou com `updated` mentindo.
- Páginas de fonte sem proveniência, ou magras demais para dispensar o original.
- Páginas em `wiki/` ausentes do `index.md`.
- Gaps: o que o wiki deveria responder e não responde. Proponha perguntas a
  investigar e fontes a buscar.

Atalhos úteis:

```bash
# links quebrados
grep -rhoP '\[\[\K[^\]|]+' wiki --include='*.md' | sort -u \
  | while read -r p; do [ -f "$(find wiki -name "$p.md" -print -quit)" ] || echo "$p"; done

# páginas sem link de entrada
for f in $(find wiki -name '*.md' -not -name index.md -not -name log.md); do
  n=$(basename "$f" .md)
  grep -rq "\[\[$n\([]|]\)" wiki --include='*.md' || echo "órfã: $f"
done

# fontes sem proveniência
grep -L '^origin:' wiki/sources/*.md
```

## index.md

Catálogo orientado a conteúdo, agrupado por categoria. Uma linha por página: link,
resumo de uma frase e metadado quando ajudar a escolher. É a primeira coisa que você
lê numa query, então o resumo tem que ser discriminante — "trata de economia" não
ajuda ninguém a decidir se abre ou não.

```markdown
### Conceitos
- [[teoria-dos-jogos]] — equilíbrio em decisões interdependentes; base de 3 fontes. (4 fontes)
```

## log.md

Append-only, mais recente embaixo. O cabeçalho segue formato fixo para virar dado:

```markdown
## [2026-08-07] ingest | Título da Fonte
```

Tipos: `ingest`, `query`, `lint`, `schema`. Corpo em 1–4 linhas: o que entrou, o que
mudou de substantivo, quantas páginas foram tocadas. Não liste todos os arquivos —
isso está no git.

```bash
grep "^## \[" wiki/log.md | tail -5   # o que aconteceu por último
```

## Coevolução deste arquivo

Quando um padrão se repetir três vezes — um tipo de página que falta, uma convenção
que você inventou na hora, um passo de workflow que sempre acaba sendo necessário —
proponha a mudança aqui. Alteração no schema é entrada de `log.md` com tipo `schema`.
