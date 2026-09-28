# ADR-002 · Serviço de retaguarda

**Status:** aceita · 28/09/2026

## Contexto

O sistema precisa de persistência remota com sincronização (R6), rotinas agendadas (rastreio a cada 20 min), envio de push com o app fechado, isolamento entre usuários e índices únicos parciais para as garantias de deduplicação e alerta sem repetição. A disciplina avalia modelagem, SQL, **JDBC, DAO, transações e concorrência**, e o material da AED indica que a persistência remota do projeto é construída com esse conteúdo.

## Decisão

**API própria em Java 21 e Spring Boot 4, com PostgreSQL 18.**

- Persistência com **JDBC e DAOs** (`JdbcTemplate`), SQL escrito pela equipe e sempre parametrizado.
- Transações declaradas nos serviços (`@Transactional`).
- Migrations com Flyway; autenticação com Spring Security, JWT e BCrypt.
- Testes de DAO e serviço contra PostgreSQL real com Testcontainers.

## Alternativas consideradas

| | Custo | Adequação ao domínio | Conteúdo da disciplina |
|---|---|---|---|
| Firebase | plano gratuito | fraca: banco de documentos sem índice único parcial nem restrições relacionais | nenhum SQL |
| Supabase | plano gratuito | boa: é PostgreSQL | SQL sem DAO nem transações próprias; isolamento em políticas do banco |
| Spring com JPA | zero | boa | esconde o SQL e as transações que serão arguidos |
| **Spring com JDBC e DAO** | zero | boa | **JDBC, DAO e transações explícitos** |

## Consequências

- **+** O SQL, os DAOs e as transações ficam visíveis no código e podem ser defendidos linha a linha na arguição; os testes de integração mostram o comportamento contra um banco real.
- **+** Deduplicação e alerta sem repetição garantidos pelo banco, mesmo com execuções simultâneas.
- **−** Mais código que um backend como serviço.
- **−** A API precisa estar hospedada com HTTPS para a demonstração em aparelho; hospedagem definida no Ciclo 3.
