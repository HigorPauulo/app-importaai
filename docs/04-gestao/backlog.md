# Backlog

`A12` · **rascunho** · 11/09/2026 · alimenta A13, A14

> 33 histórias, 7 épicos, **148 pontos**. Estimativa em Fibonacci, medindo esforço relativo, não hora. História sem critério de aceite não entra em ciclo.

[E1 Acesso](#e1--acesso) · [E2 Compras](#e2--compras) · [E3 Rastreio](#e3--rastreio) · [E4 Alertas](#e4--alertas) · [E5 Consolidação](#e5--consolidação) · [E6 Administração](#e6--administração) · [E7 Qualidade](#e7--qualidade) · [Ciclos](#distribuição-por-ciclo) · [Pronto](#definição-de-pronto)

---

## E1 · Acesso

| Id | Como **ator**, quero… | Prio | Pts | Ciclo | RF |
|:---:|---|:---:|:---:|:---:|:---:|
| US-01 | **visitante**, criar conta, para ter acervo pessoal | M | 3 | 1 | RF-01 |
| US-02 | **usuário**, autenticar-me, para acessar só as minhas compras | M | 5 | 1 | RF-02 |
| US-03 | **usuário**, encerrar sessão e alterar meus dados | M | 2 | 1 | RF-03 |
| US-04 | **sistema**, bloquear após 5 falhas, para dificultar tentativa exaustiva | M | 3 | 1 | RF-02 |

> [!NOTE]
> **Aceite de US-02.** Credencial válida concede sessão com validade. Inválida responde sem distinguir e-mail de senha. Bloqueada informa o tempo restante. Sessão expirada volta a T01 preservando o destino pretendido.

---

## E2 · Compras

| Id | Como **ator**, quero… | Prio | Pts | Ciclo | RF |
|:---:|---|:---:|:---:|:---:|:---:|
| US-05 | **comprador**, cadastrar compra com código e os dados que só eu conheço | M | 5 | 2 | RF-04 |
| US-06 | **comprador**, registrar moeda de origem e ver em reais | M | 5 | 2 | RF-05 |
| US-07 | **comprador**, ver o detalhe com a linha do tempo | M | 3 | 2 | RF-06 |
| US-08 | **comprador**, corrigir dado registrado errado | M | 3 | 2 | RF-07 |
| US-09 | **comprador**, excluir ou arquivar, sem perder histórico | M | 3 | 2 | RF-08 |
| US-10 | **comprador**, manter minhas lojas, para agrupar por origem | M | 5 | 2 | RF-09 |
| US-11 | **sistema**, impedir código duplicado por usuário | M | 2 | 2 | RF-04 |
| US-12 | **sistema**, impedir alteração de compra concluída | M | 3 | 2 | RN09 |

> [!NOTE]
> **Aceite de US-05.** Campos validados antes do envio, com a razão junto ao campo. Data não futura, prazo >= compra, valor > 0. Código duplicado oferece abrir a compra existente. Conclui sem conexão e sincroniza depois.

---

## E3 · Rastreio

| Id | Como **ator**, quero… | Prio | Pts | Ciclo | RF |
|:---:|---|:---:|:---:|:---:|:---:|
| US-13 | **comprador**, receber os eventos automaticamente | M | 8 | 3 | RF-10 |
| US-14 | **sistema**, descartar evento já importado | M | 5 | 3 | RF-10 |
| US-15 | **sistema**, calcular o estado pelo último evento | M | 5 | 3 | RN01 |
| US-16 | **comprador**, consultar sem conexão | M | 8 | 3 | RF-16 |
| US-17 | **comprador**, ter minhas alterações aplicadas na reconexão | M | 8 | 3 | RF-16 |
| US-18 | **sistema**, não apagar o que já foi obtido ao falhar | M | 3 | 3 | RNF-06 |

> [!NOTE]
> **Aceite de US-14.** Três sincronizações produzem o mesmo conjunto de eventos. Mesmo conteúdo e mesmo instante é o mesmo evento. Garantia verificada também sob execução concorrente.

---

## E4 · Alertas

| Id | Como **ator**, quero… | Prio | Pts | Ciclo | RF |
|:---:|---|:---:|:---:|:---:|:---:|
| US-19 | **comprador**, saber quando passa do prazo, para reclamar a tempo | M | 5 | 3 | RN02 |
| US-20 | **comprador**, saber quando o pacote para de se mover | M | 5 | 3 | RN03 |
| US-21 | **comprador**, registrar a taxa e ser avisado antes do vencimento | M | 5 | 3 | RF-13 |
| US-22 | **comprador**, saber quando a janela de reclamação vai fechar | M | 5 | 3 | RN05 |
| US-23 | **sistema**, emitir no máximo um alerta não lido por motivo e compra | M | 5 | 3 | RN06 |
| US-24 | **comprador**, ver o histórico de alertas e marcá-los como lidos | M | 3 | 3 | RF-17 |

> [!NOTE]
> **Aceite de US-23.** Três avaliações da mesma condição produzem uma única notificação não lida. Após leitura e nova ocorrência, novo alerta. Garantia mantida com sincronização em segundo plano concorrente com o uso.

---

## E5 · Consolidação

| Id | Como **ator**, quero… | Prio | Pts | Ciclo | RF |
|:---:|---|:---:|:---:|:---:|:---:|
| US-25 | **comprador**, buscar, filtrar e ordenar minhas compras | M | 5 | 2 | RF-11 |
| US-26 | **comprador**, ver quanto tenho em trânsito e quanto gastei | M | 5 | 4 | RF-14 |
| US-27 | **comprador**, ver o desvio de prazo por loja, para decidir onde comprar | S | 5 | 4 | RF-15 |

---

## E6 · Administração

| Id | Como **ator**, quero… | Prio | Pts | Ciclo | RF |
|:---:|---|:---:|:---:|:---:|:---:|
| US-28 | **administrador**, listar contas e bloquear ou reativar | M | 5 | 4 | RF-18 |
| US-29 | **administrador**, ver falha antes da reclamação do usuário | M | 5 | 4 | RF-19 |
| US-30 | **sistema**, impedir que o admin acesse conteúdo de compra | M | 3 | 4 | RN08 |

---

## E7 · Qualidade

| Id | Como **ator**, quero… | Prio | Pts | Ciclo | RF |
|:---:|---|:---:|:---:|:---:|:---:|
| US-31 | **usuário com baixa visão**, contraste e toque confortáveis | M | 5 | 4 | RNF-04 |
| US-32 | **usuário de leitor de tela**, rótulos descritivos | M | 5 | 4 | RNF-04 |
| US-33 | **equipe**, gerar APK e comprovar execução em aparelho | M | 3 | 4 | R14 |

---

## Distribuição por ciclo

| Ciclo | Semanas | Épicos | Pts | Marco |
|:---:|---|---|:---:|:---:|
| **1** | 7 e 8 | E1, camadas, navegação | 13 | Entrega N1 |
| **2** | 11 e 12 | E2, parte de E5 | 34 | |
| **3** | 13 e 14 | E3, E4 | 65 | Checkpoint 2 |
| **4** | 16 e 17 | E5, E6, E7 | 36 | Congelamento |

> [!WARNING]
> **O Ciclo 3 concentra o risco do cronograma.** 65 dos 148 pontos, com sincronização, operação sem conexão e as quatro regras de alerta, tudo sustentando o Checkpoint 2. Recomenda-se antecipar US-13 e US-16 para o fim do Ciclo 2.

---

## Definição de pronto

Cumulativamente:

1. Critérios de aceite verificados **no aparelho físico**.
2. Os quatro estados de A9 implementados: carregando, vazio, erro, conteúdo.
3. Validação recusa dado inválido com mensagem junto ao campo.
4. Código na camada correta, conforme A7.
5. Integrado por PR **revisado por outro integrante** (Seção 6.2 do norteador).
6. Linha correspondente de A14 atualizada.
7. Nenhuma credencial, chave ou endereço versionado.

---

[Índice](../README.md) · [Rastreabilidade →](rastreabilidade.md)
