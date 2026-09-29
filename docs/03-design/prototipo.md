# Protótipo

Onde está o protótipo, que componentes usa e o roteiro para percorrê-lo.

---

## Onde está

**Figma:** [página 📱 App · Importa Aí](https://www.figma.com/design/EuuXuBtwVUIbSaMaRMRImo/Importa-AI?node-id=612-148), com as 15 telas em tamanho Android (412 × 915), divididas em Acesso (T01, T02), Comprador (T03 a T12) e Administrador (T13 a T15). Os componentes ficam na página Design System, grupo "Componentes do App".

**Data de referência:** "hoje" no protótipo é **12/10/2026**, e todos os valores são coerentes entre as telas.

---

## Componentes

| Componente | Variantes | Onde |
|---|---|---|
| Barra de status, Header, Barras de abas | · | Todas as telas |
| Campo de texto | vazio, preenchido, foco, erro | T01, T02, T05, T11 |
| Botão | primário (padrão, carregando, desabilitado), secundário, texto | Todas |
| Card de Compra | até duas sinalizações | T03 |
| Badge de Situação | 5 situações | T03, T04 |
| Sinalização | 7 sinalizações | T03, T04 |
| Linha de Oferta | menor custo ou não | T10 |
| Item de Alerta | lido ou não lido | T08 |
| Chip de filtro, Linha de Custo, Estado vazio, Toast | · | T03, T06, T11, T13 |

Cores, espaçamentos e raios usam as variáveis da coleção de tokens; textos usam os estilos da fonte Inter.

---

## Roteiro navegável

Segue o [cenário de demonstração](../01-produto/visao.md#cenário-de-demonstração).

| Passo | Tela | Ação | Vai para |
|:---:|---|---|---|
| 1 | T01 Entrar | Entrar | T03 |
| 2 | T03 Compras | Aba Ofertas | T10 |
| 3 | T10 Ofertas | Comparar, no grupo do fone | T12 |
| 4 | T12 Comparação | Comprar na Loja A | T05 |
| 5 | T05 Formulário | Salvar compra | T04 |
| 6 | T04 Detalhe | Aba Alertas | T08 |
| 7 | T08 Alertas | Ver como reclamar | T04 |
| 8 | T04 Detalhe | Aba Painel | T06 |
| 9 | T06 Painel | Avatar | T09 |
| 10 | T09 Perfil | Minhas lojas | T07 |
| 11 | T01 como administrador | Entrar, depois as abas | T13, T14, T15 |

Também ligados: card da compra → T04, oferta → T11, T11 → T05, T01 ↔ T02, voltar em toda tela empilhada e abas em toda tela de aba.

---

## Estado

| Item | Situação |
|---|:---:|
| 15 telas desenhadas e revisadas | pronto |
| Componentes no design system | pronto |
| Ligações de navegação do roteiro | pendente |
| Estados alternativos (vazio, erro, carregando) como telas próprias | pendente, antes das sessões de usabilidade |
