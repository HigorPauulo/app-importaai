-- Importa Aí · base local do aparelho (SQLite, expo-sqlite)
--
-- Vira a migration 1 do app (src/shared/db/migrations) sem alteração.
-- A versão aplicada fica em PRAGMA user_version; ao abrir a base o app liga
-- PRAGMA foreign_keys = ON e PRAGMA journal_mode = WAL.
--
-- Convenções
--   * Uma base por conta: ao encerrar a sessão, a base é apagada (T09 avisa se
--     houver alteração pendente). Por isso não existe user_id nas tabelas.
--   * Dinheiro em INTEGER na menor unidade da moeda (centavos): SQLite não tem
--     decimal e float erra em dinheiro. Cotações e alíquotas em TEXT decimal,
--     calculadas no domínio com aritmética decimal.
--   * Datas em TEXT ISO 8601 ('2026-10-12'); instantes em TEXT UTC ('2026-10-12T17:30:05Z').
--   * Tabelas editáveis no aparelho têm os campos de sincronização:
--       row_version  versão do servidor que esta cópia conhece (0 = nunca enviada)
--       sync_state   SYNCED, PENDING (a enviar) ou REJECTED (recusada, com motivo)
--       mutation_id  identificador da alteração pendente, reenviado igual até ser aceito
--       conflict_snapshot  versão do servidor recebida num conflito, até o usuário escolher

create table currencies (
    code        text    primary key check (length(code) = 3),
    name        text    not null,
    minor_units integer not null check (minor_units between 0 and 4),
    is_active   integer not null default 1 check (is_active in (0, 1))
);

create table stores (
    id                 text    primary key,
    name               text    not null check (length(trim(name)) > 0),
    country_code       text    check (country_code is null or length(country_code) = 2),
    website            text,
    row_version        integer not null default 0,
    sync_state         text    not null default 'PENDING' check (sync_state in ('SYNCED', 'PENDING', 'REJECTED')),
    mutation_id        text,
    sync_error_code    text,
    conflict_snapshot  text    check (conflict_snapshot is null or json_valid(conflict_snapshot)),
    created_at         text    not null,
    updated_at         text    not null,
    deleted_at         text
);

create unique index ux_stores_name on stores (lower(name)) where deleted_at is null;

create table product_groups (
    id                 text    primary key,
    name               text    not null check (length(trim(name)) > 0),
    row_version        integer not null default 0,
    sync_state         text    not null default 'PENDING' check (sync_state in ('SYNCED', 'PENDING', 'REJECTED')),
    mutation_id        text,
    sync_error_code    text,
    conflict_snapshot  text    check (conflict_snapshot is null or json_valid(conflict_snapshot)),
    created_at         text    not null,
    updated_at         text    not null,
    deleted_at         text
);

create table purchases (
    id                  text    primary key,
    store_id            text    not null references stores (id),
    product_description text    not null check (length(trim(product_description)) > 0),
    tracking_code       text    not null,
    purchase_date       text    not null,
    promised_date       text    not null check (promised_date >= purchase_date),
    amount_minor        integer not null check (amount_minor > 0),
    shipping_minor      integer not null default 0 check (shipping_minor >= 0),
    currency            text    not null references currencies (code),
    tax_minor           integer check (tax_minor is null or tax_minor > 0),
    tax_due_date        text    check (tax_due_date is null or tax_minor is not null),
    tax_paid_at         text    check (tax_paid_at is null or tax_minor is not null),
    received_at         text    check (received_at is null or received_at >= purchase_date),
    notes               text,
    archived_at         text,
    row_version         integer not null default 0,
    sync_state          text    not null default 'PENDING' check (sync_state in ('SYNCED', 'PENDING', 'REJECTED')),
    mutation_id         text,
    sync_error_code     text,
    conflict_snapshot   text    check (conflict_snapshot is null or json_valid(conflict_snapshot)),
    created_at          text    not null,
    updated_at          text    not null,
    deleted_at          text
);

create unique index ux_purchases_tracking on purchases (tracking_code) where deleted_at is null;
create index ix_purchases_store on purchases (store_id);
create index ix_purchases_promised on purchases (promised_date) where deleted_at is null;

create table offers (
    id                 text    primary key,
    product_group_id   text    not null references product_groups (id),
    store_id           text    not null references stores (id),
    price_minor        integer not null check (price_minor > 0),
    shipping_minor     integer not null default 0 check (shipping_minor >= 0),
    currency           text    not null references currencies (code),
    product_url        text,
    purchase_id        text    unique references purchases (id) on delete set null,
    row_version        integer not null default 0,
    sync_state         text    not null default 'PENDING' check (sync_state in ('SYNCED', 'PENDING', 'REJECTED')),
    mutation_id        text,
    sync_error_code    text,
    conflict_snapshot  text    check (conflict_snapshot is null or json_valid(conflict_snapshot)),
    created_at         text    not null,
    updated_at         text    not null,
    deleted_at         text
);

create index ix_offers_group on offers (product_group_id) where deleted_at is null;
create index ix_offers_store on offers (store_id);

-- Somente leitura no aparelho: chegam inteiras pela sincronização.

create table tracking_events (
    id          integer primary key,
    purchase_id text    not null references purchases (id) on delete cascade,
    occurred_at text    not null,
    description text    not null,
    location    text,
    stage       text    not null
);

create index ix_tracking_events_timeline on tracking_events (purchase_id, occurred_at desc);

-- Situação e sinalizações calculadas pela API (RN01 a RN05), guardadas só para
-- exibir sem rede. Cache: reescrito a cada pull, nunca editado nem calculado aqui.
create table purchase_states (
    purchase_id   text primary key references purchases (id) on delete cascade,
    status        text not null check (status in (
                      'AWAITING_POSTING', 'INTERNATIONAL_TRANSIT', 'IN_BRAZIL', 'DELIVERED', 'RETURNED')),
    flags         text not null default '[]' check (json_valid(flags)),
    current_stage text,
    last_event_at text,
    computed_at   text not null
);

create table notifications (
    id           integer primary key,
    purchase_id  text    not null,
    reason       text    not null,
    message      text    not null,
    created_at   text    not null,
    read_at      text,
    -- Leitura feita sem rede, ainda não enviada no push.
    read_pending integer not null default 0 check (read_pending in (0, 1))
);

create index ix_notifications_feed on notifications (created_at desc);

create table exchange_rates (
    currency   text not null references currencies (code),
    rate_date  text not null,
    source     text not null check (source in ('API', 'MANUAL')),
    rate       text not null,
    fetched_at text not null,
    primary key (currency, rate_date, source)
);

create table tax_parameters (
    id                   integer primary key,
    valid_from           text    not null unique,
    threshold_usd        text    not null,
    rate_up_to_threshold text    not null,
    rate_above_threshold text    not null,
    deduction_usd        text    not null,
    icms_rate            text    not null
);

-- Uma linha só: de quem é a base e até onde ela está sincronizada.
create table sync_state (
    id              integer primary key check (id = 1),
    owner_user_id   integer not null,
    cursor          text,
    last_success_at text,
    last_attempt_at text,
    last_error_code text
);

insert into currencies (code, name, minor_units) values
    ('USD', 'Dólar americano', 2),
    ('CNY', 'Yuan chinês', 2),
    ('EUR', 'Euro', 2);
