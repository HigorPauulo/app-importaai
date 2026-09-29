# Regras de negócio

As 11 regras que o sistema impõe, com o comportamento esperado e como verificar cada uma.

`D` é a data corrente no fuso America/Sao_Paulo. **Dono** é o lado que implementa a regra ([onde cada regra roda](../02-arquitetura/visao-geral.md#onde-cada-regra-roda)).

---

## Resumo

| ID | Regra | Em uma frase | Dono |
|:---:|---|---|:---:|
| RN01 | Situação derivada | A situação vem do último evento de rastreio; nunca é gravada | API |
| RN02 | Atraso | Passou do prazo prometido sem entrega, a compra está atrasada | API |
| RN03 | Pacote parado | 15 dias sem evento novo em trânsito, a compra está parada | API |
| RN04 | Taxa com prazo | Taxa detectada pede registro; taxa registrada gera lembretes em 5 dias, 2 dias e no dia | API e app |
| RN05 | Janela de reclamação | A janela fecha 30 dias após o prazo; avisa 3 dias antes | API |
| RN06 | Alerta sem repetição | Um alerta por ocorrência: o mesmo fato nunca avisa duas vezes | API |
| RN07 | Conversão de moeda | Compra usa a cotação da data da compra; oferta usa a cotação atual | App |
| RN08 | Isolamento por perfil | Cada comprador vê só o seu; o administrador nunca vê compras | API |
| RN09 | Compra concluída não muda | Entregue ou devolvida, valores, datas, loja e código ficam protegidos | API |
| RN10 | Imposto estimado | Custo final com parâmetros fiscais versionados; sempre rotulado como estimativa | App |
| RN11 | Retenção de alertas | Guarda os 50 alertas lidos mais recentes; não lido nunca é apagado | API |

---

## RN01 · Situação derivada

A situação é calculada a partir do **último evento classificado**. Eventos com texto não reconhecido recebem a etapa `OUTRO` e são ignorados, para que uma novidade da fonte produza falta de informação, nunca informação errada.

| Etapa do último evento | Situação |
|---|---|
| nenhuma | Aguardando postagem |
| Postado · Saída da origem · Trânsito internacional | Trânsito internacional |
| Chegada ao Brasil · Fiscalização · Aguardando pagamento · Em distribuição · Saiu para entrega | No Brasil |
| Entregue | **Entregue** (final) |
| Devolvido | **Devolvida** (final) |
| qualquer, com recebimento confirmado pelo usuário | **Entregue** (final) |

**Recebimento confirmado:** a fonte de rastreio pode parar de atualizar antes da entrega. O usuário pode confirmar o recebimento com a data; a compra passa a Entregue e deixa de gerar alertas. Sem essa saída, uma compra recebida ficaria atrasada para sempre.

As **sinalizações** são calculadas à parte e podem coexistir: uma compra pode estar no Brasil, com taxa pendente e atrasada ao mesmo tempo. Nenhuma sinalização vale para compra em situação final.

| Sinalização | Regra |
|---|:---:|
| Taxa a registrar · Taxa pendente · Taxa vencida | RN04 |
| Atrasada | RN02 |
| Parada | RN03 |
| Janela fechando · Janela encerrada | RN05 |

**Por que não gravar:** situação gravada ao lado dos eventos seria uma segunda fonte de verdade, que diverge na primeira falha de sincronização.

**Teste:** inserir um evento "Entregue" muda a situação sem escrita em coluna de situação; um evento "Outro" depois dele não a altera; confirmar o recebimento de uma compra em trânsito a torna Entregue (CT-17, CT-27, CT-53).

---

## RN02 · Atraso

Compra **atrasada** quando `D` passa do prazo prometido e a situação não é final. Gera um alerta ao entrar em atraso; deixa de valer na entrega.

**Teste:** prazo em 04/10, sem entrega, em 12/10: sinalização "Atrasada 8 dias" e um alerta (CT-30).

---

## RN03 · Pacote parado

Compra **parada** quando está em trânsito internacional ou no Brasil e não recebe evento há **15 dias ou mais**. Um alerta por ocorrência; a contagem recomeça a cada evento.

**Parâmetro:** 15 dias é hipótese de trabalho, configurável, a calibrar com dados reais antes do Ciclo 3. Baixo demais gera alarme falso; alto demais anula a regra.

**Teste:** compra em trânsito com último evento há 16 dias aparece como parada (CT-31).

---

## RN04 · Taxa com prazo

1. Evento "Aguardando pagamento" sem taxa registrada: sinalização **Taxa a registrar** e alerta.
2. Taxa registrada com vencimento: lembretes em **5 dias, 2 dias e no dia**, agendados no próprio aparelho para chegarem mesmo sem rede.
3. Venceu sem pagamento: **Taxa vencida**, até o registro do pagamento ou a devolução.

O app não calcula nem paga a taxa: valor e vencimento vêm do aviso que o comprador recebe.

**Teste:** CT-33, CT-34.

---

## RN05 · Janela de reclamação

A janela fecha **30 dias após o prazo prometido**. Faltando 3 dias, com a compra não entregue, o app avisa com os dias restantes. Fechada sem entrega: **Janela encerrada**, informativa.

**Parâmetro:** 30 dias é hipótese, a confirmar contra os termos das plataformas mais usadas antes do Ciclo 3. Na dúvida, usar o prazo mais curto.

**Teste:** prazo prometido há 27 dias, sem entrega, gera alerta (CT-32).

---

## RN06 · Alerta sem repetição

**Um alerta por ocorrência.** A ocorrência é o fato que disparou o alerta: o prazo prometido (atraso), o vencimento e o marco de 5, 2 ou 0 dias (taxa), o último evento (pacote parado), a data de fechamento (janela). Reavaliar a mesma condição, antes ou depois da leitura, não gera outro alerta; um fato novo (novo prazo, novo vencimento, parada depois de um evento novo) gera.

**Por quê:** as regras de alerta são reavaliadas a cada 20 minutos e continuam verdadeiras por dias. Sem esta regra, o usuário desliga as notificações e todas as outras regras deixam de servir. Garantida no banco por um livro de ocorrências que a RN11 não apaga ([ADR-010](../02-arquitetura/decisoes/adr-010-ocorrencia-de-alerta.md)).

**Teste:** três avaliações da mesma compra atrasada geram uma única notificação, inclusive com execuções simultâneas; ler e reavaliar não gera outra (CT-35, CT-56).

---

## RN07 · Conversão de moeda

| Caso | Cotação usada |
|---|---|
| Compra | Da **data da compra** |
| Oferta | A **mais recente** |
| Sem cotação na data exata | A anterior mais próxima, sinalizando aproximação |
| Cotação mais recente com mais de 24 h | Usada, sinalizando "cotação desatualizada" |
| Cotação manual do administrador para a data | Prevalece sobre a automática |
| Nenhuma cotação da moeda | Valor exibido na moeda de origem, com aviso |

**Por quê:** a compra já aconteceu e custou o que custou naquele dia; pela cotação do dia, o total gasto mudaria sem nenhuma compra mudar. A oferta ainda não aconteceu: importa quanto custaria hoje.

**Teste:** 100 CNY comprados em 02/10 mantêm o mesmo valor em reais em consultas de dias diferentes (CT-18).

---

## RN08 · Isolamento por perfil

O comprador acessa só o próprio acervo. O administrador acessa contas, cotações, parâmetros fiscais e indicadores de integração, e **nunca** ofertas ou compras. Toda consulta é filtrada pelo usuário da sessão, no servidor. Pedido de recurso alheio responde **não encontrado**, para não confirmar que ele existe.

**Teste:** usuário A pede a compra de B e recebe 404; não existe rota de administrador para compras (CT-44).

---

## RN09 · Compra concluída não muda

Compra **Entregue** ou **Devolvida** não aceita alteração de valor, frete, moeda, datas (inclusive a de recebimento), loja ou código de rastreio. Aceita anotação, arquivamento e exclusão, porque excluir é decisão explícita do dono do dado.

**Por quê:** compra concluída alimenta os indicadores; mudar o passado corrompe o consolidado sem deixar rastro.

**Teste:** alterar o valor de compra entregue é recusado com mensagem específica (CT-20).

---

## RN10 · Imposto estimado

| Passo | Cálculo |
|:---:|---|
| 1 | **Valor aduaneiro** = preço + frete, convertido pela RN07 |
| 2 | **Imposto de importação**, em dólar: até o limite, `valor × alíquota até o limite`; acima, `valor × alíquota acima − dedução`, nunca negativo |
| 3 | **ICMS** "por dentro": `(valor aduaneiro + imposto) × icms ÷ (1 − icms)` |
| 4 | **Custo final** = soma dos três, cada parcela exibida |

**Parâmetros** (limite, duas alíquotas, dedução, ICMS) ficam em registros versionados por data de vigência, publicados pelo administrador. Mudança na lei vira nova versão; a anterior permanece para explicar simulações passadas. **Os valores iniciais precisam ser conferidos na legislação vigente antes do Ciclo 2.**

**Limites:** não substitui a apuração oficial; não considera isenções nem classificação por tipo de produto.

**Teste:** com parâmetros de teste, 180 CNY sem frete dá R$ 191,43; exatamente no limite cai na faixa inferior; nova versão não altera simulação anterior à vigência (CT-09, CT-11, CT-46).

---

## RN11 · Retenção de alertas

O histórico guarda os **50 alertas lidos** mais recentes por usuário. Alerta **não lido nunca é apagado**, para que o limite não descarte justamente o aviso de taxa que o usuário ainda não viu. Apagar um alerta lido não permite que ele volte (RN06).

**Teste:** com 50 lidos e 3 não lidos, ler mais um remove o lido mais antigo e mantém os não lidos (CT-36).
