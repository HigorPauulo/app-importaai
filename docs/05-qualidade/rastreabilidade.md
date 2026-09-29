# Rastreabilidade

Liga cada requisito à regra que o governa, aos dados que usa, às telas que o mostram, aos testes que o verificam e ao código que o implementa. Atualizada a cada ciclo; a coluna de código recebe o PR que entregou o requisito.

---

## Requisitos

| RF | Regras | Tabelas | Telas | Testes | Ciclo | PR |
|:---:|:---:|---|:---:|:---:|:---:|:---:|
| RF-01 | RN08 | users | T02 | CT-01, CT-02 | 1 | |
| RF-02 | RN08 | users, refresh_tokens | T01 | CT-03 a CT-05 | 1 | |
| RF-03 | RN08 | users, refresh_tokens, devices | T09 | CT-06, CT-54, CT-60, CT-61 | 1 | |
| RF-04 | RN08 | product_groups, offers, stores | T10, T11 | CT-07, CT-08 | 2 | |
| RF-05 | RN07, RN10 | offers, exchange_rates, tax_parameters | T11 | CT-09 a CT-11 | 2 | |
| RF-06 | RN07, RN10 | product_groups, offers | T12 | CT-12 | 2 | |
| RF-07 | · | offers, purchases | T05, T11, T12 | CT-13 | 2 | |
| RF-08 | RN09 | purchases, stores | T05 | CT-14 a CT-16 | 2 | |
| RF-09 | RN01, RN07 | purchases, tracking_events, exchange_rates | T04 | CT-17, CT-18 | 2 | |
| RF-10 | RN01, RN09 | purchases | T04, T05 | CT-19, CT-20, CT-53 | 2 | |
| RF-11 | RN09 | purchases | T03, T04 | CT-21, CT-22 | 2 | |
| RF-12 | · | stores, offers, purchases | T07 | CT-23, CT-24, CT-59 | 1 | |
| RF-13 | RN01 | tracking_events, integration_runs | T03, T04 | CT-25 a CT-27 | 3 | |
| RF-14 | RN01 | purchases | T03 | CT-28, CT-29 | 2 | |
| RF-15 | RN02, RN03, RN05, RN06 | purchases, notification_occurrences, notifications | T03, T08 | CT-30 a CT-32 | 3 | |
| RF-16 | RN04, RN06 | purchases, tracking_events, notification_occurrences, notifications | T04, T08 | CT-33, CT-34 | 3 | |
| RF-17 | RN06, RN11 | notification_occurrences, notifications | T08 | CT-35, CT-36, CT-56 | 3 | |
| RF-18 | RN01, RN07 | purchases, exchange_rates | T06 | CT-37, CT-38 | 4 | |
| RF-19 | RN02 | purchases, stores | T06 | CT-39 | 4 | |
| RF-20 | · | base local, colunas de sincronização | T03, T04, T10 | CT-40 a CT-42, CT-48 a CT-52, CT-57, CT-59 | 3 | |
| RF-21 | RN08 | users, refresh_tokens, devices | T13 | CT-43, CT-44, CT-54, CT-60 | 4 | |
| RF-22 | RN07, RN10 | exchange_rates, tax_parameters | T14 | CT-45, CT-46 | 4 | |
| RF-23 | RN03 | integration_runs, purchases | T15 | CT-47, CT-58 | 4 | |

---

## Regras

| Regra | Requisitos | Testes |
|---|---|:---:|
| RN01 Situação derivada | RF-09, RF-10, RF-13, RF-14, RF-18 | CT-17, CT-27, CT-53, CT-57 |
| RN02 Atraso | RF-15, RF-19 | CT-30, CT-39 |
| RN03 Pacote parado | RF-15, RF-23 | CT-31, CT-47 |
| RN04 Taxa com prazo | RF-16 | CT-33, CT-34, CT-61 |
| RN05 Janela de reclamação | RF-15 | CT-32 |
| RN06 Alerta sem repetição | RF-15, RF-16, RF-17 | CT-35, CT-56 |
| RN07 Conversão de moeda | RF-05, RF-06, RF-09, RF-18, RF-22 | CT-10, CT-18, CT-37 |
| RN08 Isolamento por perfil | RF-01 a RF-04, RF-21 | CT-43, CT-44; verificação 1 do esquema |
| RN09 Compra concluída não muda | RF-08, RF-10, RF-11 | CT-20, CT-22 |
| RN10 Imposto estimado | RF-05, RF-06, RF-22 | CT-09, CT-11, CT-46 |
| RN11 Retenção de alertas | RF-17 | CT-36, CT-56 |

---

## Pendências

| Pendência | Impacto | Prazo |
|---|---|:---:|
| Ligações de navegação do protótipo | O protótipo existe, mas ainda não navega | Entrega N1 |
| Parâmetros fiscais iniciais conferidos na legislação | RN10 sem base real | Ciclo 2 |
| Fontes de cotação validadas quanto a limite de uso | RF-05 e RF-09 dependem delas | Ciclo 2 |
| Fonte de rastreio real validada | RF-13 depende do adaptador simulado | Ciclo 3 |
| Colunas de PR e resultado dos testes | Preenchidas conforme a implementação avança | a cada ciclo |
