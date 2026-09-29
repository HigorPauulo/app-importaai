# Visão do produto

O que o Importa Aí resolve, para quem, e o que fica de fora.

---

## Resumo

Quem compra no exterior decide pelo preço da vitrine e acompanha o pacote pelo site da transportadora. Nenhum dos dois mostra o custo final nem o prazo prometido. O Importa Aí **estima o custo final antes da compra** e **acompanha cada encomenda depois dela**, avisando a tempo de pagar a taxa, reclamar de um atraso ou investigar um pacote parado, inclusive sem conexão.

---

## Problema

Uma compra no corredor China para Brasil leva de 20 a 60 dias, passa por dois sistemas logísticos e pode gerar imposto com prazo curto. Quem compra com frequência tem várias encomendas ao mesmo tempo, em lojas, moedas e prazos diferentes, e guarda de forma dispersa o que nenhuma transportadora conhece: produto, valor, loja, prazo prometido e taxa.

| | Quando | Falha | Prejuízo |
|:---:|:---:|---|---|
| **F1** | Antes | Custo final estimado só pelo preço da vitrine | Compra que não compensava ou oferta errada |
| **F2** | Depois | Aviso de taxa perdido entre e-mails | Devolução e perda do valor pago |
| **F3** | Depois | Atraso despercebido | Perda da janela de reclamação |
| **F4** | Depois | Pacote parado sem ninguém notar | Extravio descoberto tarde demais |
| **F5** | Depois | Consulta manual em vários sites | Tempo perdido e abandono do acompanhamento |

As cinco têm a mesma causa: ninguém cruza o que só o comprador sabe (preço, frete, prazo, taxa) com o que o mundo externo informa (câmbio, imposto, rastreio). Esse cruzamento é o produto.

---

## Objetivos

**Objetivo geral.** Permitir que quem compra no exterior estime o custo final antes da compra e acompanhe cada encomenda depois dela, sendo avisado a tempo de agir, inclusive sem conexão.

| | Objetivo específico | Falhas | Requisitos |
|:---:|---|:---:|---|
| O1 | Estimar o custo final de uma oferta e comparar ofertas do mesmo produto | F1 | RF-04 a RF-07 |
| O2 | Registrar compras e lojas, convertendo o valor pela cotação da data da compra | F5 | RF-08 a RF-12 |
| O3 | Importar o rastreio sem duplicar eventos e mostrar a situação de cada compra | F5 | RF-13, RF-14 |
| O4 | Avisar sobre taxa, atraso, pacote parado e janela de reclamação, sem repetir alertas | F2, F3, F4 | RF-15 a RF-17 |
| O5 | Consolidar valor em trânsito, gastos, impostos e pontualidade por loja | F1, F3 | RF-18, RF-19 |
| O6 | Funcionar sem conexão e sincronizar ao reconectar, sem perder dado | F5 | RF-20 |
| O7 | Administrar contas, câmbio, parâmetros fiscais e integração, sem ver compras de ninguém | · | RF-21 a RF-23 |

---

## Usuários

| Perfil | O que faz |
|---|---|
| **Comprador** | Mantém as próprias ofertas, compras e lojas; simula custos; acompanha o rastreio; recebe alertas |
| **Administrador** | Gerencia contas, cotação manual, parâmetros fiscais e saúde da integração. **Não vê conteúdo de compra** (RN08) |

**Público-alvo:** quem tem **3 ou mais compras internacionais a caminho ao mesmo tempo, ao menos uma vez por trimestre**. É também o critério de recrutamento das sessões de usabilidade.

| Fora do público | Motivo |
|---|---|
| Comprador ocasional | O acompanhamento manual ainda funciona |
| Importador comercial | Precisa de controle fiscal e contábil |
| Comprador nacional | O problema nasce no trajeto internacional |

### Personas

As personas são hipóteses e serão confirmadas ou corrigidas nas sessões de usabilidade (09 a 13/11).

| | Camila, 27 · compradora recorrente | Rafael, 34 · comprador metódico | Diego, 31 · administrador |
|---|---|---|---|
| **Contexto** | 5 a 12 pacotes a caminho; consulta no transporte, com sinal ruim; já perdeu uma encomenda taxada | Compra menos e mais caro; compara a mesma peça em duas ou três lojas; controla gastos em planilha | Opera o sistema; atende contas; mantém câmbio e parâmetros fiscais |
| **Frustração** | Descobrir tarde | Decidir no escuro | Saber de uma falha pela reclamação do usuário |
| **Precisa de** | Alerta de taxa e atraso com o app fechado; uso sem conexão | Custo final antes de comprar; comparação; total gasto e impostos | Saúde da integração; bloqueio de contas; cotação e parâmetros corretos |
| **Requisitos** | RF-15, RF-16, RF-20 | RF-05, RF-06, RF-18, RF-19 | RF-21, RF-22, RF-23 |

---

## Escopo

**Dentro:** ofertas, compras e lojas · simulação de custo com imposto estimado · comparação de ofertas · importação de rastreio · situação e sinalizações · alertas no aparelho · conversão de moeda · indicadores · uso sem conexão · autenticação e administração.

| Fora | Motivo |
|---|---|
| Comprar ou pagar pelo app | Muda a natureza do produto e traz exigência regulatória |
| Pagar o imposto | Depende de integração bancária; o app avisa, não paga |
| Apurar o imposto oficial | Depende de classificação aduaneira; o app estima para decidir |
| Buscar ofertas automaticamente nas lojas | As plataformas não têm interface pública; extrair das páginas é frágil |
| Reclamar com o vendedor | Acontece na plataforma de origem; o app avisa quando é hora |

**Cortes do MVP**, candidatos a evolução: várias encomendas por compra · compartilhar acompanhamento · histórico de preço por loja · exportar histórico · ler o código de rastreio pela câmera.

**Critério de corte:** se o fluxo principal funciona sem o item, ele sai.

---

## Fluxo principal

> O comprador registra as ofertas que encontrou e vê o custo final de cada uma em reais. Escolhe a melhor e a transforma em compra com o código de rastreio. O app acompanha o trajeto e avisa quando a encomenda é taxada, atrasa, para de se mover ou está perto de perder a janela de reclamação, até a entrega ou a devolução.

**Por que móvel:** os avisos precisam chegar com o app fechado; a compra acontece no celular, dentro do app da loja; a consulta acontece em deslocamento, com sinal instável.

---

## Cenário de demonstração

1. Camila quer um fone. Registra **180 CNY com frete grátis** na Loja A e **24 USD mais 6 USD de frete** na Loja B.
2. O app mostra o custo final de cada uma: **R$ 191,43** e **R$ 239,42**. A Loja A sai R$ 47,99 mais barato, e a diferença vem do frete, que também é tributado.
3. Ela converte a oferta da Loja A em compra, com prazo prometido para **28/10**.
4. Em **12/10** o pacote é taxado. O celular avisa; ela registra R$ 48,90 com vencimento em 15/10 e paga a tempo.
5. Em **30/10** a compra não chegou. O app sinaliza o atraso e mostra quantos dias restam para reclamar.

Cobre as falhas F1, F2, F3 e F5 e é o roteiro do protótipo e da apresentação.

---

## Aderência ao Norteador (§3.3)

| Exigência | Como atendemos |
|---|---|
| Usuários identificáveis | Comprador e administrador |
| Regras explícitas | 11 regras de negócio verificáveis |
| Fluxo principal que justifica o app | Seção acima |
| 2 ou mais entidades relacionadas, com validação | Oferta, compra e loja |
| Não é listagem estática nem agregador | A situação é calculada e os alertas vêm do cruzamento de dados |
| Não é calculadora simples | A simulação usa cotação e parâmetros vigentes e alimenta a compra |
