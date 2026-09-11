# Roadmap

`Projeto Integrador` · ADS1253 · PUC Goiás · 2026/2

> Onde estou, o que vem depois, do que depende. Atualizar ao fim de cada ciclo. Em caso de divergência com o Documento Norteador, **o norteador prevalece**.

**Domínio.** Acompanhamento de compras internacionais, com rastreio integrado (A1).

**Entrega.** Aplicação móvel, APK em dispositivo físico.

**Peso.** 20,0 pts (PP1 até 4,0 na N1 · PP2 até 4,0 na N2).

**Docente.** Prof. Welington Júlio.

**Repositório.** a definir.

**Equipe.** a registrar.

[Estado](#1-estado) · [Artefatos](#2-artefatos) · [Requisitos](#3-requisitos-obrigatórios) · [Decisões](#4-decisões-em-aberto) · [Cronograma](#5-cronograma) · [Avaliação](#6-avaliação) · [Convenções](#7-convenções) · [Riscos](#8-riscos) · [Próximo passo](#9-próximo-passo)

---

## 1. Estado

```
 ▸ 1. Escopo ......................... A1, A2, A3, A4 em revisão   ← AQUI
   2. Modelagem e DER ............... A6 rascunho
   3. Protótipo e backlog ........... A9 rascunho · A10 pendente
   4. Arquitetura e pilha ........... bloqueado por D3 e D4
   5. Implementação em 4 ciclos
   6. Testes e usabilidade
   7. APK e dispositivo físico
```

> [!NOTE]
> Nada avança sem aprovação do bloco anterior. A pilha é escolhida na fase 4, **não antes**. Escolher framework antes de conhecer o problema molda o problema à ferramenta.

---

## 2. Artefatos

`[ ]` não iniciado · `[~]` rascunho, **pendente de aprovação** · `[x]` aprovado · `[!]` bloqueado

| | Artefato | Arquivo | Dep. | |
|:---:|---|---|:---:|:---:|
| A1 | Domínio | `docs/01-escopo/dominio.md` | | `[~]` |
| A2 | Personas | `docs/01-escopo/personas.md` | A1 | `[~]` |
| A3 | Requisitos | `docs/01-escopo/requisitos.md` | A1 | `[~]` |
| A4 | Regras de negócio | `docs/01-escopo/regras-de-negocio.md` | A3 | `[~]` |
| A12 | Backlog | `docs/04-gestao/backlog.md` | A3 | `[~]` |
| A6 | DER e modelagem | `docs/02-modelagem/der.md` | A4 | `[~]` rascunho, diagramas removidos |
| A9 | Navegação e telas | `docs/03-interfaces/navegacao.md` | A3 | `[~]` |
| A14 | **Rastreabilidade** | `docs/04-gestao/rastreabilidade.md` | todos | `[~]` |
| A18 | README | `README.md` | A7 | `[~]` |
| A7 | Arquitetura | `docs/02-modelagem/arquitetura.md` | A6, D3 | `[!]` |
| A8 | ADRs | `docs/02-modelagem/decisoes/adr-NNN-*.md` | A7 | `[!]` |
| A10 | Protótipo navegável | `docs/03-interfaces/prototipo.md` | A9 | `[ ]` |
| A11 | Usabilidade e acessibilidade | `docs/03-interfaces/usabilidade.md` | A10 | `[ ]` |
| A13 | Responsabilidades por ciclo | `docs/04-gestao/responsabilidades.md` | A12 | `[ ]` |
| A15 | Roteiro de testes | `docs/05-qualidade/roteiro-de-testes.md` | A4 | `[ ]` |
| A16 | Sessões de usabilidade | `docs/05-qualidade/usabilidade-sessoes.md` | A10 | `[ ]` |
| A17 | Defeitos | `docs/05-qualidade/defeitos.md` | A15, A16 | `[ ]` |
| A5 | Documento de projeto (PDF, N1) | `docs/06-entregas/` | A1 a A4 | `[ ]` |
| A19 | Relatório final (PDF, N2) | `docs/06-entregas/` | todos | `[ ]` |
| A20 | Conformidade R1 a R14 | `docs/06-entregas/conformidade.md` | A14 | `[ ]` |
| A21 | Declaração de uso de IA | `docs/06-entregas/declaracao-ia.md` | | `[ ]` |
| A22 | Roteiro das apresentações | `docs/06-entregas/` | todos | `[ ]` |

> [!NOTE]
> **A14 é o artefato que quase toda equipe ignora.** Liga requisito, regra, entidade, tela, teste e commit. É o que a rubrica 8.3 chama de consistência técnica, e é barato construir agora, caríssimo reconstruir em novembro.

---

## 3. Requisitos obrigatórios

| | Requisito | Como atendemos | |
|:---:|---|---|:---:|
| **R1** | 6+ telas | T01 a T11, onze telas | `[ ]` |
| **R2** | 2 perfis | Comprador e Administrador (RN08) | `[ ]` |
| **R3** | CRUD em 2 entidades | `purchases` e `stores` | `[ ]` |
| **R4** | 3+ regras não triviais | RN01 a RN09, nove regras | `[ ]` |
| **R5** | Persistência local | Espelho local + fila de sincronização | `[ ]` |
| **R6** | Persistência remota | Backend, pendente de **D4** | `[ ]` |
| **R7** | API externa | Fonte de rastreio + cotação | `[ ]` |
| **R8** | Recurso nativo | Notificação do aparelho | `[ ]` |
| **R9** | Filtro e consolidado | RF-11 + RF-14 | `[ ]` |
| **R10** | Erros e estados | Quatro estados por tela (A9 §3) | `[ ]` |
| **R11** | Usabilidade | RNF-03, RNF-04 | `[ ]` |
| **R12** | Camadas e segredos | RNF-02, RNF-08 | `[ ]` |
| **R13** | Versionamento | §7 | `[~]` |
| **R14** | APK em aparelho | RNF-07, US-33 | `[ ]` |

> [!WARNING]
> **São pisos, não metas.** O professor é explícito: projeto com exatamente 6 telas e 2 entidades "tende a parecer raso". Superar com folga, sem inchar.

---

## 4. Decisões em aberto

Decisão tomada vira ADR em `docs/02-modelagem/decisoes/`, com contexto, alternativas, escolha e consequências. O Apêndice D.2 cobra **as alternativas descartadas**.

| | Decisão | Opções | Até |
|:---:|---|:---:|:---:|
| **D1** | Nome do projeto e do repositório | | 1º push |
| ~~D2~~ | ~~Recorte do domínio~~ | decidido, ver A1 | ✓ |
| **D3** | Pilha mobile | Kotlin+Compose · Flutter · React Native | fase 5 |
| **D4** | Persistência remota | API própria (Spring) · Supabase · Firebase | fase 5 |
| **D5** | Persistência local | decorre de D3 | fase 5 |
| **D6** | Fonte de rastreio (R7) | | Ciclo 2 |
| **D7** | Recurso nativo (R8) | notificação definida, confirmar com D3 | Ciclo 3 |

A Seção 4 do norteador exige justificar a pilha quanto a **custo, curva de aprendizado, adequação ao domínio e implicação arquitetural**. Sem ADR, esse ponto se perde.

---

## 5. Cronograma

### Marcos

| Data | Marco | |
|:---:|---|:---:|
| 14/08 | Registro das equipes | `[!]` vencido |
| 21/08 | Proposta de tema | `[!]` vencido |
| **11/09** | **Checkpoint 1** · escopo, protótipo, backlog, DER | hoje |
| 28/09 a 02/10 | **Entrega N1** · PP1, até 4,0 pts | |
| 06/11 | **Checkpoint 2** · beta com persistência e API | |
| 09 a 13/11 | Testes com 5+ usuários externos | |
| 27/11 | Congelamento de escopo | |
| 04/12 | Documentação final | |
| 07 a 11/12 | **Entrega N2** · PP2, até 4,0 pts | |

### Implementação

| Sem. | Período | Ciclo | Previsto |
|:---:|---|:---:|---|
| 7 | 14 a 18/09 | 1 | Camadas, navegação, autenticação |
| 8 | 21 a 25/09 | 1 | 1º módulo com persistência local |
| 9 | 28/09 a 02/10 | — | Entrega N1 |
| 10 | 05 a 09/10 | — | Devolutiva e replanejamento |
| 11 | 13 a 16/10 | 2 | CRUD com validação |
| 12 | 19 a 23/10 | 2 | Regras, filtros, consolidado |
| 13 | 26 a 30/10 | 3 | Backend e sincronização |
| 14 | 03 a 06/11 | 3 | API externa, recurso nativo, Checkpoint 2 |
| 15 | 09 a 13/11 | — | Testes funcionais e usabilidade |
| 16 | 16 a 19/11 | 4 | Defeitos, acessibilidade, erros |
| 17 | 23 a 27/11 | 4 | APK e instalação em aparelho |
| 18 | 30/11 a 04/12 | — | Relatório e README |

---

## 6. Avaliação

| N1 · 10,0 pts | | N2 · 10,0 pts | |
|---|:---:|---|:---:|
| Documento de projeto | 2,5 | Aplicação concluída, R1 a R14 | 3,5 |
| Modelagem e arquitetura | 1,5 | Qualidade técnica | 2,0 |
| Protótipo navegável | 2,0 | Testes e usabilidade | 1,5 |
| Aplicação parcial | 2,0 | Relatório e README | 1,5 |
| Gestão e versionamento | 1,0 | Mostra final e arguição | 1,5 |
| Apresentação | 1,0 | | |

```
N1 = P1 (4,0) + PP1 (4,0) + Ex1 (2,0)
N2 = P2 (4,0) + PP2 (4,0) + Ex2 (1,0) + AI (1,0)
MF = (N1 × 0,4) + (N2 × 0,6)        aprovação: MF >= 6,0 e frequência >= 75%
```

### Fator de Participação Individual

`nota individual = nota da equipe × FPI`, de **0,00 a 1,00**, atribuído pelo docente com base no **histórico de commits**, na distribuição de responsabilidades, nos checkpoints e na arguição.

> [!WARNING]
> App perfeito com commits concentrados em uma pessoa produz notas individuais baixas para o resto da equipe. Integrante omisso deve ser comunicado **até o checkpoint**: comunicação na entrega final não retroage.

---

## 7. Convenções

**Nomenclatura.** Documentação em português, código em inglês. Não misturar: `cadastrarPedido(orderId)` é o defeito que essa regra evita. Comentário explica o porquê, nunca o quê.

**Git.** `main` estável · `develop` integração · `feature/*` por funcionalidade. Integração por PR **revisado por outro integrante** (Seção 6.2). Commit atômico, em português, imperativo: `<tipo>(<escopo>): <descrição>`, até 72 caracteres. Tipos: feat, fix, docs, style, refactor, test, chore.

**Vedado.** Mensagem genérica · submissão concentrada perto da entrega · `.env` ou credencial versionada.

**Entregas.** PDF como `PI2026-2_NomeDaEquipe_Etapa.pdf`, até 23h59. Atraso custa 20% por dia, até 3 dias, depois zero. Endereço do repositório informado na 1ª entrega e **mantido inalterado**.

---

## 8. Riscos

| Risco | Por que é real | Mitigação |
|---|---|---|
| Inchaço de escopo | Tendência a replicar a complexidade de um projeto web anterior | Teste de corte: se o fluxo principal sobrevive sem o item, ele sai |
| Commits concentrados | Derruba o FPI de toda a equipe | Divisão por módulo desde o Ciclo 1, PR revisado por par |
| Pilha escolhida cedo | Molda o problema à ferramenta | D3 e D4 travadas até a fase 5 |
| Documentação no fim | Rastreabilidade não se reconstrói em novembro | A14 atualizada a cada ciclo |
| Só no emulador | R14 exige aparelho físico comprovado | Testar em aparelho desde o Ciclo 1 |
| **Fonte de rastreio inviável** | Agregadores cobram por consulta e a API dos Correios tem acesso restrito. R6, R7 e RN01 dependem inteiramente disso | Validar acesso e limite gratuito **antes do Ciclo 3**, com plano alternativo definido em ADR |
| **Sincronização bidirecional** | RF-16 (US-16 e US-17, 16 pontos) é o item tecnicamente mais difícil do projeto, e cai no ciclo mais carregado | Antecipar para o fim do Ciclo 2. Se atrasar, reduzir para leitura offline e cadastro em fila, sem edição offline |
| **148 pontos em 8 semanas** | O backlog não foi confrontado com a capacidade real da equipe | Medir velocidade no Ciclo 1 e recortar o Ciclo 4 com base nela, não na estimativa inicial |
| **Parâmetros sem apuração** | Os limiares de RN03 (15 dias) e RN05 (30 dias) são hipóteses, não medição | Calibrar com dado real antes do Ciclo 3, conforme marcado em A4 |
| Não saber defender o código | Seção 9.1: caracteriza ausência de autoria | Ler e entender cada artefato antes de cada checkpoint |

---

## 9. Próximo passo

**Bloqueantes, fora do controle técnico:**

1. **Registrar a equipe** (3 a 4 integrantes, com coordenador). Vencido em 14/08.
2. **Submeter a proposta de tema.** Vencido em 21/08. A1 já tem todo o conteúdo.

**Técnicos, em ordem:**

3. **A10**, protótipo navegável das onze telas de A9. Único item do Checkpoint 1 ainda ausente.
4. **A11**, memorial de usabilidade, decorrente de A10.
5. **D3 e D4**, com ADR. Previsto para a Semana 5, já em atraso.
6. **A15**, casos CT-01 a CT-38, já referenciados em A14.

**Checkpoint 1 de hoje:**

| Exigência | Artefato | |
|---|---|:---:|
| Escopo | A1, A3 | pronto |
| Backlog priorizado | A12 | pronto |
| DER | A6 | pronto |
| Protótipo navegável | A10 | **ausente** |
