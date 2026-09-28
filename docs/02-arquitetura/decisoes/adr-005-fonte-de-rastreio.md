# ADR-005 · Fonte de rastreio

**Status:** aceita · 28/09/2026 · fonte real a validar até o Ciclo 3

## Contexto

A importação de eventos (RF-13) depende de uma fonte externa que cubra o corredor China para Brasil. A API dos Correios exige contrato e não cobre o trecho internacional; agregadores cobram acima de uma cota gratuita. Situação, alertas e a demonstração do Checkpoint 2 dependem dessa fonte, o maior risco externo do projeto.

## Decisão

- A API define a porta **`TrackingSource`**: dado um código, devolve o histórico de eventos.
- **Adaptador simulado:** devolve um roteiro de eventos configurado por código. Usado em desenvolvimento, nos testes e como plano B da demonstração.
- **Adaptador real:** agregador com cota gratuita (por exemplo, 17TRACK), **a validar até o Ciclo 3** quanto a cobertura, limite de consultas e termos de uso.
- O adaptador é escolhido por variável de ambiente, sem mudar código.
- A classificação do texto do evento em etapa fica no adaptador, porque cada fonte descreve eventos com palavras diferentes.

## Alternativas consideradas

| Alternativa | Problema |
|---|---|
| API dos Correios | Exige contrato; não cobre o trecho internacional |
| Extrair dados das páginas de rastreio | Frágil, quebra sem aviso e pode violar termos de uso |
| Depender só da fonte real | Desenvolvimento, testes e demonstração ficariam reféns da cota e da disponibilidade |

## Consequências

- **+** Testes das regras de situação e alerta são determinísticos.
- **+** Trocar de fonte não afeta o resto do sistema.
- **−** Um adaptador a mais para manter.
- Se a fonte real for inviável, a demonstração usa o simulado e a limitação vai para o relatório final.
