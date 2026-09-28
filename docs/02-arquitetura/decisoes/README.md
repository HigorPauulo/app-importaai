# Decisões de arquitetura (ADR)

Cada decisão relevante tem um registro com contexto, alternativas descartadas e consequências. Decisão tomada não é editada: se mudar, um novo ADR a substitui.

| ADR | Decisão | Status |
|:---:|---|:---:|
| [001](adr-001-plataforma-movel.md) | App em React Native com Expo e TypeScript | aceita |
| [002](adr-002-retaguarda.md) | API própria em Spring Boot com JDBC, DAO e PostgreSQL | aceita |
| [003](adr-003-persistencia-local-e-sincronizacao.md) | SQLite no aparelho, UUID v7 e sincronização em fila | aceita, cursor e conflito substituídos pelo 008 |
| [004](adr-004-dono-de-cada-regra.md) | Cada regra de negócio roda em um único lado | aceita |
| [005](adr-005-fonte-de-rastreio.md) | Fonte de rastreio atrás de porta, com adaptador simulado e real | aceita, fonte real a validar até o Ciclo 3 |
| [006](adr-006-fonte-de-cotacao.md) | Cotação do dia e histórica, de fontes gratuitas | aceita, limites a validar no Ciclo 2 |
| [007](adr-007-notificacoes.md) | Notificações como recurso nativo: push remoto e lembrete local | aceita |
| [008](adr-008-protocolo-de-sincronizacao.md) | Cursor por transação, trava otimista e envio idempotente | aceita |
| [009](adr-009-sessao-e-revogacao.md) | Token de acesso curto e renovação opaca com rotação | aceita |
| [010](adr-010-ocorrencia-de-alerta.md) | Um alerta por ocorrência, com livro de ocorrências | aceita |

**Modelo:** Status · Contexto · Decisão · Alternativas consideradas · Consequências · Reavaliar se (quando houver gatilho claro).
