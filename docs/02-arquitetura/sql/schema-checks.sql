-- Importa Aí · verificação do esquema
--
-- Cada bloco prova uma garantia que o modelo de dados promete. Roda contra um
-- banco recém-criado por schema-postgres.sql e aborta na primeira falha.
-- No H-02 estes cenários viram testes de integração com Testcontainers.

\set ON_ERROR_STOP on

-- Dados de apoio: dois compradores e um administrador.
insert into users (name, email, password_hash, role) values
    ('Camila', 'camila@example.com', 'x', 'BUYER'),
    ('Rafael', 'rafael@example.com', 'x', 'BUYER'),
    ('Diego',  'diego@example.com',  'x', 'ADMIN');

create temporary table ids as
select (select id from users where email = 'camila@example.com') as camila,
       (select id from users where email = 'rafael@example.com') as rafael,
       (select id from users where email = 'diego@example.com')  as admin,
       uuidv7() as store_a, uuidv7() as store_b, uuidv7() as group_a,
       uuidv7() as purchase_a, uuidv7() as offer_a;

insert into stores (id, user_id, name)
select store_a, camila, 'Loja A' from ids union all
select store_b, rafael, 'Loja B' from ids;

insert into product_groups (id, user_id, name) select group_a, camila, 'Fone QCY T13' from ids;

insert into purchases (id, user_id, store_id, product_description, tracking_code,
                       purchase_date, promised_date, amount, currency)
select purchase_a, camila, store_a, 'Fone QCY T13', 'LP00123456789CN',
       date '2026-10-02', date '2026-10-28', 180, 'CNY' from ids;

insert into offers (id, user_id, product_group_id, store_id, price, currency, purchase_id)
select offer_a, camila, group_a, store_a, 180, 'CNY', purchase_a from ids;

-- 1. RN08 no banco: compra de Camila não pode apontar para a loja de Rafael.
do $$
begin
    insert into purchases (id, user_id, store_id, product_description, tracking_code,
                           purchase_date, promised_date, amount, currency)
    select uuidv7(), camila, store_b, 'Teclado', 'LP99999999999CN',
           date '2026-10-02', date '2026-10-20', 50, 'USD' from ids;
    raise exception 'FALHOU 1: compra aceitou loja de outro usuário';
exception when foreign_key_violation then
    raise notice 'ok 1: referência a loja de outro usuário recusada';
end $$;

-- 2. Identificadores do aparelho precisam ser uuid v7.
do $$
begin
    insert into stores (id, user_id, name) select gen_random_uuid(), camila, 'Loja v4' from ids;
    raise exception 'FALHOU 2: uuid v4 aceito';
exception when check_violation then
    raise notice 'ok 2: uuid fora da versão 7 recusado';
end $$;

-- 3. Código de rastreio único por usuário entre as compras não excluídas.
do $$
begin
    insert into purchases (id, user_id, store_id, product_description, tracking_code,
                           purchase_date, promised_date, amount, currency)
    select uuidv7(), camila, store_a, 'Outro', 'LP00123456789CN',
           date '2026-10-02', date '2026-10-28', 10, 'CNY' from ids;
    raise exception 'FALHOU 3: código duplicado aceito';
exception when unique_violation then
    raise notice 'ok 3: código de rastreio duplicado recusado';
end $$;

-- 4. Toda alteração avança row_version e change_xid (trava otimista e cursor).
do $$
declare
    before_version integer;
    before_xid     xid8;
    after_version  integer;
    after_xid      xid8;
begin
    select row_version, change_xid into before_version, before_xid
      from purchases where id = (select purchase_a from ids);
    perform pg_current_xact_id();
    update purchases set notes = 'presente' where id = (select purchase_a from ids);
    select row_version, change_xid into after_version, after_xid
      from purchases where id = (select purchase_a from ids);
    if after_version <> before_version + 1 then
        raise exception 'FALHOU 4: row_version não avançou';
    end if;
    if after_xid < before_xid then
        raise exception 'FALHOU 4: change_xid retrocedeu';
    end if;
    raise notice 'ok 4: row_version % -> %, change_xid avançou', before_version, after_version;
end $$;

-- 5. Trava otimista: atualização com versão velha não afeta nenhuma linha.
do $$
declare
    affected integer;
begin
    update purchases set notes = 'conflito'
     where id = (select purchase_a from ids) and row_version = 1;
    get diagnostics affected = row_count;
    if affected <> 0 then
        raise exception 'FALHOU 5: versão velha sobrescreveu';
    end if;
    raise notice 'ok 5: atualização com versão velha ignorada (0 linhas)';
end $$;

-- 6. RN06: a mesma ocorrência gera um único alerta, mesmo depois de lido e apagado.
do $$
declare
    inserted integer;
begin
    insert into notification_occurrences (purchase_id, reason, occurrence_key)
    select purchase_a, 'DELAYED', '2026-10-28' from ids;
    insert into notifications (user_id, purchase_id, reason, occurrence_key, message)
    select camila, purchase_a, 'DELAYED', '2026-10-28', 'Atrasada' from ids;

    -- Lido e removido pela retenção (RN11).
    delete from notifications where purchase_id = (select purchase_a from ids);

    -- A reavaliação seguinte tenta registrar a mesma ocorrência.
    insert into notification_occurrences (purchase_id, reason, occurrence_key)
    select purchase_a, 'DELAYED', '2026-10-28' from ids
    on conflict do nothing;
    get diagnostics inserted = row_count;
    if inserted <> 0 then
        raise exception 'FALHOU 6: ocorrência repetida gerou novo alerta';
    end if;
    raise notice 'ok 6: ocorrência já registrada não gera alerta de novo';
end $$;

-- 7. Deduplicação de eventos de rastreio.
do $$
begin
    insert into tracking_events (purchase_id, occurred_at, description, stage, fingerprint)
    select purchase_a, timestamptz '2026-10-03 10:00+00', 'Postado', 'POSTED', repeat('a', 64) from ids;
    insert into tracking_events (purchase_id, occurred_at, description, stage, fingerprint)
    select purchase_a, timestamptz '2026-10-03 10:00+00', 'Postado', 'POSTED', repeat('a', 64) from ids;
    raise exception 'FALHOU 7: evento duplicado aceito';
exception when unique_violation then
    raise notice 'ok 7: evento repetido recusado';
end $$;

-- 8. Parâmetros fiscais só recebem inserção.
insert into tax_parameters (valid_from, threshold_usd, rate_up_to_threshold,
                            rate_above_threshold, deduction_usd, icms_rate, created_by)
select date '2026-01-01', 50, 0.20, 0.60, 20, 0.17, admin from ids;

do $$
begin
    update tax_parameters set icms_rate = 0.18;
    raise exception 'FALHOU 8: parâmetro fiscal editado';
exception when restrict_violation then
    raise notice 'ok 8: parâmetro fiscal não aceita edição';
end $$;

-- 9. Cotação manual exige autor; automática não tem autor.
do $$
begin
    insert into exchange_rates (currency, rate_date, rate, source)
    values ('USD', date '2026-10-12', 5.52, 'MANUAL');
    raise exception 'FALHOU 9: cotação manual sem autor aceita';
exception when check_violation then
    raise notice 'ok 9: cotação manual sem autor recusada';
end $$;

-- 10. Duas execuções da mesma integração não rodam ao mesmo tempo.
insert into integration_runs (integration, source) values ('TRACKING', 'SIMULATED');
do $$
begin
    insert into integration_runs (integration, source) values ('TRACKING', 'SIMULATED');
    raise exception 'FALHOU 10: segunda execução simultânea aceita';
exception when unique_violation then
    raise notice 'ok 10: segunda execução simultânea recusada';
end $$;

-- 11. Excluir a conta apaga todo o acervo numa só cascata (RF-03), sem esbarrar
--     na restrição entre compras e lojas.
do $$
declare
    leftovers integer;
begin
    delete from users where id = (select camila from ids);
    select (select count(*) from stores   where user_id = (select camila from ids))
         + (select count(*) from purchases where user_id = (select camila from ids))
         + (select count(*) from offers    where user_id = (select camila from ids))
         + (select count(*) from notification_occurrences)
         + (select count(*) from tracking_events)
      into leftovers;
    if leftovers <> 0 then
        raise exception 'FALHOU 11: sobraram % linhas da conta excluída', leftovers;
    end if;
    raise notice 'ok 11: exclusão da conta removeu lojas, compras, ofertas, eventos e ocorrências';
end $$;

-- 12. Loja em uso não pode ser apagada fisicamente por fora da cascata da conta.
do $$
declare
    rafael_purchase uuid := uuidv7();
begin
    insert into purchases (id, user_id, store_id, product_description, tracking_code,
                           purchase_date, promised_date, amount, currency)
    select rafael_purchase, rafael, store_b, 'Mouse', 'LP11111111111CN',
           date '2026-10-01', date '2026-10-30', 20, 'USD' from ids;
    delete from stores where id = (select store_b from ids);
    raise exception 'FALHOU 12: loja em uso apagada';
exception when foreign_key_violation then
    raise notice 'ok 12: loja em uso protegida';
end $$;

-- 13. Cursor da sincronização: linha alterada numa transação ainda aberta
--     tem change_xid acima do xmin do retrato, então aparece no próximo pull.
do $$
declare
    cursor_xid xid8 := pg_snapshot_xmin(pg_current_snapshot());
    row_xid    xid8;
begin
    update stores set name = 'Loja B2' where id = (select store_b from ids)
    returning change_xid into row_xid;
    if row_xid < cursor_xid then
        raise exception 'FALHOU 13: alteração ficaria antes do cursor';
    end if;
    raise notice 'ok 13: alteração em curso fica no próximo pull (xid % >= cursor %)', row_xid, cursor_xid;
end $$;

-- 14. A rotina de rastreio não gera conflito falso: registrar a consulta à
--     fonte não avança a versão que o aparelho usa na trava otimista.
do $$
declare
    rafael_purchase uuid := uuidv7();
    version_before  integer;
    version_after   integer;
begin
    insert into purchases (id, user_id, store_id, product_description, tracking_code,
                           purchase_date, promised_date, amount, currency)
    select rafael_purchase, rafael, store_b, 'Cabo', 'LP22222222222CN',
           date '2026-10-01', date '2026-10-30', 5, 'USD' from ids;
    select row_version into version_before from purchases where id = rafael_purchase;
    update purchases set tracking_checked_at = now() where id = rafael_purchase;
    select row_version into version_after from purchases where id = rafael_purchase;
    if version_after <> version_before then
        raise exception 'FALHOU 14: consulta de rastreio avançou row_version';
    end if;
    update purchases set notes = 'editado' where id = rafael_purchase;
    select row_version into version_after from purchases where id = rafael_purchase;
    if version_after <> version_before + 1 then
        raise exception 'FALHOU 14: edição do usuário não avançou row_version';
    end if;
    raise notice 'ok 14: consulta de rastreio não mexe na versão; edição do usuário mexe';
end $$;

\echo 'Todas as verificações passaram.'
