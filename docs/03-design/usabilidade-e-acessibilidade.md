# Usabilidade e acessibilidade

As decisões de interface do protótipo, por que foram tomadas e como serão validadas. Meta de acessibilidade: **WCAG 2.1 nível AA**.

---

## Princípios

| Princípio | Onde aparece |
|---|---|
| **O que exige ação aparece primeiro** | T03 abre com "Precisa de atenção"; T04 põe a taxa acima dos valores |
| **Um número principal por tela de consulta**, com contexto em uma linha | T06 valor em trânsito; T11 custo final; T12 diferença entre lojas |
| **Uma ação primária por tela**; destrutivas escondidas | Rodapés fixos em T05, T11 e T12; menu em T04 e T13 |
| **A tela não espera a rede** | Banner de sem conexão informa, não bloqueia |
| **Estimativa se declara estimativa** | Selo e base do cálculo em T10, T11 e T12 |

---

## Heurísticas de Nielsen

| Heurística | Decisão | Telas |
|---|---|---|
| Visibilidade do estado | Hora da última sincronização sempre visível; estado da integração em faixa | T03, T09, T15 |
| Linguagem do usuário | "Pague a taxa até 15/10", "a encomenda volta ao remetente" | T04, T08 |
| Controle e liberdade | Voltar em toda tela empilhada; converter oferta abre um formulário revisável | T05, T11 |
| Consistência | Mesmos componentes, barras e rodapés em todas as telas | todas |
| Prevenção de erros | Requisitos de senha ao vivo; código duplicado detectado no campo; loja em uso protegida | T02, T05, T07 |
| Reconhecer em vez de lembrar | Loja e moeda como seletores; alerta traz a ação que resolve | T05, T08 |
| Eficiência | Busca e filtros; comparar direto do grupo; copiar código com um toque | T03, T04, T10 |
| Minimalismo | Ações raras no menu; nenhum indicador zerado para quem não tem dado | T04, T06 |
| Recuperação de erros | Mensagem diz o que fazer ("Toque para abrir a compra existente") | T02, T05 |
| Ajuda | "Como calculamos" na simulação; frase curta no topo de telas novas | T07, T11 |

---

## Acessibilidade

| Critério | Decisão |
|---|---|
| Contraste de texto (1.4.3) | Mínimo 4,5:1; texto sobre fundo colorido usa sempre o tom escuro correspondente |
| Contraste de elementos gráficos (1.4.11) | Bordas de campo e barras de gráfico com no mínimo 3:1 |
| Cor não é o único sinal (1.4.1) | Erro com ícone e texto; sinalização com texto; não lido com negrito e ponto; gráfico com legenda e valores |
| Alvo de toque | Mínimo de 48 dp em botões, campos, abas e ícones de ação |
| Leitor de tela | Todo ícone de ação tem rótulo ("Voltar", "Mais ações", "Copiar código"); alerta não lido anuncia "não lido" |
| Fonte do sistema | Nenhum texto com altura fixa; cards crescem com o conteúdo |
| Tamanho mínimo | 12 px só em rótulos auxiliares; conteúdo em 14 a 16 px |

### Contraste medido

| Texto ou elemento | Fundo | Razão |
|---|---|:---:|
| Texto principal #1A1A1A | branco | 17,4:1 |
| Texto secundário #4B5563 | branco | 7,6:1 |
| Azul primário #0D6EFD (links, botão) | branco | 4,5:1 |
| Azul escuro #0A3B8C | azul claro #CFE2FF | 7,9:1 |
| Aviso #92400E | amarelo #FEF3C7 | 6,4:1 |
| Erro #991B1B | rosa #FFE6E6 | 7,0:1 |
| Sucesso #065F46 | verde #D1FAE5 | 6,8:1 |
| Borda de campo e barras #8A94A3 | branco | 3,1:1 |

---

## Problemas encontrados e corrigidos no protótipo

| Problema | Correção |
|---|---|
| Texto laranja sobre amarelo com 1,9:1 | Tons escuros criados para texto sobre fundo colorido |
| Borda de campo quase invisível (1,2:1) | Token de borda com 3:1 |
| Fundo cinza-claro dentro de card branco, lido como desabilitado | Itens brancos; caixas de apoio com tom de significado |
| Barras de gráfico azul-claro com 1,2:1 | Cinza com 3:1; mês atual em azul |
| Editar, arquivar e excluir expostos como botões | Menu (⋮), evitando toque acidental em excluir |
| Aviso de loja em uso solto, longe do item | Explicação no próprio item, com o que fazer |
| Comparação por caixas de seleção, misturando produtos | Agrupamento por produto com "Comparar" no grupo |
| Datas incoerentes entre telas | Data de referência única: 12/10/2026 |

---

## Validação pendente

| Validação | Quando |
|---|---|
| Sessões com 5 usuários do público-alvo percorrendo o roteiro do protótipo | 09 a 13/11 |
| TalkBack de T01 a T12 | Ciclo 4 |
| Fonte do sistema em tamanho grande | Ciclo 4 |
