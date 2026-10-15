# ADR-011 · Ajustes do protocolo de sincronização

**Status:** aceita · 15/10/2026 · complementa o [ADR-008](adr-008-protocolo-de-sincronizacao.md), que continua valendo no resto

## Contexto

A auditoria de 15/10/2026 encontrou quatro casos em que o protocolo do ADR-008, como escrito, perde dado ou recusa uma alteração legítima, e uma prova que não prova o que afirma:

1. **Resposta perdida seguida de edição:** a compra criada sem rede é aplicada no servidor, a resposta se perde no tempo limite e o usuário edita de novo. A edição sai com `mutation_id` novo e `baseVersion = 0`; o servidor não reconhece a repetição e responde `SYNC_CONFLICT` contra a própria criação. O ADR-008 prometia que "reenvio por falha de rede nunca gera conflito falso".
2. **Excluir e recriar sem rede:** o usuário exclui a compra de código C e cria outra com C. Aplicando criações antes de exclusões, o índice único recusa a nova com `TRACKING_CODE_DUPLICATED`.
3. **Exclusão do pai concorrente com criação do filho:** a conferência "pai não excluído" lê sem trava. Duas transações em `READ COMMITTED` passam juntas e deixam uma compra ativa numa loja excluída, que trava a limpeza da retenção 30 dias depois.
4. **Banco restaurado de backup:** os aparelhos guardam um cursor com `xid` do banco antigo. Num cluster novo os `xid` recomeçam baixos, e o pull devolve vazio até o cursor vencer, sem nenhum aviso.
5. **Prova do cursor:** a verificação 13 de `schema-checks.sql` lê o `xmin` e grava na mesma transação; o resultado é sempre verdadeiro e não exercita commits fora de ordem.

## Decisão

Especificação atualizada em [sincronização](../sincronizacao.md).

- **Ciclo do `mutation_id`:** nasce quando a linha passa a `PENDING` e só muda depois que o servidor responde sobre ele. Edições feitas enquanto um envio está sem resposta mantêm o mesmo `mutation_id`. No servidor, `last_mutation_id = mutationId` deixa de ser "repetição, nada a fazer": se os dados enviados diferem dos gravados, o servidor aplica sobre a versão atual, porque nenhum outro aparelho escreveu entre os dois envios (se tivesse escrito, `last_mutation_id` seria outro).
- **Ordem do envio em três fases:** exclusões dos filhos para os pais, depois criações e edições dos pais para os filhos, depois nova tentativa das exclusões recusadas por estarem em uso.
- **Trava no pai:** criar ou mover um filho lê o pai com `for share`; excluir o pai lê a linha com `for update` antes de conferir os filhos. As duas operações passam a se serializar.
- **Cursor com época e teto:** o cursor leva a época do banco (`SYNC_EPOCH`, configuração da API, incrementada no procedimento de restauração). Época diferente, ou `xid` acima de `pg_snapshot_xmax(pg_current_snapshot())`, responde o retrato completo com `reset: true`.
- **Prova do cursor por teste de integração:** um teste Testcontainers com duas conexões (CT-62) substitui a verificação 13 como prova. A verificação 13 continua, com o alcance real descrito no próprio SQL.

## Alternativas consideradas

| Questão | Descartado | Motivo |
|---|---|---|
| Resposta perdida | Tabela de mutações processadas (`sync_mutations`) | Resolve, mas o ADR-008 já a descartou pelo custo; manter o `mutation_id` até a resposta resolve com a coluna que existe |
| Resposta perdida | Bloquear a edição local enquanto houver envio sem resposta | A tela passaria a esperar a rede, contra o princípio central |
| Ordem do envio | Manter criações antes de exclusões | Recusa o caso "excluir e recriar", comum ao corrigir um cadastro |
| Corrida do pai | Nível `SERIALIZABLE` no envio | Funciona, mas exige repetir transações abortadas em todo o envio por um caso raro |
| Restauração | Só o teto por `xmax` | Não detecta restauração no mesmo cluster, em que os `xid` continuam subindo |

## Consequências

- **+** A promessa do ADR-008 passa a valer: reenvio por falha de rede não gera conflito falso, inclusive com edição no meio.
- **+** "Excluir e recriar" funciona sem rede.
- **+** Nenhuma compra fica ativa em loja excluída, mesmo com dois aparelhos ao mesmo tempo.
- **−** Restaurar backup passa a ter um passo a mais: incrementar `SYNC_EPOCH`. O que existia só no servidor depois do backup se perde nos dois lados; o pendente do aparelho é preservado e reenviado.
- **−** Cinco casos de teste novos de integração (CT-62 a CT-66).

## Reavaliar se

O envio passar a aceitar alterações de mais de um usuário no mesmo registro (RF-25): a regra "ninguém escreveu entre os dois envios" deixa de ser garantida pelo `last_mutation_id`.
