# CLAUDE.md · Importa Aí

Regras do projeto para o Claude Code. Valem para qualquer integrante que use o assistente neste
repositório e **prevalecem sobre o `CLAUDE.md` global** onde houver conflito.

Este arquivo **aponta** para a documentação, não a recopia. Antes de decidir, leia a fonte.

---

## Contexto

- Projeto Integrador ADS1253 (POO com Banco de Dados), PUC Goiás, 2026/2. Equipe de 3.
- Produto: app Android que estima o custo de compras internacionais e acompanha a encomenda,
  funcionando sem internet ([visão](docs/01-produto/visao.md)).
- **O Documento Norteador prevalece sobre tudo** ([docs/00-referencia](docs/00-referencia/)).
  Regras dele que afetam o seu trabalho aqui: §6.2 (versionamento), §8.4 (FPI), §9.1 (uso de IA), R12 e R13.

| Parte | Pasta | Dono | Pilha |
|---|---|---|---|
| App | `app/` | Diogo | React Native, Expo, TypeScript, Expo Router, SQLite (`expo-sqlite`), Jest |
| API | `api/` | Higor | Java 21, Spring Boot 4, JDBC com DAOs (`JdbcTemplate`), PostgreSQL 18, Flyway, JUnit 5, Testcontainers |
| Testes e docs | `api/src/test/`, `app/**/*.test.ts`, `docs/` | Alex | |

## Onde está cada resposta

| Pergunta | Fonte |
|---|---|
| Camadas, pastas, onde cada regra roda | [visao-geral.md](docs/02-arquitetura/visao-geral.md) |
| Rotas, formatos, códigos de erro | [api.md](docs/02-arquitetura/api.md) |
| Tabelas, garantias, índices | [modelo-de-dados.md](docs/02-arquitetura/modelo-de-dados.md) e [sql/](docs/02-arquitetura/sql/) |
| Classes, objetos de valor, estados | [modelo-de-dominio.md](docs/02-arquitetura/modelo-de-dominio.md) |
| Protocolo de sincronização | [sincronizacao.md](docs/02-arquitetura/sincronizacao.md) |
| Por que cada decisão | [ADRs](docs/02-arquitetura/decisoes/) |
| Termos do domínio | [glossário](docs/01-produto/glossario.md) |
| Regra de negócio (RN) e requisito (RF/RNF) | [regras](docs/01-produto/regras-de-negocio.md) · [requisitos](docs/01-produto/requisitos.md) |
| História (US/H), pontos, ciclo | [backlog](docs/04-projeto/backlog.md) |
| Caso de teste (CT) | [plano de testes](docs/05-qualidade/plano-de-testes.md) |
| Branches, commits, PR, pronto | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## Desvios intencionais do padrão da casa

O projeto é acadêmico e a disciplina é **POO com Banco de Dados**. Por isso:

- **Sem JPA/Hibernate e sem Spring Data.** Persistência por DAO com `JdbcTemplate` e SQL escrito à
  mão ([ADR-002](docs/02-arquitetura/decisoes/adr-002-retaguarda.md)). Não sugerir ORM.
- **Sem MapStruct.** Conversão entre linha, entidade e DTO em método explícito.
- **Jest no app**, não Vitest (padrão do Expo).
- **Sem Next.js, Payload, Tailwind web.** O app é React Native.
- Nomes de pacote e de módulo seguem o domínio em português (`acesso`, `compras`, `rastreio`...),
  como está na [arquitetura](docs/02-arquitetura/visao-geral.md#api). Classes, métodos e colunas em inglês.

## Regras que não se negociam

1. **Uma regra, um dono** ([ADR-004](docs/02-arquitetura/decisoes/adr-004-dono-de-cada-regra.md)).
   Antes de implementar uma RN, confira na tabela "Onde cada regra roda" de que lado ela mora. Nunca
   duplicar a regra no outro lado.
2. **A tela nunca espera a rede.** No app, toda leitura e escrita vai primeiro ao SQLite.
3. **Camadas com dependência só para dentro.** App: telas → domínio ← dados. API: controller →
   service → DAO / porta. Controller não conhece SQL; domínio do app não importa React, SQLite nem HTTP.
4. **`user_id` sempre do token**, nunca do corpo. Recurso de outro usuário responde **404**.
5. **SQL sempre parametrizado**, nos dois lados. Nunca concatenar.
6. **Segredo só em variável de ambiente**, a partir de `.env.example`. Nunca ler, imprimir ou
   commitar `.env`.
7. **Mudança de schema** exige migration Flyway nova (`V<n>__descricao.sql`), atualização de
   [schema.dbml](docs/02-arquitetura/schema.dbml) e do [modelo de dados](docs/02-arquitetura/modelo-de-dados.md).
   Migration aplicada nunca é editada.
8. **Contrato da API** mudou? Atualize [api.md](docs/02-arquitetura/api.md) no mesmo PR e avise o dono
   da outra ponta.
9. **Decisão de arquitetura nova** vira ADR. ADR aceito não é editado: um novo o substitui.
10. **Sem código comentado sem uso** e sem `console.log`, `System.out.println` ou `printStackTrace`
    no que vai para commit (R12).

## Qualidade

- Toda tela tem os quatro estados: carregando, vazio, erro e conteúdo.
- Dado inválido é recusado com a mensagem junto ao campo.
- Cada regra é testada no lado que a implementa. O teste cita o caso: `CT-09`, `RN10`.
- Acessibilidade: rótulo para leitor de tela, área de toque mínima de 48 dp, contraste AA
  ([usabilidade](docs/03-design/usabilidade-e-acessibilidade.md)).
- Antes de dizer "pronto", rode o gate do lado alterado:

| Lado | Gate |
|---|---|
| API | `cd api && ./mvnw verify` |
| App | `cd app && npm run lint && npx tsc --noEmit && npm test` |
| Docs | links relativos válidos; tabelas de rastreabilidade coerentes |

Build verde não basta: critério de aceite só vale verificado **no aparelho físico**.

---

## Git com o Claude Code

Regras completas em [CONTRIBUTING.md](CONTRIBUTING.md). O que o assistente deve respeitar:

- **Nunca commitar em `main` nem em `develop`.** Crie a branch antes de editar código.
- **Commit só quando o integrante pedir**, em Conventional Commits PT-BR, sem atribuição de IA e sem
  `Co-Authored-By`. O commit é do integrante: ele revisa o diff antes.
- **Não commitar nem abrir PR em nome de outro integrante.** O FPI (§8.4 do Norteador) mede a
  contribuição de cada um pelo histórico. Trabalho feito no seu terminal é commitado por você, na
  sua área.
- Sem `--no-verify`, sem `push --force` em branch compartilhada, sem reescrever histórico publicado.
- PR sempre com o template, citando US/H, RN e CT.

## Claude Code neste repo (`.claude/`)

| Arquivo | O que faz |
|---|---|
| `settings.json` | Versionado. Libera leitura de git, `./mvnw`, `npm`, `docker compose`; bloqueia ler `.env`, force push, `reset --hard`, `gh pr merge`, `flyway clean` e `down -v` |
| `hooks/protect-branches.sh` | Bloqueia commit e push em `main` e `develop` |
| `commands/commit.md` | `/commit`: mensagem no padrão do CONTRIBUTING, sem `git add` automático |
| `commands/pr.md` | `/pr`: PR para `develop` com o template preenchido, sem merge |
| `settings.local.json` | Pessoal, fora do versionamento (ignorado pelo git global) |

Os guardrails reduzem erro acidental; não substituem a revisão humana do PR.

## Uso de IA (§9.1 do Norteador)

- Todo uso relevante é registrado na [declaração de IA](docs/06-entregas/declaracao-ia.md), por ciclo.
- Quem commita precisa saber **explicar cada linha** na arguição. O assistente deve explicar o porquê
  das escolhas quando gerar código não trivial, e preferir a solução mais simples que o integrante
  consiga defender.
- Código de terceiros ou trecho adaptado de documentação leva referência em comentário.

## Idioma e estilo

- Código, identificadores, arquivos, tabelas e colunas: **inglês**.
- Documentação, comentários, commits e textos da interface: **português do Brasil**.
- Comentário explica o porquê, nunca o quê.
- Nunca usar travessão ("—") em texto. Use vírgula, dois pontos ou parênteses.
- Documentação segue o estilo existente: título, frase de propósito, `---`, tabelas curtas.
