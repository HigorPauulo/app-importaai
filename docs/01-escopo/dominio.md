# Domínio

`A1` · **rascunho** · 11/09/2026 · alimenta A2, A3, A4, A6

> Ferramentas de rastreio sabem **onde o pacote está**. Não sabem o que há dentro, quanto custou, qual prazo foi prometido nem se houve imposto. O aplicativo cruza as duas coisas e avisa antes que o prazo passe.

[Problema](#1-problema) · [Atores](#2-atores) · [Fluxo](#3-fluxo-principal) · [Por que móvel](#4-por-que-móvel) · [Escopo](#5-escopo) · [Vocabulário](#6-vocabulário) · [Cortes](#7-cortes-do-mvp) · [Conformidade](#8-conformidade)

---

## 1. Problema

Compra internacional no corredor China para Brasil leva tipicamente de 20 a 60 dias (faixa estimada, a confirmar com dado real durante os ciclos), atravessa dois sistemas logísticos e pode gerar imposto com prazo curto. Quem compra com frequência convive com várias encomendas simultâneas, em estágios, lojas, prazos e moedas diferentes.

O comprador guarda de forma dispersa o que nenhuma transportadora conhece: produto, valor pago, loja, prazo prometido e imposto cobrado. Daí quatro falhas recorrentes:

| | Evento | Prejuízo |
|:---:|---|---|
| **F1** | Aviso de taxa se perde entre e-mails | Devolução e perda integral do valor |
| **F2** | Atraso passa despercebido | Perda da janela de reclamação |
| **F3** | Pacote para de se mover | Extravio descoberto fora do prazo |
| **F4** | Consulta manual em vários sites | Custo de tempo e abandono |

> [!IMPORTANT]
> **A raiz é comum.** F1, F2 e F3 acontecem porque nenhuma ferramenta cruza o que o comprador sabe com o que a transportadora informa. Esse cruzamento é o aplicativo.

---

## 2. Atores

| Ator | Acesso |
|:---:|---|
| **Comprador** | Mantém as próprias compras e lojas. Não vê as de ninguém |
| **Administrador** | Gerencia contas e a saúde da integração. **Não vê conteúdo de compra** |

> [!IMPORTANT]
> **Decisão.** O perfil administrativo é de operação do sistema, não de supervisão de conteúdo. Formalizado em **RN08**, é privacidade por padrão e torna o segundo perfil de R2 genuíno, não decorativo.

---

## 3. Fluxo principal

> O comprador cadastra a compra com o código de rastreio e os dados que só ele conhece; o aplicativo mantém o trajeto atualizado e o avisa quando a encomenda atrasa, para de se mover ou é taxada, até a entrega ou a devolução.

**A decisão que o aplicativo apoia:** *devo reclamar desta compra agora ou ainda dá tempo?*

Esse enunciado é o critério de corte. Funcionalidade que não ajuda a responder a essa pergunta está fora.

---

## 4. Por que móvel

| | Razão |
|:---:|---|
| **1** | F1, F2 e F3 são falhas de omissão. Exigem alerta que chega sem o usuário abrir nada |
| **2** | O cadastro acontece no ato da compra, feita no celular. Depois, no computador, não acontece |
| **3** | A consulta é feita em deslocamento, com conectividade instável. Persistência local é uso, não otimização |

---

## 5. Escopo

**Dentro.** Manutenção de compras e lojas · importação e persistência dos eventos de rastreio · cálculo de estado · detecção de atraso, estagnação e taxa · notificação · conversão monetária · indicadores · autenticação e administração de contas.

**Fora:**

| Item | Razão |
|---|---|
| Comprar ou pagar no aplicativo | Muda a natureza do domínio e traz exigência regulatória |
| Quitar o imposto | Depende de integração bancária. O aplicativo alerta, não paga |
| Calcular o imposto devido | Depende de tabela fiscal e classificação aduaneira |
| Falar com o vendedor | Ocorre na plataforma de origem |

---

## 6. Vocabulário

Classificação por extração de substantivos (técnica de Abbott). Dois critérios: **identidade própria** (duas ocorrências iguais são coisas distintas?) e **ciclo de vida próprio**.

**Entidades**

| Termo | Por quê |
|:---:|---|
| **Usuário** | Duas contas com os mesmos dados são contas distintas |
| **Compra** | Duas compras idênticas são dois pacotes a caminho |
| **Loja** | Tem dados próprios e é referenciada por muitas compras |
| **Evento de rastreio** | Única por data, local e texto. Não existe fora da compra |
| **Cotação** | Duas cotações da mesma moeda em datas distintas são fatos distintos |
| **Notificação** | Cada alerta é um fato datado, com estado de leitura |

**Atributos da compra.** Código de rastreio · produto · valor · moeda · data da compra · prazo prometido · valor da taxa · prazo de pagamento.

**Fora do sistema.** Marketplace e remetente (atores externos sem dado próprio) · site de rastreio (comportamento atual, não conceito) · fonte externa e integração (arquitetura, ver A7).

### Três ambiguidades resolvidas

> **Compra e encomenda são o mesmo conceito.** Termo adotado: **Compra**, porque o registro nasce do ato de comprar e existe antes de qualquer movimentação.

> [!NOTE]
> [!NOTE]
> **Loja é entidade, não texto livre.** Campo textual seria mais simples, mas impede agrupar por loja e reintroduz erro de digitação. Como entidade, fornece a segunda entidade com CRUD exigida por R3, com uso legítimo.

> [!NOTE]
> [!NOTE]
> **Taxa é atributo, não entidade.** Uma compra tem no máximo uma cobrança, sem ciclo de vida próprio. Entidade separada criaria relação 1:1 sem ganho, que é normalização mal aplicada.

> [!NOTE]
> [!NOTE]
> **Estado não é atributo armazenado.** É derivado do último evento (RN01). Persistir estado ao lado dos eventos cria duas fontes de verdade que divergem na primeira falha de sincronização.

---

## 7. Cortes do MVP

Critério: se o fluxo principal sobrevive sem o item, ele sai.

| | Descartado | Razão |
|:---:|---|---|
| **C1** | Vários pacotes por compra | Dobra a complexidade do modelo sem alterar o fluxo principal |
| **C2** | Compartilhar acompanhamento | Exige autorização por item e telas de convite |
| **C3** | Histórico de preço por loja | Deriva para análise de consumo, outro domínio |

Os três constam como evolução futura no relatório final.

---

## 8. Conformidade

Verificação contra a Seção 3.3 do Documento Norteador.

| Exigência | Atendimento |
|---|---|
| Usuários identificáveis | Comprador e Administrador, §2 |
| Regras explícitas | Nove regras em A4, derivadas de F1 a F4 |
| Fluxo principal justificado | §3 |
| 2+ entidades relacionadas com validação | Compra e Loja, ver A6 |
| Não é listagem estática | O estado é calculado, não exibido como recebido (RN01) |
| Não é agregador sem tratamento | O valor está no cruzamento (RN02, RN03, RN04) |
| Não é reprodução de terceiros | Domínio, modelagem e implementação autorais |

---

[Índice](../README.md) · [Personas →](personas.md)
