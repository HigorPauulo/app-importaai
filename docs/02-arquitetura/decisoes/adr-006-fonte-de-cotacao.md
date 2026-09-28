# ADR-006 · Fonte de cotação

**Status:** aceita · 28/09/2026 · limites de uso a validar no Ciclo 2

## Contexto

A RN07 exige duas cotações: a **do dia**, para simular ofertas, e a **de uma data passada**, para converter compras pela data em que foram feitas, inclusive compras cadastradas depois. Moedas iniciais: USD, CNY e EUR.

## Decisão

- Porta **`ExchangeRateSource`** com dois adaptadores:
  - **cotação do dia:** serviço público gratuito (AwesomeAPI), consultado de hora em hora;
  - **cotação histórica:** boletim PTAX do Banco Central, consultado quando chega compra com data sem cotação gravada.
- Toda cotação obtida é gravada e nunca consultada de novo para a mesma data.
- A cotação manual do administrador prevalece e registra o autor.
- O app recebe as cotações pela sincronização e nunca chama a fonte diretamente.

## Alternativas consideradas

| Alternativa | Problema |
|---|---|
| Gravar só a cotação do dia, diariamente | Compras com data anterior ao início da gravação ficariam sem conversão |
| Serviço pago | Custo e chave de acesso sem necessidade |

## Consequências

- **+** Compras antigas são convertidas corretamente e o total gasto não oscila.
- **+** Sem custo e sem chave de acesso.
- **−** Duas integrações para manter, ambas atrás da mesma porta.
