# Modelo de domínio

As classes, os objetos de valor, as regras e os estados do Importa Aí, independentes de framework, banco ou tela. É a camada **Domínio** do app e a camada **Serviços** da API ([arquitetura](visao-geral.md)): o que se testa sem aparelho, rede nem banco (RNF-08).

O modelo relacional que persiste estas classes está em [modelo de dados](modelo-de-dados.md); a troca entre aparelho e servidor, em [sincronização](sincronizacao.md).

---

## Módulos e agregados

Um **agregado** é um grupo de objetos que muda junto e tem uma raiz responsável por suas regras. Nada fora do agregado altera suas partes diretamente.

| Módulo | Agregado (raiz) | Partes | Dono das regras |
|---|---|---|---|
| `acesso` | **User** | sessões (RefreshToken), aparelhos (Device) | API |
| `compras` | **Store** | · | App e API |
| `ofertas` | **ProductGroup** | ofertas (Offer) | App |
| `compras` | **Purchase** | taxa (TaxCharge), linha do tempo (TrackingEvent) | API |
| `alertas` | **Notification** | ocorrência (NotificationOccurrence) | API |
| `referencia` | **ExchangeRate** · **TaxParameters** | · | API publica; app consome |
| `rastreio` | **IntegrationRun** | · | API |

**Por que Offer fica dentro de ProductGroup:** a comparação (RF-06) e a indicação da menor oferta só fazem sentido no grupo; uma oferta solta não tem com o que ser comparada.

**Por que TrackingEvent fica dentro de Purchase:** eventos não existem sem a compra, são substituídos juntos quando o código de rastreio muda e são a única entrada da RN01.

---

## Diagrama de classes

```mermaid
classDiagram
    direction LR

    class User {
        +Long id
        +String name
        +Email email
        +Role role
        +AccountStatus status(Instant now)
        +registerFailedLogin(Instant now)
        +block(User admin, Instant now)
        +unblock()
    }

    class Store {
        +UUID id
        +String name
        +CountryCode country
        +URL website
        +rename(String name)
    }

    class ProductGroup {
        +UUID id
        +String name
        +List~Offer~ offers
        +Offer cheapest(CostEstimator estimator)
    }

    class Offer {
        +UUID id
        +Store store
        +Money price
        +Money shipping
        +URL productUrl
        +UUID purchaseId
        +Purchase convertToPurchase(TrackingCode code, LocalDate promised)
    }

    class Purchase {
        +UUID id
        +Store store
        +String productDescription
        +TrackingCode trackingCode
        +LocalDate purchaseDate
        +LocalDate promisedDate
        +Money amount
        +Money shipping
        +TaxCharge tax
        +LocalDate receivedAt
        +String notes
        +edit(PurchaseChanges changes, PurchaseState state)
        +changeTrackingCode(TrackingCode code)
        +registerTax(Money value, LocalDate dueDate)
        +payTax(Instant paidAt)
        +confirmReceipt(LocalDate date)
    }

    class TaxCharge {
        <<value object>>
        +Money amount
        +LocalDate dueDate
        +Instant paidAt
        +boolean isOverdue(LocalDate today)
    }

    class Money {
        <<value object>>
        +BigDecimal amount
        +CurrencyCode currency
        +Money plus(Money other)
        +Money times(BigDecimal factor)
    }

    class TrackingCode {
        <<value object>>
        +String value
    }

    class TrackingEvent {
        +Long id
        +Instant occurredAt
        +String description
        +String location
        +TrackingStage stage
        +String fingerprint
    }

    class PurchaseState {
        <<derived>>
        +PurchaseStatus status
        +Set~PurchaseFlag~ flags
        +TrackingStage currentStage
        +Instant lastEventAt
    }

    class PurchaseStatusResolver {
        <<domain service>>
        +PurchaseState resolve(Purchase p, List~TrackingEvent~ events, LocalDate today)
    }

    class AlertRule {
        <<interface>>
        +Optional~AlertCandidate~ evaluate(Purchase p, PurchaseState s, LocalDate today)
    }

    class AlertEvaluator {
        <<domain service>>
        +List~Notification~ evaluate(Purchase p, PurchaseState s, LocalDate today)
    }

    class Notification {
        +Long id
        +NotificationReason reason
        +String occurrenceKey
        +String message
        +Instant readAt
        +PushStatus pushStatus
        +markRead(Instant at)
    }

    class ExchangeRate {
        +CurrencyCode currency
        +LocalDate rateDate
        +BigDecimal rate
        +RateSource source
        +Instant fetchedAt
    }

    class TaxParameters {
        +LocalDate validFrom
        +BigDecimal thresholdUsd
        +BigDecimal rateUpToThreshold
        +BigDecimal rateAboveThreshold
        +BigDecimal deductionUsd
        +BigDecimal icmsRate
    }

    class CurrencyConverter {
        <<domain service>>
        +Conversion toBrl(Money value, LocalDate date)
    }

    class CostEstimator {
        <<domain service>>
        +CostEstimate estimate(Money price, Money shipping, LocalDate date)
    }

    class CostEstimate {
        <<value object>>
        +Money customsValue
        +Money importTax
        +Money icms
        +Money total
        +boolean isApproximateRate
    }

    ProductGroup "1" *-- "1..*" Offer
    Offer "*" --> "1" Store
    Offer "0..1" --> "0..1" Purchase : vira
    Purchase "*" --> "1" Store
    Purchase "1" *-- "0..1" TaxCharge
    Purchase "1" *-- "*" TrackingEvent
    Purchase ..> Money
    Purchase ..> TrackingCode
    PurchaseStatusResolver ..> PurchaseState : produz
    AlertEvaluator --> "*" AlertRule
    AlertEvaluator ..> Notification : cria
    CostEstimator --> CurrencyConverter
    CostEstimator ..> TaxParameters
    CostEstimator ..> CostEstimate : produz
    CurrencyConverter ..> ExchangeRate
    User "1" --> "*" Purchase : dono
```

Tipos em notação Java, a da API. No app os nomes são os mesmos, em TypeScript; `BigDecimal` vira aritmética decimal e dinheiro é guardado em centavos (`Money.amountMinor`).

---

## Objetos de valor

Imutáveis, comparados pelo conteúdo e **válidos por construção**: um `TrackingCode` inválido não chega a existir, então nenhum método precisa revalidá-lo.

| Objeto | Invariante | Onde a violação aparece |
|---|---|---|
| `Money` | Valor com 2 casas; operações só entre a mesma moeda | Exceção de programação (erro de código, não de usuário) |
| `TrackingCode` | Maiúsculas, sem espaços, `^[A-Z0-9]{8,40}$` | `VALIDATION_ERROR` no campo `trackingCode` |
| `Email` | Minúsculas, com `@` e domínio | `VALIDATION_ERROR` no campo `email` |
| `TaxCharge` | Valor > 0; vencimento e pagamento exigem valor | `VALIDATION_ERROR` no campo da taxa |
| `CostEstimate` | `total = customsValue + importTax + icms`, parcela por parcela | Garantido pela construção |

**Arredondamento (RN10):** cada parcela é arredondada para centavos (meio para cima) **antes** de somar. O total exibido é sempre a soma das parcelas exibidas; o usuário nunca vê R$ 0,01 de diferença entre as linhas e o total.

---

## Enumerações

| Enum | Valores |
|---|---|
| `Role` | `BUYER`, `ADMIN` |
| `AccountStatus` | `ACTIVE`, `LOCKED` (bloqueio automático, temporário), `BLOCKED` (pelo administrador) |
| `TrackingStage` | `POSTED`, `ORIGIN_DEPARTURE`, `INTERNATIONAL_TRANSIT`, `ARRIVED_BRAZIL`, `CUSTOMS`, `AWAITING_PAYMENT`, `DOMESTIC_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RETURNED`, `OTHER` |
| `PurchaseStatus` | `AWAITING_POSTING`, `INTERNATIONAL_TRANSIT`, `IN_BRAZIL`, `DELIVERED`, `RETURNED` |
| `PurchaseFlag` | `TAX_TO_REGISTER`, `TAX_PENDING`, `TAX_OVERDUE`, `DELAYED`, `STALLED`, `CLAIM_WINDOW_CLOSING`, `CLAIM_WINDOW_CLOSED` |
| `NotificationReason` | `TAX_DETECTED`, `TAX_DUE`, `TAX_OVERDUE`, `DELAYED`, `STALLED`, `CLAIM_WINDOW` |
| `PushStatus` | `PENDING`, `SENT`, `FAILED`, `SKIPPED` |
| `RateSource` | `API`, `MANUAL` |

---

## Serviços de domínio

Regras que envolvem mais de um objeto ficam em serviços sem estado. Todos recebem a data corrente (`today`) ou um `Clock` como parâmetro: nenhum lê o relógio do sistema, então os testes fixam "hoje" em 12/10/2026 sem truque.

| Serviço | Regras | Lado | Entrada → saída |
|---|---|:---:|---|
| `CurrencyConverter` | RN07 | App | valor + data → valor em reais, com aviso de cotação aproximada ou desatualizada |
| `CostEstimator` | RN10 | App | preço + frete + data → `CostEstimate` com as três parcelas |
| `PurchaseStatusResolver` | RN01, RN02, RN03, RN04, RN05 | API | compra + eventos + hoje → `PurchaseState` |
| `AlertEvaluator` | RN06 | API | compra + estado + hoje → alertas novos, um por ocorrência |
| `TrackingImporter` | RF-13 | API | eventos da fonte → eventos novos (deduplicados pelo `fingerprint`) |
| `TaxReminderScheduler` | RN04 (lembretes) | App | taxa registrada → três lembretes locais agendados |

### Regras de alerta (padrão Strategy)

Cada motivo de alerta é uma implementação de `AlertRule`. O `AlertEvaluator` roda todas e registra só as ocorrências novas. Acrescentar um motivo é acrescentar uma classe, sem tocar nas outras.

| Implementação | Dispara quando | Chave de ocorrência |
|---|---|---|
| `TaxDetectedRule` | Último evento é `AWAITING_PAYMENT` e não há taxa registrada | `E<id do evento>` |
| `TaxDueRule` | Faltam 5, 2 ou 0 dias para o vencimento, taxa não paga | `D-5:<vencimento>` · `D-2:…` · `D-0:…` |
| `TaxOverdueRule` | Vencimento passou sem pagamento | `<vencimento>` |
| `DelayedRule` | Hoje > prazo prometido e situação não final | `<prazo prometido>` |
| `StalledRule` | Em trânsito e 15 dias ou mais sem evento | `E<id do último evento>` |
| `ClaimWindowRule` | Faltam 3 dias ou menos para prazo + 30, sem entrega | `<data de fechamento>` |

A chave identifica **o fato**, não o momento da avaliação. Por isso a mesma condição reavaliada a cada 20 minutos cai na mesma chave e não gera outro alerta, e um fato novo (outro prazo, outro vencimento, outro evento) gera uma chave nova ([ADR-010](decisoes/adr-010-ocorrencia-de-alerta.md)).

`TAX_DUE` é gravado para aparecer na aba Alertas, mas com `PushStatus.SKIPPED`: quem avisa com o app fechado é o lembrete local, que funciona sem rede (ADR-007). Sem isso o usuário receberia o mesmo aviso duas vezes.

---

## Estados

### Situação da compra (RN01)

Derivada, nunca gravada. Vem do último evento **classificado** (`OTHER` é ignorado) ou da confirmação manual de recebimento.

```mermaid
stateDiagram-v2
    [*] --> AWAITING_POSTING
    AWAITING_POSTING --> INTERNATIONAL_TRANSIT: POSTED · ORIGIN_DEPARTURE · INTERNATIONAL_TRANSIT
    INTERNATIONAL_TRANSIT --> IN_BRAZIL: ARRIVED_BRAZIL · CUSTOMS · AWAITING_PAYMENT · DOMESTIC_TRANSIT · OUT_FOR_DELIVERY
    AWAITING_POSTING --> IN_BRAZIL: evento nacional sem trecho internacional
    IN_BRAZIL --> DELIVERED: DELIVERED
    INTERNATIONAL_TRANSIT --> DELIVERED: recebimento confirmado pelo usuário
    IN_BRAZIL --> DELIVERED: recebimento confirmado pelo usuário
    AWAITING_POSTING --> DELIVERED: recebimento confirmado pelo usuário
    INTERNATIONAL_TRANSIT --> RETURNED: RETURNED
    IN_BRAZIL --> RETURNED: RETURNED
    DELIVERED --> [*]
    RETURNED --> [*]
```

**Confirmação manual de recebimento** (`received_at`): a fonte de rastreio pode parar de atualizar antes da entrega. Sem esta saída, uma compra já recebida ficaria "atrasada" para sempre e continuaria gerando alertas. A confirmação é dado do usuário, não derivado, e prevalece sobre os eventos.

Em situação final (`DELIVERED`, `RETURNED`) nenhuma sinalização vale e a RN09 protege valores, datas, loja e código.

### Conta

```mermaid
stateDiagram-v2
    [*] --> ACTIVE
    ACTIVE --> LOCKED: 5ª falha de login
    LOCKED --> ACTIVE: 15 minutos depois
    ACTIVE --> BLOCKED: administrador bloqueia
    LOCKED --> BLOCKED: administrador bloqueia
    BLOCKED --> ACTIVE: administrador reativa
```

`LOCKED` vem de `locked_until > agora`; `BLOCKED`, de `is_blocked`. Ao bloquear, a API revoga todos os tokens de renovação da conta ([ADR-009](decisoes/adr-009-sessao-e-revogacao.md)).

### Registro local na sincronização

```mermaid
stateDiagram-v2
    [*] --> PENDING: criado ou editado no aparelho
    PENDING --> SYNCED: servidor aceita
    PENDING --> REJECTED: servidor recusa (regra ou conflito)
    REJECTED --> PENDING: usuário corrige
    REJECTED --> SYNCED: usuário descarta e fica a versão do servidor
    SYNCED --> PENDING: nova edição
```

### Execução de integração

`RUNNING` → `SUCCESS` (todas as consultas ok) · `PARTIAL` (alguma falhou ou o tempo acabou) · `FAILED` (nenhuma concluiu, ou execução órfã). O banco impede duas execuções `RUNNING` da mesma integração.

**Tempo por rodada:** cada execução tem como orçamento o intervalo da própria rotina (20 min no rastreio, 1 h na cotação). Esgotado, ela encerra como `PARTIAL`, e as compras que faltaram vão primeiro na próxima rodada, porque a fila é por `tracking_checked_at nulls first`.

**Execução órfã:** se o processo cai no meio da rodada (deploy, falha, falta de memória), a linha fica `RUNNING` e o índice único bloquearia a integração para sempre. Como nenhuma execução legítima passa do orçamento, uma `RUNNING` iniciada há mais de **duas vezes o intervalo** só pode ser órfã. Antes de abrir cada execução, numa transação própria, a rotina a encerra:

```sql
update integration_runs
   set status = 'FAILED', finished_at = now(), error_summary = 'Execução interrompida sem encerramento'
 where integration = ? and status = 'RUNNING' and started_at < now() - ?::interval;
```

A instrução é idempotente e segura com duas instâncias: a que chegar depois não encontra linha e segue para a abertura, onde o índice único decide quem roda. A execução encerrada assim aparece em T15 como falha, com a causa.

---

## Invariantes da compra

Toda regra tem um lugar onde é **garantida**. Validar no app é experiência de uso; garantir é no servidor ou no banco.

| Invariante | App (experiência) | API (regra) | Banco (garantia) |
|---|:---:|:---:|:---:|
| Valor > 0, frete ≥ 0, prazo ≥ data da compra | valida no campo | revalida | `check` |
| Data da compra não futura | valida no campo | revalida | · (depende de "hoje") |
| Código único por usuário entre as ativas | aviso no campo | `TRACKING_CODE_DUPLICATED` | índice único parcial |
| Loja pertence ao mesmo usuário | · | `NOT_FOUND` | FK composta `(user_id, store_id)` |
| Compra concluída não muda (RN09) | trava os campos | `PURCHASE_CONCLUDED` | · (depende da situação derivada) |
| Trocar o código apaga a linha do tempo | avisa antes | apaga os eventos na mesma transação | · |
| Taxa: vencimento e pagamento exigem valor | valida | revalida | `check` |

---

## Portas

Interfaces declaradas pelo domínio e implementadas na camada de dados. O domínio nunca conhece HTTP, SQL ou Expo.

| Porta | Lado | Implementações |
|---|:---:|---|
| `TrackingSource` | API | `SimulatedTrackingSource`, `SeventeenTrackSource` ([ADR-005](decisoes/adr-005-fonte-de-rastreio.md)) |
| `ExchangeRateSource` | API | `AwesomeApiSource` (do dia), `PtaxSource` (histórica) ([ADR-006](decisoes/adr-006-fonte-de-cotacao.md)) |
| `PushSender` | API | `ExpoPushSender` ([ADR-007](decisoes/adr-007-notificacoes.md)) |
| `Clock` | ambos | relógio do sistema em produção; fixo nos testes |
| Repositórios (`PurchaseRepository`, …) | App | SQLite |
| DAOs (`PurchaseDao`, …) | API | `JdbcTemplate` (sem interface: o banco não é trocável, [arquitetura](visao-geral.md#api)) |
