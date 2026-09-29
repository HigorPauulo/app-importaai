# ADR-004 · Onde cada regra de negócio roda

**Status:** aceita · 28/09/2026

## Contexto

Com app e API, cada regra pode ser implementada num lado, no outro ou nos dois. Nos dois, ela vira duas versões que divergem na primeira correção. Parte das regras precisa funcionar sem rede (simulação); parte precisa funcionar com o app fechado (alertas); e o isolamento entre usuários não pode depender do aparelho.

## Decisão

**Cada regra tem um único dono**, escolhido pela necessidade:

| Dono | Regras | Critério |
|---|---|---|
| App | Validação de formulário, RN07, RN10, lembretes locais da RN04 | Precisa funcionar sem rede |
| API | RN01, RN02, RN03, RN04 (detecção), RN05, RN06, RN08, RN09, RN11 | Depende de dado externo, precisa rodar com o app fechado ou não pode confiar no aparelho |

A situação calculada pela API chega ao app na sincronização e fica em cache para exibição sem rede. O app trava os campos de compra concluída como experiência de uso; quem recusa a alteração é a API.

## Alternativas consideradas

| Alternativa | Problema |
|---|---|
| Tudo na API | Simulação e conversão deixam de funcionar sem conexão |
| Tudo no app | Alertas não disparam com o app fechado; isolamento fica num aparelho que o usuário controla |
| Duplicar nos dois lados | Duas implementações e dois conjuntos de testes da mesma regra |

## Consequências

- **+** Nenhuma regra é escrita duas vezes; cada caso de teste roda num lugar só.
- **+** "Onde está a regra X?" tem resposta em uma linha da [arquitetura](../visao-geral.md#onde-cada-regra-roda).
- **−** A situação vista sem conexão pode estar desatualizada; por isso a tela sempre mostra a hora da última sincronização.
