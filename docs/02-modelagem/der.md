# Modelagem de dados

`A6` · **rascunho** · 11/09/2026 · alimenta A7, A14

> Seis entidades. Duas decisões governam o esquema: **o estado da compra não é armazenado** (RN01) e **o valor em reais também não** (RN07). Ambos são derivados, para não criar duas fontes de verdade para o mesmo fato.

[DER](#1-der) · [Cardinalidades](#2-cardinalidades) · [Dicionário](#3-dicionário-de-dados) · [Normalização](#4-normalização) · [Índices](#5-índices) · [Base local](#6-base-local)

**Nomenclatura.** Tabelas em inglês, plural, `snake_case`, porque o esquema vira código. Chave primária é sempre `id`; chave estrangeira carrega a tabela de origem (`purchases.user_id`).

---

## 1. DER

O diagrama e o esquema vivem em ferramenta própria. Este documento é o **memorial técnico**: justifica as decisões que o diagrama não consegue expressar.

| Arquivo | Ferramenta | Uso |
|---|---|---|
| [`der.drawio`](der.drawio) | draw.io · app.diagrams.net | Diagrama oficial, editável. Fonte de verdade do modelo |
| [`schema.dbml`](schema.dbml) | dbdiagram.io | Renderização rápida e exportação PNG/PDF |

> [!IMPORTANT]
> **Uma fonte de verdade por artefato.** O modelo não é redesenhado aqui em Mermaid: manter dois diagramas do mesmo esquema é o mesmo defeito que RN01 evita no banco.

**Sobre o DDL.** Não há `schema.sql` neste repositório de documentação. O SQL é artefato derivado e executável: nasce como **migration versionada** na pasta de código, quando a decisão **D4** definir o motor e o ferramental. Até lá, o dbdiagram exporta o DDL a partir de `schema.dbml` sempre que for preciso conferir.

`exchange_rates` aparece sem relacionamento por decisão, ver §4.3.

---

## 2. Cardinalidades

| Relação | | Leitura |
|---|:---:|---|
| users, stores | 1:N | Toda loja pertence a um usuário |
| users, purchases | 1:N | Toda compra pertence a um usuário |
| stores, purchases | 1:N | Toda compra tem exatamente uma loja |
| purchases, tracking_events | 1:N | Todo evento pertence a uma compra |
| users, notifications | 1:N | Alerta tem destinatário |
| purchases, notifications | 1:N | Alerta pode não ter compra associada |

> [!IMPORTANT]
> **Loja obrigatória é decisão, não acaso.** Loja opcional simplificaria o cadastro e esvaziaria RF-15. Para não penalizar o fluxo, o formulário de compra permite criar a loja ali mesmo.

---

## 3. Dicionário de dados

### `users`

| Coluna | Tipo | Restrição |
|:---:|:---:|---|
| id | bigint | PK |
| name | varchar(120) | not null |
| email | varchar(180) | not null, **unique** |
| password_hash | varchar(255) | not null · derivação com sal (RNF-02) |
| role | varchar(16) | not null, default `BUYER` · ou `ADMIN` |
| is_blocked | boolean | not null, default false |
| failed_login_attempts | smallint | not null, default 0 |
| blocked_until | timestamp | null |
| created_at, updated_at | timestamp | not null |

### `stores`

| Coluna | Tipo | Restrição |
|:---:|:---:|---|
| id | bigint | PK |
| user_id | bigint | FK users · on delete cascade |
| name | varchar(120) | not null |
| country_code | char(2) | null · ISO 3166-1 alfa-2 |
| website | varchar(255) | null |
| created_at, updated_at | timestamp | not null |

`unique (user_id, name)`. Duas lojas de mesmo nome para o mesmo usuário são erro de digitação, não dois cadastros.

### `purchases`

| Coluna | Tipo | Restrição |
|:---:|:---:|---|
| id | bigint | PK |
| user_id | bigint | FK users · on delete cascade |
| store_id | bigint | FK stores · **on delete restrict** |
| product_description | varchar(180) | not null |
| tracking_code | varchar(40) | not null |
| purchase_date | date | not null · <= hoje |
| promised_date | date | not null · >= purchase_date |
| amount | decimal(12,2) | not null · > 0 |
| currency | char(3) | not null · ISO 4217 |
| tax_amount | decimal(12,2) | null · > 0 |
| tax_due_date | date | null |
| tax_paid_at | timestamp | null |
| notes | text | null · editável mesmo após conclusão (RN09) |
| archived_at | timestamp | null |
| last_synced_at | timestamp | null |
| created_at, updated_at | timestamp | not null |

`unique (user_id, tracking_code)` · `check (tax_due_date is null or tax_amount is not null)`

> [!NOTE]
> **Por que a unicidade é por usuário e não global:** dois usuários podem legitimamente acompanhar o mesmo pacote.

> [!NOTE]
> [!NOTE]
> **Por que `on delete restrict` na loja:** implementa RF-09 no banco. A regra também roda na camada de negócio, com mensagem explicativa. A restrição é a última linha de defesa, não a primeira.

### `tracking_events`

| Coluna | Tipo | Restrição |
|:---:|:---:|---|
| id | bigint | PK |
| purchase_id | bigint | FK purchases · on delete cascade |
| occurred_at | timestamp | not null |
| description | varchar(255) | not null |
| location | varchar(120) | null |
| category | varchar(32) | not null · ver abaixo |
| fingerprint | char(64) | not null · resumo de purchase_id + occurred_at + description |
| created_at | timestamp | not null |

`unique (purchase_id, fingerprint)`

> [!NOTE]
> [!NOTE]
> **O `fingerprint` sustenta RF-10.** A fonte externa não fornece identificador estável por evento: devolve o histórico inteiro a cada consulta. Sem chave de deduplicação, toda sincronização duplicaria tudo. O resumo do conteúdo fornece essa chave, e a restrição transfere a garantia para o banco, onde não depende de ordem de execução nem de concorrência.

**Domínio de `category`:** `POSTED` · `INTERNATIONAL_TRANSIT` · `CUSTOMS` · `NATIONAL_TRANSIT` · `DELIVERED` · `RETURNED` · `OTHER`

Atribuída na importação, alimenta RN01. Texto não reconhecido recebe `OTHER` e não altera o estado, garantindo que novidade da fonte produza ausência de informação, nunca informação errada.

### `exchange_rates`

| Coluna | Tipo | Restrição |
|:---:|:---:|---|
| id | bigint | PK |
| currency | char(3) | not null · ISO 4217 |
| rate_date | date | not null |
| rate | decimal(18,6) | not null · > 0 |
| fetched_at | timestamp | not null |

`unique (currency, rate_date)`

Seis casas decimais: moedas de baixo valor unitário perdem significado com duas, e o erro se propaga ao consolidado de RF-14.

### `notifications`

| Coluna | Tipo | Restrição |
|:---:|:---:|---|
| id | bigint | PK |
| user_id | bigint | FK users · on delete cascade |
| purchase_id | bigint | FK purchases · null · on delete cascade |
| reason | varchar(24) | `DELAYED` · `STALLED` · `TAX_DUE` · `CLAIM_WINDOW` |
| message | varchar(255) | not null |
| read_at | timestamp | null |
| created_at | timestamp | not null |

```sql
create unique index ux_notifications_pending
    on notifications (purchase_id, reason)
    where read_at is null;
```

> [!NOTE]
> [!NOTE]
> **Índice único parcial implementa RN06 no banco.** A alternativa (consultar antes de inserir) abre janela de concorrência entre a sincronização em segundo plano e a ação do usuário. Recurso de PostgreSQL e SQLite; em motores sem suporte, a regra migra para a camada de negócio com controle transacional, e a limitação deve constar no ADR do banco.

---

## 4. Normalização

### 4.1 Até a terceira forma normal

| Forma | Verificação |
|:---:|---|
| **1FN** | Atributos atômicos. A violação natural seria a linha do tempo dentro da compra: está em `tracking_events` |
| **2FN** | Sem chave primária composta, logo sem dependência parcial. As chaves candidatas compostas são restrições de unicidade sobre tabelas com chave substituta |
| **3FN** | Sem atributo dependente de outro não chave. Os dois candidatos foram removidos, ver abaixo |

| Candidato a violação | Tratamento |
|---|---|
| Valor em BRL na compra | **Não armazenado.** Depende de amount, currency e purchase_date. Obtido por junção com `exchange_rates` (RN07) |
| Estado da compra | **Não armazenado.** Depende do último `tracking_events` (RN01) |

### 4.2 Desnormalização: nenhuma

Os dois pontos que a justificariam foram recusados. O ganho de leitura não compensa a segunda fonte de verdade em domínio de dezenas de compras por usuário.

> [!NOTE]
> Se a medição de RNF-01 em aparelho indicasse necessidade, a resposta correta seria cache invalidável na apresentação, não coluna derivada: cache errado se corrige descartando, coluna errada se corrige com migração.

### 4.3 Por que `exchange_rates` não tem FK

A compra referencia a cotação logicamente, por `(currency, purchase_date)`.

| | Razão |
|:---:|---|
| **1** | A cotação pode não existir na data exata, e RN07 manda usar a anterior. FK tornaria erro de integridade o que é comportamento previsto |
| **2** | A cotação é obtida de forma assíncrona e pode chegar depois. Com FK, o cadastro dependeria de rede, violando RF-16 |
| **3** | É dado de referência compartilhado, sem titular. Vinculá-la à compra inverteria essa natureza |

> [!IMPORTANT]
> [!IMPORTANT]
> É a decisão mais provável de ser questionada na arguição. A resposta: integridade referencial é ferramenta, não finalidade. Aplicá-la aqui transformaria degradação prevista em falha.

---

## 5. Índices

| Índice | Tabela | Colunas | Para quê |
|---|:---:|---|---|
| `ux_users_email` | users | email | Autenticação |
| `ux_stores_user_name` | stores | user_id, name | Unicidade por usuário |
| `ux_purchases_user_tracking` | purchases | user_id, tracking_code | RF-04 |
| `ix_purchases_user_archived` | purchases | user_id, archived_at | Listagem (RF-11) |
| `ix_purchases_promised` | purchases | promised_date | RN02, RN05 |
| `ix_purchases_sync` | purchases | last_synced_at | Candidatas à sincronização |
| `ux_tracking_fingerprint` | tracking_events | purchase_id, fingerprint | Deduplicação |
| `ix_tracking_purchase_time` | tracking_events | purchase_id, occurred_at desc | Linha do tempo e RN01 |
| `ux_rates_currency_date` | exchange_rates | currency, rate_date | RN07 |
| `ux_notifications_pending` | notifications | purchase_id, reason (parcial) | RN06 |
| `ix_notifications_user_read` | notifications | user_id, read_at | RF-17 |

> [!NOTE]
> **O mais crítico é `ix_tracking_purchase_time`.** RN01 recalcula o estado a cada exibição, o que torna a busca do último evento a consulta mais frequente do sistema.

---

## 6. Base local

Espelha `purchases`, `stores`, `tracking_events` e `notifications`, mais controle de sincronização:

| Coluna | Valores |
|:---:|---|
| `sync_status` | `SYNCED` · `PENDING_CREATE` · `PENDING_UPDATE` · `PENDING_DELETE` |
| `local_updated_at` | Momento da alteração local |

**Resolução de conflito:** última escrita vence, com prioridade local nos campos do usuário e remota nos eventos de rastreio.

> [!NOTE]
> A divisão funciona porque as duas origens nunca escrevem nos mesmos campos: o usuário não edita evento de rastreio, e a fonte externa não altera valor, prazo nem loja. Isso é propriedade do modelo, não coincidência, e é o que dispensa estratégia de mesclagem mais complexa.

O mecanismo detalhado pertence a A7, e as tecnologias dependem de **D3**, em aberto.

---

[Índice](../README.md)
