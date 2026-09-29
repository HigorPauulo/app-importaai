<!--
Título no formato de commit: feat(lojas): adiciona cadastro de loja no banco local
Se o PR ganhar commits depois de aberto, reescreva o título para o que ele carrega hoje.
Regras completas em CONTRIBUTING.md.
-->

## O que muda, e por quê

<!-- Uma linha do que muda. Uma linha do problema que resolve. -->

## Rastreio

| História | Regras | Casos de teste |
|---|---|---|
| US-xx / H-xx | RNxx | CT-xx |

Closes #

## Como foi verificado

- [ ] Gate do lado alterado verde (`./mvnw verify` na API · `lint`, `tsc --noEmit` e `test` no app)
- [ ] Critérios de aceite conferidos **no aparelho físico** (se mexeu em tela)
- [ ] Tela com os quatro estados: carregando, vazio, erro, conteúdo (se mexeu em tela)
- [ ] Migration nova, sem editar migration aplicada; `schema.dbml` e modelo de dados atualizados (se mexeu no banco)
- [ ] `api.md` atualizado e dono da outra ponta avisado (se mexeu no contrato)
- [ ] Nenhuma credencial, `.env`, log de depuração ou código comentado sem uso
- [ ] Coluna PR da [rastreabilidade](docs/05-qualidade/rastreabilidade.md) atualizada (se entregou requisito)

<!-- Evidência: print, vídeo curto ou saída do teste. Obrigatório para mudança de tela. -->

## O que este PR não faz, de propósito

<!-- O que ficou de fora e para onde foi (issue, backlog). Nada some em silêncio. Se não houver, apague. -->

## Uso de IA

<!-- Se houve apoio de IA, em quê. Vai para docs/06-entregas/declaracao-ia.md no fim do ciclo. -->
