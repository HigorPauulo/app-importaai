# Regras de negócio

`A4` · **rascunho** · 11/09/2026 · alimenta A6, A14, A15

> Nove regras. RN01 a RN07 sustentam R4 (mínimo de três não triviais); RN08 e RN09 são integridade e acesso. Cada uma declara comportamento verificável, para virar caso de teste direto em A15.

`D` é a data corrente em America/Sao_Paulo, avaliada no dispositivo.

[RN01](#rn01--estado-derivado) · [RN02](#rn02--atraso) · [RN03](#rn03--estagnação) · [RN04](#rn04--taxa-com-prazo) · [RN05](#rn05--janela-de-reclamação) · [RN06](#rn06--notificação-idempotente) · [RN07](#rn07--conversão-pela-data) · [RN08](#rn08--isolamento-por-perfil) · [RN09](#rn09--imutabilidade)

---

## RN01 · Estado derivado

> O estado da compra é função do último evento de rastreio e do registro de taxa. **Não existe campo de estado persistido.**

A avaliação é **ordenada**: vale o primeiro estado cuja condição for satisfeita.

| # | Estado | Condição |
|:---:|---|---|
| 1 | `DEVOLVIDA` | Último evento de devolução. Terminal |
| 2 | `ENTREGUE` | Último evento de entrega. Terminal |
| 3 | `TAXADA` | Taxa registrada e não paga |
| 4 | `EM_PROCESSO_ALFANDEGARIO` | Último evento aduaneiro |
| 5 | `EM_TRANSITO_NACIONAL` | Último evento no país |
| 6 | `EM_TRANSITO_INTERNACIONAL` | Último evento fora do país |
| 7 | `AGUARDANDO_POSTAGEM` | Nenhum evento recebido |

**Por que a ordem importa.** As condições não são mutuamente exclusivas: uma compra taxada continua recebendo eventos de trânsito, e sem ordem definida o estado dependeria da ordem de avaliação no código, que varia entre implementações. `TAXADA` vem antes do trânsito porque **exige ação do usuário** dentro de um prazo, e é isso que ele precisa ver na listagem.

**O arquivamento não entra aqui.** `archived_at` é ortogonal ao estado: uma compra entregue pode estar arquivada ou não, e as duas informações respondem perguntas diferentes. Arquivamento filtra a listagem (RF-08), não altera o estado.

**Por quê.** Estado ao lado dos eventos que o determinam cria duas fontes de verdade. Elas divergem na primeira falha de sincronização, e em silêncio.

**Custo aceito.** Cálculo a cada leitura. Aceitável em dezenas de compras por usuário. Em volume maior, a resposta seria cache invalidável, não coluna.

**Teste.** Inserir evento de entrega e confirmar mudança de estado sem escrita em campo de estado.

---

## RN02 · Atraso

> Compra **atrasada** quando `D` > prazo prometido e o estado não é `ENTREGUE` nem `DEVOLVIDA`.

**Comportamento.** Notificação única ao entrar em atraso (ver RN06). Reavaliada a cada sincronização, cessa na entrega.

**Por quê.** Responde à falha **F2** de A1. É o cruzamento entre um dado que só o usuário tem (prazo prometido) e um dado da fonte externa (estado atual), e constitui o núcleo do tratamento de dados do aplicativo.

**Teste.** Compra com prazo vencido e sem entrega deve aparecer no filtro de atrasadas.

---

## RN03 · Estagnação

> Compra **estagnada** quando não recebe evento há **15 dias ou mais** e está em trânsito (internacional, alfandegário ou nacional).

**Comportamento.** Notificação única por ocorrência. Contagem reinicia a cada evento novo.

**Por quê.** Responde à falha **F3** de A1. Extravio e retenção não produzem evento: manifestam-se como **ausência** dele. Detectar ausência exige regra, porque nenhuma fonte a comunica.

**Parâmetro.** 15 dias é **hipótese de trabalho**, não medição. O valor não foi apurado contra dado real do corredor. Deve ser configurável e calibrado durante os ciclos, com os eventos efetivamente importados. Limiar baixo demais gera alarme falso e leva o usuário a desativar as notificações; alto demais anula a regra.

**Teste.** Compra em trânsito com último evento há 16 dias deve aparecer como estagnada.

---

## RN04 · Taxa com prazo

> Registrada a taxa com prazo de pagamento, o sistema alerta em **D-5**, **D-2** e no vencimento.

**Comportamento.** Vencido sem pagamento, a compra é sinalizada `RISCO_DE_DEVOLUCAO` até o pagamento ou até evento de devolução, que prevalece por RN01.

**Por quê.** Responde à falha **F1** de A1, a de maior prejuízo: perda integral do valor da compra.

**Limite.** O aplicativo não apura nem quita o imposto. Valor e prazo vêm do usuário.

**Teste.** Vencimento em `D+5` produz exatamente um alerta; em `D-1` sem pagamento, a compra aparece sinalizada.

---

## RN05 · Janela de reclamação

> A janela encerra **30 dias após o prazo prometido**. Faltando 3 dias, com a compra não entregue, o sistema alerta com os dias restantes.

**Comportamento.** Encerrada sem entrega, sinaliza `JANELA_ENCERRADA`, informativo, sem alterar RN01.

**Por quê.** Maior valor percebido por P1. O prejuízo de F2 não é o atraso, é perder o direito ao reembolso por decurso de prazo.

**Parâmetro.** 30 dias é **hipótese de trabalho**, não levantamento das políticas reais dos marketplaces. Precisa ser confirmado contra os termos das plataformas efetivamente usadas pelo público-alvo antes do Ciclo 3. Na dúvida, adotar o prazo mais curto: alertar cedo é inofensivo, alertar tarde anula a regra.

**Teste.** Prazo prometido em `D-27` sem entrega deve produzir alerta.

---

## RN06 · Notificação idempotente

> No máximo **uma notificação não lida** por combinação de compra e motivo. Reavaliação que reencontre a condição não gera outra.

**Comportamento.** Reemite apenas após leitura e nova ocorrência.

**Por quê.** RN02 a RN05 são reavaliadas a cada sincronização e permanecem verdadeiras por dias. Sem idempotência, o usuário desativa as notificações e as quatro regras anteriores deixam de existir.

**Teste.** Três sincronizações sobre a mesma compra atrasada produzem uma única notificação.

---

## RN07 · Conversão pela data

> O valor é registrado na moeda de origem e convertido pela cotação da **data da compra**, nunca pela corrente.

**Comportamento.** Sem cotação na data (fim de semana, feriado, falha), usa a anterior mais próxima e sinaliza aproximação.

**Por quê.** O custo real é o do momento da transação. Pela cotação corrente, o consolidado de P2 oscilaria todo dia sem nenhuma compra ter mudado: dado incorreto apresentado como correto.

**Teste.** 100 CNY em data conhecida mantém o mesmo valor em BRL em consultas feitas em dias diferentes.

---

## RN08 · Isolamento por perfil

> O comprador acessa apenas o próprio acervo. O administrador acessa metadados de conta e indicadores, e **nunca conteúdo de compra**.

**Comportamento.** Toda consulta é filtrada pelo usuário autenticado, no servidor. Acesso a recurso alheio responde **inexistente**, não proibido.

**Por quê.** Compra revela hábito de consumo, e o perfil administrativo não precisa dele. Responder "inexistente" evita confirmar a existência do recurso a quem não deveria conhecê-lo.

**Teste.** Como usuário A, pedir compra de B e receber "inexistente". Como admin, confirmar ausência de rota para conteúdo de compra.

---

## RN09 · Imutabilidade

> Compra `ENTREGUE` ou `DEVOLVIDA` não admite alterar valor, moeda, data, prazo prometido nem código de rastreio. Admite exclusão e anotação.

**Por quê.** Compra concluída é registro histórico e alimenta os indicadores de P2. Alteração retroativa corrompe o consolidado sem deixar rastro.

**Por que a exclusão continua.** É ato deliberado e explícito do titular do dado.

**Teste.** Alterar valor de compra entregue deve ser recusado com mensagem específica, não com falha genérica.

---

## Mapa das regras

| Regra | Origem | Entidades | Requisito |
|:---:|:---:|---|---|
| RN01 | Modelagem | purchases, tracking_events | R4, R6 |
| RN02 | Falha F2 | purchases | R4 |
| RN03 | Falha F3 | purchases, tracking_events | R4 |
| RN04 | Falha F1 | purchases, notifications | R4 |
| RN05 | Falha F2 | purchases, notifications | R4 |
| RN06 | Qualidade de uso | notifications | R8, R10 |
| RN07 | Persona P2 | purchases, exchange_rates | R4, R7 |
| RN08 | Privacidade | users, todas | R2, R12 |
| RN09 | Integridade | purchases | R3 |

---

[← Requisitos](requisitos.md) · [Índice](../README.md)
