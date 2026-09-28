# Contrato da API

Rotas, formatos e erros da API REST consumida pelo app.

---

## Convenções

| Item | Padrão |
|---|---|
| Base | `https://<host>/api/v1` |
| Formato | JSON em UTF-8; datas em ISO 8601 (`2026-10-12`, `2026-10-12T14:32:00-03:00`); valores monetários como texto decimal (`"180.00"`) |
| Autenticação | `Authorization: Bearer <token de acesso>` em toda rota que não seja de login, cadastro, renovação ou saída. Acesso de 15 min; renovação de 7 dias, opaca e rotativa ([ADR-009](decisoes/adr-009-sessao-e-revogacao.md)) |
| Identificadores | UUID v7 nas entidades criadas no aparelho (lojas, grupos, ofertas, compras); número nas demais |
| Recurso de outro usuário | Responde **404**, nunca 403 (RN08) |

---

## Rotas

### Acesso

| Método | Rota | Perfil | Requisito |
|:---:|---|:---:|:---:|
| POST | `/auth/register` | público | RF-01 |
| POST | `/auth/login` | público | RF-02 |
| POST | `/auth/refresh` | público, com token de renovação | RF-02; troca o token usado por um novo (rotação, [ADR-009](decisoes/adr-009-sessao-e-revogacao.md)) |
| POST | `/auth/logout` | público, com token de renovação | RF-03; corpo `{ "refreshToken", "pushToken" }`. Revoga a família do token e remove o aparelho do `pushToken`, se for do mesmo usuário. Idempotente: token já revogado responde 204. Usa o token de renovação, e não o de acesso, porque uma saída feita sem rede é enviada depois, quando o acesso já expirou |
| GET · PATCH · DELETE | `/me` | autenticado | RF-03; excluir a conta revoga todas as sessões e apaga o acervo |
| POST | `/devices` | autenticado | Registro do token de push, após cada login; o token passa ao usuário da sessão |

### Sincronização (comprador)

| Método | Rota | Uso |
|:---:|---|---|
| POST | `/sync/push` | Envia em lote (até 200 itens) lojas, grupos, ofertas e compras criadas, alteradas ou excluídas no aparelho, e os alertas lidos |
| GET | `/sync/pull?cursor=<cursor>` | Devolve o que mudou desde o cursor, os retratos (situação das compras, alertas, moedas) e o novo cursor. Sem cursor, ou com cursor de mais de 30 dias, devolve tudo com `reset: true` |

Todo o CRUD do comprador passa pela sincronização, porque o app grava primeiro no aparelho. Cada item enviado leva `mutationId` (idempotência) e `baseVersion` (trava otimista); a resposta é por item. Protocolo, formatos completos e a tabela de decisão por item em [sincronização](sincronizacao.md).

```json
POST /sync/push
{ "items": [
    { "entity": "purchase", "op": "upsert", "id": "0192f3a1-7c4e-7b2a-9d10-5b8e2c1f4a77",
      "mutationId": "0192f3a2-0000-7000-8000-000000000002", "baseVersion": 0,
      "data": { "storeId": "0192f39e-11aa-7c3d-8e20-1f2d3c4b5a69",
                "productDescription": "Fone Bluetooth QCY T13", "trackingCode": "LP00123456789CN",
                "purchaseDate": "2026-10-02", "promisedDate": "2026-10-28",
                "amount": "180.00", "shippingAmount": "0.00", "currency": "CNY" } }
  ],
  "readNotifications": [1042] }

200 OK
{ "results": [ { "id": "0192f3a1-…", "status": "accepted", "version": 1 } ] }
```

```json
GET /sync/pull?cursor=eyJ4aWQiOiI3ODIi...

200 OK
{ "cursor": "eyJ4aWQiOiI5MTAi...", "reset": false,
  "stores": [], "productGroups": [], "offers": [],
  "purchases": [ { "id": "0192f3a1-…", "rowVersion": 2, "deletedAt": null, "…": "…" } ],
  "timelines": [ { "purchaseId": "0192f3a1-…", "events": [
      { "id": 88, "occurredAt": "2026-10-12T09:14:00Z", "description": "Aguardando pagamento",
        "location": "Curitiba/PR", "stage": "AWAITING_PAYMENT" } ] } ],
  "purchaseStates": [ { "purchaseId": "0192f3a1-…", "status": "IN_BRAZIL",
      "flags": ["TAX_TO_REGISTER"], "currentStage": "AWAITING_PAYMENT",
      "lastEventAt": "2026-10-12T09:14:00Z", "computedAt": "2026-10-12T17:30:05Z" } ],
  "notifications": [ { "id": 1044, "purchaseId": "0192f3a1-…", "reason": "TAX_DETECTED",
      "message": "Sua compra foi taxada. Registre o valor e o vencimento.",
      "createdAt": "2026-10-12T09:20:00Z", "readAt": null } ],
  "exchangeRates": [ { "currency": "CNY", "rateDate": "2026-10-12", "rate": "0.735600",
      "source": "API", "fetchedAt": "2026-10-12T17:00:00Z" } ],
  "taxParameters": [], "currencies": [ { "code": "CNY", "name": "Yuan chinês", "minorUnits": 2 } ] }
```

### Administração

| Método | Rota | Requisito |
|:---:|---|:---:|
| GET | `/admin/users?query=&status=` | RF-21 |
| POST | `/admin/users/{id}/block` · `/admin/users/{id}/unblock` | RF-21 |
| GET · POST | `/admin/exchange-rates` | RF-22 |
| GET · POST | `/admin/tax-parameters` | RF-22 |
| GET | `/admin/integration-health` | RF-23 |

Não existe rota de administrador que devolva oferta, compra ou evento de rastreio (RN08).

---

## Erros

```json
{ "code": "TRACKING_CODE_DUPLICATED", "message": "Você já cadastrou este código.", "field": "trackingCode" }
```

`code` é estável e o app o usa para escolher a mensagem e o campo; `message` é apoio para depuração.

| HTTP | Quando |
|:---:|---|
| 400 | Formato inválido (campo ausente, tipo errado) |
| 401 | Sem sessão ou sessão expirada |
| 404 | Recurso inexistente ou de outro usuário |
| 409 | Conflito de unicidade |
| 410 | Token de renovação expirado, revogado ou reutilizado |
| 422 | Regra de negócio violada |
| 423 | Conta bloqueada |
| 503 | Serviço externo indisponível, quando a rota depende dele |

Na sincronização, erros de item vêm dentro de `results` com HTTP 200; os códigos HTTP acima valem para a requisição inteira.

| Código | HTTP | Regra |
|---|:---:|---|
| `VALIDATION_ERROR` | 400 | Formato |
| `INVALID_CREDENTIALS` | 401 | RF-02 |
| `ACCOUNT_LOCKED` | 423 | RF-02, bloqueio automático; traz `retryAfterSeconds` |
| `ACCOUNT_BLOCKED` | 423 | RF-21, bloqueio pelo administrador |
| `EMAIL_TAKEN` | 409 | RF-01 |
| `TRACKING_CODE_DUPLICATED` | 409 | RF-08 |
| `STORE_NAME_TAKEN` | 409 | RF-12 |
| `STORE_IN_USE` | 422 | RF-12; traz `purchases` e `offers` |
| `PURCHASE_CONCLUDED` | 422 | RN09 |
| `TAX_PARAMETERS_RETROACTIVE` | 422 | RF-22 |
| `NOT_FOUND` | 404 | RN08; também item de sincronização excluído em outro aparelho |
| `SESSION_EXPIRED` | 410 | ADR-009; renovação inválida, o app volta para T01 |
| `SYNC_CONFLICT` | por item | ADR-008; traz `current` com a versão do servidor |
| `DEPENDENCY_REJECTED` | por item | ADR-008; o registro pai foi recusado no mesmo envio ou está excluído no servidor; traz `field` com o campo do pai |
