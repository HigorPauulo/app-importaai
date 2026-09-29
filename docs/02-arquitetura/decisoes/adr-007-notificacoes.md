# ADR-007 · Notificações no aparelho

**Status:** aceita · 28/09/2026

## Contexto

O Norteador exige ao menos um recurso nativo usado de forma que agregue à experiência (R8). As falhas de taxa, atraso e pacote parado são falhas de omissão: o usuário perde o prazo porque não abriu nada. O aviso precisa chegar com o app fechado e, no caso da taxa, também sem rede no dia do vencimento.

## Decisão

- **Notificações** como recurso nativo, com `expo-notifications`.
- **Push remoto** para os alertas gerados pela API, via serviço de push da Expo (sobre o Firebase Cloud Messaging). O token de cada aparelho é registrado em `POST /devices`.
- **Lembrete local** agendado no aparelho ao registrar a taxa (5 dias, 2 dias e no dia), cancelado ao registrar o pagamento.
- A permissão é pedida depois do primeiro login, explicando o motivo. Tocar na notificação abre o detalhe da compra.

## Alternativas consideradas

| Alternativa | Problema |
|---|---|
| Câmera para ler o código | Conveniência no cadastro; não evita nenhuma das falhas. Mantida como desejável (RF-26) |
| Geolocalização ou biometria | Sem relação com as falhas do domínio |
| Firebase Cloud Messaging direto | Exige configurar credenciais Android na API sem ganho sobre o serviço da Expo |
| Só push remoto | O aviso de taxa não chegaria sem rede no dia do vencimento |

## Consequências

- **+** O recurso nativo está no centro do fluxo, não é demonstração isolada.
- **−** Push só funciona em build instalado; testar no aparelho desde o Ciclo 1.
- Se o usuário negar a permissão, os alertas continuam na aba Alertas e o perfil explica como reativar.
