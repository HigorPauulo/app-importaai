# Requisitos

`A3` · **rascunho** · 11/09/2026 · alimenta A4, A9, A12, A14

> 19 requisitos funcionais no escopo do MVP, 4 explicitamente fora desta versão, e 10 não funcionais. Prioridade MoSCoW: **M** obrigatório · **S** importante · **C** desejável · **W** fora desta versão.

Todo requisito **M** tem caso de teste em A15 e linha em A14. As colunas de regra e tela são preenchidas de propósito: requisito sem regra é operação de dado; requisito sem tela não é observável.

---

## Conta e acesso

| Id | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| **RF-01** | Criar conta com nome, e-mail único e senha | M | RN08 | T02 |
| **RF-02** | Autenticar com sessão por prazo. Cinco falhas bloqueiam temporariamente | M | RN08 | T01 |
| **RF-03** | Consultar e alterar os próprios dados, encerrar sessão | M | RN08 | T09 |

---

## Compras

| Id | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| **RF-04** | Cadastrar compra com produto, código, loja, datas, valor e moeda | M | RN09 | T05 |
| **RF-05** | Registrar valor na moeda de origem e apresentar também em BRL | M | RN07 | T04, T05, T06 |
| **RF-06** | Consultar detalhe com linha do tempo cronológica | M | RN01 | T04 |
| **RF-07** | Alterar compra, respeitada a imutabilidade da concluída | M | RN09 | T05 |
| **RF-08** | Excluir ou arquivar compra, mantendo histórico | M | RN09 | T03, T04 |
| **RF-09** | Manter lojas. Loja referenciada não pode ser excluída | M | - | T07 |

---

## Rastreio e alertas

| Id | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| **RF-10** | Obter e persistir eventos da fonte externa, sem duplicar | M | RN01 | T03, T04 |
| **RF-11** | Listar com busca, filtro por estado e ordenação | M | RN01 | T03 |
| **RF-12** | Identificar atraso e estagnação e notificar | M | RN02, RN03, RN06 | T03, T08 |
| **RF-13** | Registrar taxa e alertar na aproximação do vencimento | M | RN04, RN06 | T04, T08 |
| **RF-14** | Indicadores: compras por estado, valor em trânsito, entregue no período, taxas pagas | M | RN01, RN07 | T06 |
| **RF-15** | Desvio médio entre prazo prometido e real, por loja | S | RN02 | T06 |
| **RF-16** | Consultar sem conexão. Alterações aplicam na reconexão | M | - | T03, T04 |
| **RF-17** | Consultar histórico de alertas e marcar como lidos | M | RN06 | T08 |

---

## Administração

| Id | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| **RF-18** | Listar contas, bloquear e reativar, sem ver conteúdo de compra | M | RN08 | T10 |
| **RF-19** | Acompanhar saúde da integração: última sincronização, falhas, compras sem atualização | M | RN03 | T11 |

---

## Fora desta versão

| Id | Requisito | Razão | Prio |
|:---:|---|---|:---:|
| RF-20 | Compra com múltiplos pacotes | Corte C1 de A1 | W |
| RF-21 | Compartilhar acompanhamento | Corte C2 de A1 | W |
| RF-22 | Ler código por câmera | Depende de D3. Reavaliar no Ciclo 3 | C |
| RF-23 | Exportar histórico | Não apoia a decisão do fluxo principal | W |

---

## Requisitos não funcionais

| Id | Categoria | Requisito | Verificação |
|:---:|---|---|---|
| **RNF-01** | Desempenho | Listagem abre em 2s a partir do acervo local, em aparelho modesto | Medição no Ciclo 4 |
| **RNF-02** | Segurança | Senha com derivação e sal. Chaves em variável de ambiente, nunca versionadas | Inspeção do histórico |
| **RNF-03** | Usabilidade | Ação destrutiva confirma. Erro de campo aparece junto ao campo, com a razão | Sessões de A16 |
| **RNF-04** | Acessibilidade | Contraste WCAG AA (4.5:1), toque de 48dp, rótulo para leitor de tela | Leitor de tela nativo (A11) |
| **RNF-05** | Disponibilidade | Abre e consulta sem conexão, sinalizando a última sincronização | Teste em modo avião |
| **RNF-06** | Confiabilidade | Chamada externa com tempo limite. Falha não impede o uso local nem apaga dado obtido | Simulação de queda |
| **RNF-07** | Portabilidade | Android 10 (API 29) ou superior, em aparelho físico | Instalação (R14) |
| **RNF-08** | Manutenibilidade | Camadas de apresentação, negócio e persistência, com dependência só para dentro | Revisão e A7 |
| **RNF-09** | Privacidade | Coleta mínima. Nenhum perfil acessa conteúdo alheio | RN08 e revisão de rotas |
| **RNF-10** | Localização | Português do Brasil, moeda e data no formato local | Inspeção visual |

---

## Cobertura dos requisitos do norteador

| Req | Atendido por |
|---|---|
| **R1** · 6+ telas | T01 a T11 (A9) |
| **R2** · 2 perfis | RF-02, RF-18, RF-19, RN08 |
| **R3** · CRUD em 2 entidades | RF-04, RF-06, RF-07, RF-08 (compras) · RF-09 (lojas) |
| **R4** · 3+ regras | RN01 a RN09 (A4) |
| **R5** · Persistência local | RF-16, RNF-05 |
| **R6** · Persistência remota | RF-10, RNF-06 |
| **R7** · Integração externa | RF-10 (rastreio) · RF-05 (cotação) |
| **R8** · Recurso nativo | RF-12, RF-13, RF-17 (notificação) |
| **R9** · Filtro e consolidado | RF-11 · RF-14 |
| **R10** · Erros e estados | RNF-03, RNF-06, A9 §3 |
| **R11** · Usabilidade | RNF-03, RNF-04 |
| **R12** · Camadas e segredos | RNF-02, RNF-08 |
| **R13** · Versionamento | ROADMAP §9 |
| **R14** · Distribuição | RNF-07 |

Os catorze têm lastro. A conformidade com localização no repositório é consolidada em **A20**, na N2.

---

[← Personas](personas.md) · [Índice](../README.md) · [Regras de negócio →](regras-de-negocio.md)
