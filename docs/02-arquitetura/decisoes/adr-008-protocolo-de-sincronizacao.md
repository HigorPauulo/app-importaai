# ADR-008 · Protocolo de sincronização

**Status:** aceita · 28/09/2026 · substitui a regra de conflito e o cursor do [ADR-003](adr-003-persistencia-local-e-sincronizacao.md)

## Contexto

O ADR-003 definiu local primeiro, UUID v7, exclusão por marca e envio antes de recebimento. Deixou em aberto três pontos que viram defeito na implementação:

1. **Cursor por horário:** `pull?since=<instante>` perde alterações quando o horário vem do aparelho (relógio adiantado ou edição offline enviada depois) e quando uma transação longa termina depois de um pull que já avançou o instante.
2. **"Última escrita vence":** justificada porque usuário e fonte de rastreio não escrevem nos mesmos campos, mas o mesmo usuário em dois aparelhos escreve. A edição de um apagaria a do outro sem aviso.
3. **Retenção das marcas de exclusão:** marcas removidas depois de 30 dias nunca chegam a um aparelho parado por mais tempo, e esse aparelho pode reenviar o registro apagado.

A sincronização é o item mais arriscado do backlog (US-20, US-21) e sustenta o Checkpoint 2.

## Decisão

Especificação completa em [sincronização](../sincronizacao.md).

- **Cursor por transação:** cada linha sincronizada guarda `change_xid` (`pg_current_xact_id()`, por gatilho). O pull roda em `REPEATABLE READ` e devolve como novo cursor `pg_snapshot_xmin(pg_current_snapshot())`. Nenhuma alteração escapa, independentemente do relógio.
- **Trava otimista:** cada linha tem `row_version`; o envio informa a versão que o aparelho conhecia e o `update` só acontece se ela for a atual. Diferente, o servidor responde `SYNC_CONFLICT` com a versão dele, e o usuário escolhe qual manter.
- **Envio idempotente:** cada alteração leva um `mutation_id`; o servidor guarda o último aplicado por linha e responde "aceito" de novo a uma repetição.
- **Retrato completo** quando não há cursor ou ele tem mais de 30 dias; o app substitui o que está sincronizado e preserva o pendente.
- **Retratos em vez de incremental** para o que muda sem escrita (situação e sinalizações dependem da data) ou é apagado fisicamente (alertas pela RN11).

## Alternativas consideradas

| Questão | Descartado | Motivo |
|---|---|---|
| Cursor | `updated_at` do servidor | Perde transações longas: grava o horário do início e termina depois do pull |
| Cursor | Sequência global (`bigserial`) | Mesmo problema: o número é tirado antes do commit, e commits terminam fora de ordem |
| Cursor | `updated_at` com margem de segurança (reler os últimos N segundos) | Reduz sem eliminar a perda; a margem certa depende da carga |
| Conflito | Última escrita vence | Perda silenciosa entre aparelhos do mesmo usuário |
| Conflito | Mesclagem por campo | Resolve o caso comum, mas duas edições do mesmo campo continuam exigindo escolha; complexidade dobrada para um caso raro |
| Idempotência | Tabela de mutações processadas | Uma coluna por linha basta, porque o aparelho junta as edições pendentes de um registro num único envio |

## Consequências

- **+** O algoritmo pode ser defendido com a teoria de transações e isolamento da disciplina; a verificação 13 de [`schema-checks.sql`](../sql/schema-checks.sql) prova o cursor contra o banco real.
- **+** Reenvio por falha de rede nunca duplica nem gera conflito falso.
- **−** O pull pode reenviar linhas já recebidas (as de transações em andamento no retrato anterior). Inofensivo: aplicar a mesma versão não muda nada.
- **−** Conflito exige uma decisão do usuário e uma interface para isso (banner no registro).
- **Plano de redução** (mantido do ADR-003): se o Ciclo 3 atrasar, entregar leitura sem conexão e cadastro em fila, sem edição offline. Nesse modo não há conflito possível.

## Reavaliar se

O app passar a ter compartilhamento entre usuários (RF-25): conflitos deixam de ser raros e a mesclagem por campo passa a valer o custo.
