# ADR-010 · Ocorrência de alerta

**Status:** aceita · 28/09/2026 · altera a garantia da [RN06](../../01-produto/regras-de-negocio.md#rn06--alerta-sem-repetição)

## Contexto

As regras de alerta são reavaliadas a cada 20 minutos e continuam verdadeiras por dias. A primeira modelagem da RN06 usava um índice único parcial em `notifications (purchase_id, reason, milestone) where read_at is null`. Ele impede dois alertas **não lidos** iguais, mas:

1. **Depois da leitura, o alerta volta.** O usuário lê "Compra atrasada" às 10h; às 10h20 a condição ainda é verdadeira, não há alerta não lido, e outro é criado. Um a cada 20 minutos, enquanto durar o atraso.
2. **A retenção apaga a proteção.** A RN11 apaga notificações lidas além das 50 mais recentes; mesmo com índice total, apagar a linha liberaria o mesmo alerta de novo.

A regra pretendida sempre foi "um alerta por fato; um fato novo gera alerta novo". O que faltava era dar identidade ao fato.

## Decisão

- Cada alerta tem uma **chave de ocorrência** que identifica o fato, calculada pela própria regra: o prazo prometido para o atraso, a data de vencimento para a taxa, o id do último evento para o pacote parado ([tabela no modelo de domínio](../modelo-de-dominio.md#regras-de-alerta-padrão-strategy)).
- As ocorrências ficam num **livro próprio**, `notification_occurrences`, com chave primária `(purchase_id, reason, occurrence_key)`. Não é afetado pela retenção; só some com a compra.
- Criar alerta = `insert ... on conflict do nothing` no livro; só se a linha entrar, a notificação é criada, na mesma transação. Seguro com execuções simultâneas.

## Alternativas consideradas

| Alternativa | Problema |
|---|---|
| Índice parcial só entre não lidos | Alerta volta depois da leitura (defeito 1) |
| Índice único total em `notifications` | Alerta volta depois da retenção (defeito 2) |
| Não apagar notificações (retenção só na exibição) | Tabela cresce sem limite e a RN11 vira regra de tela |
| Guardar "último alerta enviado" na compra | Uma coluna por motivo; não suporta os três marcos da taxa |

## Consequências

- **+** Um fato, um alerta, para sempre; verificação 6 de [`schema-checks.sql`](../sql/schema-checks.sql).
- **+** Um fato novo (novo prazo após edição, novo vencimento, novo evento que para de novo) gera alerta sem regra especial.
- **−** Uma tabela a mais, com linhas pequenas (três colunas) e poucas por compra.
- A RN06 passa a dizer "um alerta por ocorrência", mais forte que "um não lido por motivo e marco".
