# Personas

`A2` · **rascunho** · 11/09/2026 · alimenta A3, A9, A16

> **Público-alvo:** quem tem **3 ou mais compras internacionais em trânsito simultâneo, ao menos uma vez por trimestre**. Abaixo disso, o acompanhamento manual ainda funciona e o aplicativo não resolve dor real.

Esse limiar não é retórico: é o critério de recrutamento das cinco sessões de usabilidade exigidas pela Seção 6.3 do norteador, que pede usuários **do perfil definido**. Ver A16.

**Fora do público-alvo**

| Grupo | Razão |
|---|---|
| Comprador ocasional | Acompanhamento manual é suficiente |
| Importador comercial | Precisa de controle fiscal e contábil, fora do escopo |
| Comprador nacional | O problema nasce do trajeto internacional |

---

> [!WARNING]
> **Estas personas são hipóteses, não pesquisa.** Foram construídas a partir do problema descrito em A1, sem entrevista prévia com usuários reais. As sessões de usabilidade previstas em A16, com cinco usuários externos, são a primeira oportunidade de confirmá-las ou corrigi-las. Divergência encontrada ali deve voltar para este documento, não ser ignorada.

---

## P1 · Camila, 27 · compradora recorrente

Compra eletrônicos duas a três vezes por mês, tem de cinco a doze pacotes a caminho, consulta no transporte público com conexão irregular. Anota códigos em bloco de notas e perde o vínculo com o que comprou. Já perdeu uma encomenda taxada por não ver o aviso.

| Necessidade | Requisito |
|---|---|
| Saber o que é cada pacote | RF-04, RF-06 |
| Ser avisada da taxa sem abrir o app | RF-13, RN04 |
| Consultar sem conexão estável | RF-16, RNF-05 |
| Perceber atraso antes de perder o prazo | RF-12, RN02, RN05 |

> [!NOTE]
> **Frustração central:** descobrir tarde. Toda perda dela veio de informação que existia e não chegou a tempo.

---

## P2 · Rafael, 34 · comprador metódico

Compra menos e mais caro, controla gastos em planilha. Confere o rastreio poucas vezes por semana, mas quer saber quanto tem comprometido e quanto pagou de imposto no período.

| Necessidade | Requisito |
|---|---|
| Ver o total em trânsito | RF-14, RN07 |
| Comparar prazo prometido e real por loja | RF-15 |
| Registrar em moeda estrangeira e ver em reais | RF-05, RN07 |
| Manter histórico do que já chegou | RF-08, RN09 |

> [!NOTE]
> **Frustração central:** falta de consolidação. O dado existe espalhado e não forma um quadro.

---

## P3 · Diego, 31 · administrador

Opera o aplicativo, não é comprador. Precisa saber se a fonte de rastreio responde e atender solicitações de conta.

| Necessidade | Requisito |
|---|---|
| Ver falha antes do usuário reclamar | RF-19, RN03 |
| Bloquear e reativar contas | RF-18 |
| Operar sem ver conteúdo de compra | RN08 |

> [!IMPORTANT]
> **Restrição de projeto.** A persona administrativa é limitada a metadados operacionais, por decisão registrada em A1 §2.

---

## Cenário de demonstração

Camila compra um fone por **180 CNY**, com prazo prometido para **28/10**. Cadastra a compra assim que recebe o código, informando produto, valor, moeda, loja e prazo.

Nas semanas seguintes o aplicativo importa os eventos e recalcula o estado. Em **12/10** o pacote é taxado: ela recebe notificação com o prazo, registra o valor e paga a tempo.

Em **30/10**, dois dias após o prazo prometido, a compra não chegou. O aplicativo a classifica como atrasada e informa quantos dias restam da janela de reclamação. Camila reclama a tempo.

> [!NOTE]
> Este é o roteiro da demonstração do Apêndice D. Cobre F1, F2 e F4.

---

[← Domínio](dominio.md) · [Índice](../README.md) · [Requisitos →](requisitos.md)
