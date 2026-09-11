# Rastreabilidade

`A14` · **rascunho** · 11/09/2026

> Liga cada requisito à regra que o governa, à entidade que o sustenta, à tela que o expõe, ao teste que o verifica e ao commit que o implementa.

| Resolve | Como |
|---|---|
| Apêndice C da N2 | Fornece a coluna "onde é verificável" |
| Requisito órfão | Expõe requisito sem implementação e implementação sem requisito |
| Arguição individual | Resposta imediata, por linha |
| Rubrica 8.3 | Sustenta o critério de consistência técnica |

**Higiene.** Requisito sem regra é operação de dado · regra sem teste é promessa · tela sem requisito é escopo que vazou · linha incompleta é trabalho pendente.

Estado: `[ ]` não iniciado · `[~]` em andamento · `[x]` concluído

---

## Requisitos

| RF | Regras | Entidades | Telas | Testes | Ciclo | Commit | |
|:---:|:---:|---|:---:|:---:|:---:|:---:|:---:|
| RF-01 | RN08 | users | T02 | CT-01, CT-02 | 1 | | `[ ]` |
| RF-02 | RN08 | users | T01 | CT-03 a CT-05 | 1 | | `[ ]` |
| RF-03 | RN08 | users | T09 | CT-06 | 1 | | `[ ]` |
| RF-04 | RN09 | purchases, stores | T05 | CT-07 a CT-09 | 2 | | `[ ]` |
| RF-05 | RN07 | purchases, exchange_rates | T04, T05, T06 | CT-10, CT-11 | 2 | | `[ ]` |
| RF-06 | RN01 | purchases, tracking_events | T04 | CT-12 | 2 | | `[ ]` |
| RF-07 | RN09 | purchases | T05 | CT-13, CT-14 | 2 | | `[ ]` |
| RF-08 | RN09 | purchases | T03, T04 | CT-15, CT-16 | 2 | | `[ ]` |
| RF-09 | - | stores, purchases | T07 | CT-17, CT-18 | 2 | | `[ ]` |
| RF-10 | RN01 | purchases, tracking_events | T03, T04 | CT-19 a CT-21 | 3 | | `[ ]` |
| RF-11 | RN01 | purchases | T03 | CT-22, CT-23 | 2 | | `[ ]` |
| RF-12 | RN02, RN03, RN06 | purchases, notifications | T03, T08 | CT-24 a CT-26 | 3 | | `[ ]` |
| RF-13 | RN04, RN06 | purchases, notifications | T04, T08 | CT-27, CT-28 | 3 | | `[ ]` |
| RF-14 | RN01, RN07 | purchases, exchange_rates | T06 | CT-29, CT-30 | 4 | | `[ ]` |
| RF-15 | RN02 | purchases, stores | T06 | CT-31 | 4 | | `[ ]` |
| RF-16 | - | todas (local) | T03, T04 | CT-32 a CT-34 | 3 | | `[ ]` |
| RF-17 | RN06 | notifications | T08 | CT-35 | 3 | | `[ ]` |
| RF-18 | RN08 | users | T10 | CT-36, CT-37 | 4 | | `[ ]` |
| RF-19 | RN03 | purchases | T11 | CT-38 | 4 | | `[ ]` |

---

## Regras

Regra órfã é regra que não será implementada.

| Regra | Requisitos | Testes | |
|---|---|:---:|:---:|
| RN01 · Estado derivado | RF-06, RF-10, RF-11, RF-14 | CT-12, CT-21 | `[ ]` |
| RN02 · Atraso | RF-12, RF-15 | CT-24, CT-31 | `[ ]` |
| RN03 · Estagnação | RF-12, RF-19 | CT-25, CT-38 | `[ ]` |
| RN04 · Taxa com prazo | RF-13 | CT-27, CT-28 | `[ ]` |
| RN05 · Janela de reclamação | RF-12 | CT-26 | `[ ]` |
| RN06 · Idempotência | RF-12, RF-13, RF-17 | CT-35 | `[ ]` |
| RN07 · Conversão pela data | RF-05, RF-14 | CT-10, CT-11, CT-29 | `[ ]` |
| RN08 · Isolamento | RF-01, RF-02, RF-03, RF-18 | CT-05, CT-36, CT-37 | `[ ]` |
| RN09 · Imutabilidade | RF-04, RF-07, RF-08 | CT-14, CT-16 | `[ ]` |

---

## Requisitos do norteador

| Req | Atendido por | Verificável em | |
|:---:|---|---|:---:|
| R1 | T01 a T11 | A9 | `[ ]` |
| R2 | RN08, RF-02, RF-18, RF-19 | A4, A9 | `[ ]` |
| R3 | RF-04, RF-06, RF-07, RF-08 · RF-09 | A3, A6 | `[ ]` |
| R4 | RN01 a RN09 | A4 | `[ ]` |
| R5 | RF-16, RNF-05 | A6 §6 | `[ ]` |
| R6 | RF-10, RNF-06 | A7 | `[ ]` |
| R7 | RF-10, RF-05 | A7, A8 | `[ ]` |
| R8 | RF-12, RF-13, RF-17 | A9 | `[ ]` |
| R9 | RF-11, RF-14 | A9 | `[ ]` |
| R10 | RNF-03, RNF-06 | A9 §3 | `[ ]` |
| R11 | RNF-03, RNF-04, US-31, US-32 | A11 | `[ ]` |
| R12 | RNF-02, RNF-08 | A7 | `[ ]` |
| R13 | ROADMAP §9, A18 | repositório | `[~]` |
| R14 | RNF-07, US-33 | A20 | `[ ]` |

---

## Lacunas

Registro honesto do que não tem lastro. A ausência desta seção transforma a matriz em documento decorativo.

| Lacuna | Impacto | Prazo |
|---|---|:---:|
| CT-01 a CT-38 não redigidos | A14 não é verificável sem A15 | Ciclo 2 |
| A7 e A8 pendentes de **D3** | R6, R7 e R12 sem localização | Fase 5 |
| A10 pendente | R1 e R11 sem evidência visual | Checkpoint 1 |
| Coluna de commit vazia | Esperado antes do Ciclo 1 | Ciclo 1 |
| Fonte de rastreio não escolhida | RF-10 sem contrato de integração | Ciclo 2 |

---

[← Backlog](backlog.md) · [Índice](../README.md)
