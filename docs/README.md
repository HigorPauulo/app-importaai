# Documentação

Projeto Integrador · ADS1253 · PUC Goiás · 2026/2

Estado geral e cronograma em [`ROADMAP.md`](../ROADMAP.md).

`rascunho` pendente de aprovação · `aprovado` validado pela equipe

---

## 1 · Escopo

O documento de escopo exigido pelo norteador. **Em revisão.**

| | Documento | O que responde | Estado |
|:---:|---|---|:---:|
| A1 | [Domínio](01-escopo/dominio.md) | Que problema, de quem, e o que fica de fora | `rascunho` |
| A2 | [Personas](01-escopo/personas.md) | Quem usa e em que situação | `rascunho` |
| A3 | [Requisitos](01-escopo/requisitos.md) | O que o sistema faz e quais qualidades tem | `rascunho` |
| A4 | [Regras de negócio](01-escopo/regras-de-negocio.md) | Que condições o domínio impõe | `rascunho` |

---

## 2 · Modelagem

| | Documento | O que responde | Estado |
|:---:|---|---|:---:|
| A6 | [Modelagem de dados](02-modelagem/der.md) | Como o dado é estruturado e por quê | `rascunho` |
| A7 | Arquitetura | Como as camadas se organizam | pendente de D3 |
| A8 | ADRs | Que decisões foram tomadas, e o que foi descartado | pendente de D3 |

O diagrama em si nasce em ferramenta própria (draw.io) quando o escopo for aprovado. Este documento é o memorial que justifica o modelo.

---

## 3 · Interfaces

| | Documento | O que responde | Estado |
|:---:|---|---|:---:|
| A9 | [Navegação e telas](03-interfaces/navegacao.md) | Que telas existem e como se conectam | `rascunho` |
| A10 | Protótipo navegável | Como as telas se parecem e se comportam | pendente |
| A11 | Usabilidade e acessibilidade | Que decisões de interface foram tomadas | pendente |

---

## 4 · Gestão

| | Documento | O que responde | Estado |
|:---:|---|---|:---:|
| A12 | [Backlog](04-gestao/backlog.md) | O que será construído, em que ordem | `rascunho` |
| A14 | [Rastreabilidade](04-gestao/rastreabilidade.md) | Onde cada requisito é verificável | `rascunho` |
| A13 | Responsabilidades por ciclo | Quem faz o quê, por ciclo | pendente |

---

## 0 · Referência

[Documento Norteador](00-referencia/) e material da disciplina. **Em caso de divergência, o norteador prevalece.**

---

## Como esta documentação se organiza

**A ordem importa.** Cada bloco se apoia no anterior: escopo define modelagem, que define arquitetura. Documento escrito fora de ordem vira retrabalho quando o bloco anterior muda.

**Pasta nasce com o primeiro arquivo.** Não há pasta vazia esperando conteúdo futuro.

**Uma fonte de verdade por artefato.** O diagrama vive na ferramenta de diagrama; o markdown justifica as decisões que o diagrama não expressa, sem redesenhá-lo.

**Português na documentação, inglês no código.** Documento acadêmico tem banca brasileira; código segue convenção universal.
