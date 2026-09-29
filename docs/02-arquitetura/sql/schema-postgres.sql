-- Importa Aí · esquema do banco da API (PostgreSQL 18)
--
-- Fonte de verdade do modelo físico. Vira a migration V1 do Flyway no H-02
-- (api/src/main/resources/db/migration/V1__baseline.sql) sem alteração.
-- schema.dbml e der.svg são gerados a partir do banco criado por este arquivo.
--
-- Convenções
--   * Registros criados no aparelho: uuid v7 gerado no cliente, validado aqui.
--   * Registros criados só no servidor: bigint identity.
--   * Instantes em timestamptz (UTC); datas de negócio em date (America/Sao_Paulo).
--   * Dinheiro em numeric(12,2); cotação em numeric(18,6). Nunca float.
--   * Enumerações como varchar + check: legíveis no SQL da arguição e baratas de evoluir.
--   * Tabelas sincronizadas carregam row_version (trava otimista), change_xid
--     (cursor da sincronização) e last_mutation_id (idempotência do envio).

begin;

-- ---------------------------------------------------------------------------
-- Funções de apoio
-- ---------------------------------------------------------------------------

-- updated_at mantido pelo banco para que nenhum DAO esqueça de atualizá-lo.
create function touch_updated_at() returns trigger
language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- Em tabelas sincronizadas, toda alteração avança a versão da linha e registra
-- a transação que a fez; o pull usa change_xid, e não o relógio, como cursor.
create function touch_synced_row() returns trigger
language plpgsql as $$
begin
    new.updated_at  := now();
    new.row_version := old.row_version + 1;
    new.change_xid  := pg_current_xact_id();
    return new;
end;
$$;

-- Parâmetros fiscais explicam simulações passadas: editar ou apagar uma versão
-- mudaria em silêncio um resultado que o usuário já viu.
create function forbid_change() returns trigger
language plpgsql as $$
begin
    raise exception '% é somente inserção', tg_table_name
        using errcode = 'restrict_violation';
end;
$$;

-- ---------------------------------------------------------------------------
-- Referência
-- ---------------------------------------------------------------------------

create table currencies (
    code        char(3)      primary key check (code ~ '^[A-Z]{3}$'),
    name        varchar(60)  not null,
    minor_units smallint     not null default 2 check (minor_units between 0 and 4),
    is_active   boolean      not null default true
);

insert into currencies (code, name) values
    ('USD', 'Dólar americano'),
    ('CNY', 'Yuan chinês'),
    ('EUR', 'Euro');

-- ---------------------------------------------------------------------------
-- Pessoas, sessões e aparelhos
-- ---------------------------------------------------------------------------

create table users (
    id                    bigint       generated always as identity primary key,
    name                  varchar(120) not null check (length(trim(name)) > 0),
    email                 varchar(180) not null check (email = lower(email) and email like '%_@_%'),
    password_hash         varchar(255) not null,
    role                  varchar(8)   not null default 'BUYER' check (role in ('BUYER', 'ADMIN')),
    is_blocked            boolean      not null default false,
    blocked_by            bigint       references users (id) on delete set null,
    blocked_at            timestamptz,
    failed_login_attempts smallint     not null default 0 check (failed_login_attempts >= 0),
    locked_until          timestamptz,
    last_login_at         timestamptz,
    created_at            timestamptz  not null default now(),
    updated_at            timestamptz  not null default now(),

    constraint ux_users_email unique (email),
    -- Bloqueio pelo administrador sempre tem data; o bloqueio automático usa locked_until.
    constraint ck_users_block_consistent check (is_blocked = (blocked_at is not null))
);

create trigger trg_users_touch before update on users
    for each row execute function touch_updated_at();

-- Token de renovação com rotação: cada uso emite um novo da mesma família e
-- revoga o anterior. Reuso de um token já trocado revoga a família inteira.
create table refresh_tokens (
    id          bigint      generated always as identity primary key,
    user_id     bigint      not null references users (id) on delete cascade,
    family_id   uuid        not null,
    token_hash  char(64)    not null,
    expires_at  timestamptz not null,
    revoked_at  timestamptz,
    replaced_by bigint      references refresh_tokens (id) on delete set null,
    created_at  timestamptz not null default now(),

    constraint ux_refresh_tokens_hash unique (token_hash),
    constraint ck_refresh_tokens_expiry check (expires_at > created_at)
);

create index ix_refresh_tokens_family on refresh_tokens (family_id);
create index ix_refresh_tokens_user_active on refresh_tokens (user_id) where revoked_at is null;

create table devices (
    id           bigint       generated always as identity primary key,
    user_id      bigint       not null references users (id) on delete cascade,
    push_token   varchar(255) not null,
    platform     varchar(8)   not null default 'ANDROID' check (platform in ('ANDROID')),
    created_at   timestamptz  not null default now(),
    last_seen_at timestamptz  not null default now(),

    -- Aparelho que troca de conta passa ao novo dono: upsert por push_token.
    constraint ux_devices_push_token unique (push_token)
);

create index ix_devices_user on devices (user_id);

-- ---------------------------------------------------------------------------
-- Acervo do comprador (sincronizado)
-- ---------------------------------------------------------------------------
-- As referências entre tabelas do acervo usam chave composta (user_id, id):
-- o banco recusa uma compra que aponte para a loja de outro usuário, mesmo
-- que o uuid venha adulterado do aparelho (RN08 garantida também no banco).

create table stores (
    id               uuid         primary key check (uuid_extract_version(id) = 7),
    user_id          bigint       not null references users (id) on delete cascade,
    name             varchar(120) not null check (length(trim(name)) > 0),
    country_code     char(2)      check (country_code ~ '^[A-Z]{2}$'),
    website          varchar(255) check (website ~* '^https?://'),
    row_version      integer      not null default 1,
    change_xid       xid8         not null default pg_current_xact_id(),
    last_mutation_id uuid,
    created_at       timestamptz  not null default now(),
    updated_at       timestamptz  not null default now(),
    deleted_at       timestamptz,

    constraint ux_stores_user_id unique (user_id, id)
);

create unique index ux_stores_user_name on stores (user_id, lower(name)) where deleted_at is null;
create index ix_stores_user_change on stores (user_id, change_xid);

create trigger trg_stores_touch before update on stores
    for each row execute function touch_synced_row();

create table product_groups (
    id               uuid         primary key check (uuid_extract_version(id) = 7),
    user_id          bigint       not null references users (id) on delete cascade,
    name             varchar(180) not null check (length(trim(name)) > 0),
    row_version      integer      not null default 1,
    change_xid       xid8         not null default pg_current_xact_id(),
    last_mutation_id uuid,
    created_at       timestamptz  not null default now(),
    updated_at       timestamptz  not null default now(),
    deleted_at       timestamptz,

    constraint ux_product_groups_user_id unique (user_id, id)
);

create index ix_product_groups_user_change on product_groups (user_id, change_xid);

create trigger trg_product_groups_touch before update on product_groups
    for each row execute function touch_synced_row();

create table purchases (
    id                  uuid          primary key check (uuid_extract_version(id) = 7),
    user_id             bigint        not null references users (id) on delete cascade,
    store_id            uuid          not null,
    product_description varchar(180)  not null check (length(trim(product_description)) > 0),
    tracking_code       varchar(40)   not null check (tracking_code ~ '^[A-Z0-9]{8,40}$'),
    purchase_date       date          not null,
    promised_date       date          not null,
    amount              numeric(12,2) not null check (amount > 0),
    shipping_amount     numeric(12,2) not null default 0 check (shipping_amount >= 0),
    currency            char(3)       not null references currencies (code),
    tax_amount          numeric(12,2) check (tax_amount > 0),
    tax_due_date        date,
    tax_paid_at         timestamptz,
    received_at         date,
    notes               text          check (length(notes) <= 2000),
    archived_at         timestamptz,
    tracking_checked_at timestamptz,
    row_version         integer       not null default 1,
    change_xid          xid8          not null default pg_current_xact_id(),
    last_mutation_id    uuid,
    created_at          timestamptz   not null default now(),
    updated_at          timestamptz   not null default now(),
    deleted_at          timestamptz,

    constraint ux_purchases_user_id unique (user_id, id),
    -- Loja em uso não pode ser apagada; a cascata da conta apaga as duas juntas
    -- (verificações 11 e 12 de schema-checks.sql).
    constraint fk_purchases_store foreign key (user_id, store_id) references stores (user_id, id),
    constraint ck_purchases_promised check (promised_date >= purchase_date),
    constraint ck_purchases_received check (received_at is null or received_at >= purchase_date),
    constraint ck_purchases_tax_due check (tax_due_date is null or tax_amount is not null),
    constraint ck_purchases_tax_paid check (tax_paid_at is null or tax_amount is not null)
);

create unique index ux_purchases_user_tracking on purchases (user_id, tracking_code) where deleted_at is null;
create index ix_purchases_user_change on purchases (user_id, change_xid);
create index ix_purchases_store on purchases (user_id, store_id);
-- Rotinas de alerta e de rastreio olham só compras em andamento.
create index ix_purchases_open_promised on purchases (promised_date)
    where deleted_at is null and received_at is null;
create index ix_purchases_open_tracking on purchases (tracking_checked_at nulls first)
    where deleted_at is null and received_at is null;

-- Só colunas do usuário avançam a versão. A rotina de rastreio grava
-- tracking_checked_at a cada 20 min; se isso avançasse row_version, toda edição
-- feita no aparelho entre duas consultas voltaria como conflito falso.
create trigger trg_purchases_touch
    before update of store_id, product_description, tracking_code, purchase_date,
                     promised_date, amount, shipping_amount, currency, tax_amount,
                     tax_due_date, tax_paid_at, received_at, notes, archived_at, deleted_at
    on purchases
    for each row execute function touch_synced_row();

create table offers (
    id               uuid          primary key check (uuid_extract_version(id) = 7),
    user_id          bigint        not null references users (id) on delete cascade,
    product_group_id uuid          not null,
    store_id         uuid          not null,
    price            numeric(12,2) not null check (price > 0),
    shipping_amount  numeric(12,2) not null default 0 check (shipping_amount >= 0),
    currency         char(3)       not null references currencies (code),
    product_url      varchar(500)  check (product_url ~* '^https?://'),
    purchase_id      uuid,
    row_version      integer       not null default 1,
    change_xid       xid8          not null default pg_current_xact_id(),
    last_mutation_id uuid,
    created_at       timestamptz   not null default now(),
    updated_at       timestamptz   not null default now(),
    deleted_at       timestamptz,

    constraint fk_offers_group foreign key (user_id, product_group_id) references product_groups (user_id, id),
    constraint fk_offers_store foreign key (user_id, store_id) references stores (user_id, id),
    -- Só purchase_id vira nulo: apagar a compra não pode apagar o dono da oferta.
    constraint fk_offers_purchase foreign key (user_id, purchase_id) references purchases (user_id, id)
        on delete set null (purchase_id),
    -- Uma oferta vira no máximo uma compra, e uma compra vem de no máximo uma oferta.
    constraint ux_offers_purchase unique (purchase_id)
);

create index ix_offers_user_group on offers (user_id, product_group_id) where deleted_at is null;
create index ix_offers_user_change on offers (user_id, change_xid);
create index ix_offers_store on offers (user_id, store_id);

create trigger trg_offers_touch before update on offers
    for each row execute function touch_synced_row();

-- ---------------------------------------------------------------------------
-- Rastreio e alertas
-- ---------------------------------------------------------------------------

create table tracking_events (
    id          bigint       generated always as identity primary key,
    purchase_id uuid         not null references purchases (id) on delete cascade,
    occurred_at timestamptz  not null,
    description varchar(255) not null,
    location    varchar(120),
    stage       varchar(24)  not null check (stage in (
                    'POSTED', 'ORIGIN_DEPARTURE', 'INTERNATIONAL_TRANSIT',
                    'ARRIVED_BRAZIL', 'CUSTOMS', 'AWAITING_PAYMENT',
                    'DOMESTIC_TRANSIT', 'OUT_FOR_DELIVERY',
                    'DELIVERED', 'RETURNED', 'OTHER')),
    -- SHA-256 de occurred_at (UTC) + descrição normalizada: a fonte devolve o
    -- histórico inteiro a cada consulta e não identifica os eventos.
    fingerprint char(64)     not null,
    change_xid  xid8         not null default pg_current_xact_id(),
    created_at  timestamptz  not null default now(),

    constraint ux_tracking_events_fingerprint unique (purchase_id, fingerprint)
);

-- RN01 (último evento classificado) e a linha do tempo: a consulta mais frequente.
create index ix_tracking_events_timeline on tracking_events (purchase_id, occurred_at desc);
create index ix_tracking_events_change on tracking_events (change_xid);

-- Livro de ocorrências: uma linha por (compra, motivo, ocorrência), nunca apagada
-- pela retenção. É o que impede o mesmo alerta de voltar depois de lido (RN06),
-- mesmo que a notificação em si já tenha sido removida pela RN11.
create table notification_occurrences (
    purchase_id    uuid        not null references purchases (id) on delete cascade,
    reason         varchar(16) not null check (reason in (
                       'TAX_DETECTED', 'TAX_DUE', 'TAX_OVERDUE',
                       'DELAYED', 'STALLED', 'CLAIM_WINDOW')),
    occurrence_key varchar(40) not null check (length(occurrence_key) > 0),
    created_at     timestamptz not null default now(),

    primary key (purchase_id, reason, occurrence_key)
);

create table notifications (
    id             bigint       generated always as identity primary key,
    user_id        bigint       not null,
    purchase_id    uuid         not null,
    reason         varchar(16)  not null,
    occurrence_key varchar(40)  not null,
    message        varchar(255) not null,
    read_at        timestamptz,
    -- Caixa de saída do push: o envio acontece fora da transação que criou o alerta.
    push_status    varchar(8)   not null default 'PENDING'
                   check (push_status in ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
    push_attempts  smallint     not null default 0 check (push_attempts >= 0),
    created_at     timestamptz  not null default now(),

    constraint fk_notifications_purchase foreign key (user_id, purchase_id)
        references purchases (user_id, id) on delete cascade,
    constraint fk_notifications_occurrence foreign key (purchase_id, reason, occurrence_key)
        references notification_occurrences (purchase_id, reason, occurrence_key) on delete cascade,
    constraint ux_notifications_occurrence unique (purchase_id, reason, occurrence_key)
);

create index ix_notifications_user_feed on notifications (user_id, created_at desc);
create index ix_notifications_user_unread on notifications (user_id) where read_at is null;
create index ix_notifications_push_outbox on notifications (created_at) where push_status = 'PENDING';

-- ---------------------------------------------------------------------------
-- Câmbio e parâmetros fiscais
-- ---------------------------------------------------------------------------

create table exchange_rates (
    id         bigint        generated always as identity primary key,
    currency   char(3)       not null references currencies (code),
    rate_date  date          not null,
    rate       numeric(18,6) not null check (rate > 0),
    source     varchar(8)    not null check (source in ('API', 'MANUAL')),
    created_by bigint        references users (id),
    fetched_at timestamptz   not null default now(),
    change_xid xid8          not null default pg_current_xact_id(),

    -- A manual convive com a automática da mesma data; a manual prevalece na leitura.
    constraint ux_exchange_rates_day unique (currency, rate_date, source),
    constraint ck_exchange_rates_author check ((source = 'MANUAL') = (created_by is not null))
);

create index ix_exchange_rates_change on exchange_rates (change_xid);

-- A cotação automática do dia é atualizada de hora em hora; a troca de valor
-- precisa chegar aos aparelhos, por isso o cursor avança também aqui.
create function touch_exchange_rate() returns trigger
language plpgsql as $$
begin
    new.change_xid := pg_current_xact_id();
    return new;
end;
$$;

create trigger trg_exchange_rates_touch before update on exchange_rates
    for each row execute function touch_exchange_rate();

create table tax_parameters (
    id                   bigint        generated always as identity primary key,
    valid_from           date          not null,
    threshold_usd        numeric(12,2) not null check (threshold_usd > 0),
    rate_up_to_threshold numeric(5,4)  not null check (rate_up_to_threshold between 0 and 1),
    rate_above_threshold numeric(5,4)  not null check (rate_above_threshold between 0 and 1),
    deduction_usd        numeric(12,2) not null default 0 check (deduction_usd >= 0),
    icms_rate            numeric(5,4)  not null check (icms_rate >= 0 and icms_rate < 1),
    created_by           bigint        not null references users (id),
    change_xid           xid8          not null default pg_current_xact_id(),
    created_at           timestamptz   not null default now(),

    constraint ux_tax_parameters_valid_from unique (valid_from)
);

create index ix_tax_parameters_change on tax_parameters (change_xid);

create trigger trg_tax_parameters_immutable before update or delete on tax_parameters
    for each row execute function forbid_change();

-- ---------------------------------------------------------------------------
-- Saúde das integrações
-- ---------------------------------------------------------------------------

create table integration_runs (
    id             bigint       generated always as identity primary key,
    integration    varchar(16)  not null check (integration in ('TRACKING', 'EXCHANGE_RATE')),
    source         varchar(24)  not null,
    status         varchar(8)   not null default 'RUNNING'
                   check (status in ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED')),
    started_at     timestamptz  not null default now(),
    finished_at    timestamptz,
    items_checked  integer      not null default 0 check (items_checked >= 0),
    items_imported integer      not null default 0 check (items_imported >= 0),
    failures       integer      not null default 0 check (failures >= 0),
    error_summary  varchar(255),

    constraint ck_integration_runs_finished check ((status = 'RUNNING') = (finished_at is null))
);

-- Duas instâncias do agendador não rodam a mesma integração ao mesmo tempo:
-- a segunda falha ao abrir a execução e desiste. Uma execução que o processo
-- deixou RUNNING ao cair travaria a integração; a rotina encerra como FAILED a
-- RUNNING com mais de duas vezes o intervalo antes de abrir a próxima.
create unique index ux_integration_runs_running on integration_runs (integration) where status = 'RUNNING';
create index ix_integration_runs_recent on integration_runs (integration, started_at desc);

commit;
