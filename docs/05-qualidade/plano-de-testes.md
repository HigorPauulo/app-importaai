# Plano de testes

Como o sistema é verificado: níveis de teste, dados de referência e os 61 casos que cobrem todos os requisitos funcionais e regras de negócio.

---

## Estratégia

| Nível | O que cobre | Ferramenta | Quando |
|---|---|---|---|
| Unitário do app | Domínio: validações, simulação (RN10), conversão (RN07) | Jest | A cada PR |
| Esquema | As 14 garantias do banco ([`schema-checks.sql`](../02-arquitetura/sql/schema-checks.sql)) | PostgreSQL 18 descartável | A cada mudança do SQL; no H-02 vira teste Testcontainers |
| Integração da API | Serviços e DAOs contra PostgreSQL real: RN01 a RN06, RN08, RN09, RN11, sincronização e sessão | JUnit 5 e Testcontainers | A cada PR |
| Manual no aparelho | Fluxos, estados de tela, uso sem conexão, notificações | Roteiro abaixo, em aparelho físico | Fim de cada ciclo |
| Usabilidade | Roteiro do protótipo com 5 usuários do público-alvo | Sessões moderadas | 09 a 13/11 |
| Acessibilidade | Leitor de tela e fonte grande | TalkBack | Ciclo 4 |

**Regra de lugar:** cada regra é testada no lado que a implementa ([onde cada regra roda](../02-arquitetura/visao-geral.md#onde-cada-regra-roda)).

**Critério de saída da N2:** todos os casos M executados no aparelho, nenhum defeito que impeça um fluxo principal (§6.3 do Norteador).

---

## Dados de referência

| Dado | Valor |
|---|---|
| Hoje | 12/10/2026 |
| Parâmetros fiscais | limite US$ 50; 20% até o limite; 60% acima, com dedução de US$ 20; ICMS 17% |
| Cotações | 1 USD = R$ 5,52 · 1 CNY = R$ 0,7356 |

**Tipo:** A = automatizado · M = manual no aparelho. **Resultado:** preenchido na execução; falhas vão para o registro de defeitos.

---

## Casos

### Acesso

| CT | Req. | Cenário | Esperado | Tipo | Resultado |
|:---:|:---:|---|---|:---:|---|
| CT-01 | RF-01 | Criar conta com e-mail novo | Conta criada e sessão iniciada | M | |
| CT-02 | RF-01 | Criar conta com e-mail já usado | Erro junto ao e-mail; nenhuma conta criada | M | |
| CT-03 | RF-02 | Entrar com credencial correta | Sessão iniciada; token no armazenamento seguro | M | |
| CT-04 | RF-02 | Entrar com senha errada | Mensagem única, sem dizer qual campo errou | M | |
| CT-05 | RF-02, RN08 | Errar 5 vezes e tentar a 6ª com a senha certa | Recusado, informando os 15 minutos | A | |
| CT-06 | RF-03 | Alterar o nome e sair | Nome atualizado; volta para T01; token removido | M | |

### Ofertas e simulação

| CT | Req. | Cenário | Esperado | Tipo | Resultado |
|:---:|:---:|---|---|:---:|---|
| CT-07 | RF-04 | Criar oferta de 180 CNY, frete 0, na Loja A | Aparece em T10 num grupo novo | M | |
| CT-08 | RF-04 | Adicionar a Loja B (24 USD + 6 USD) ao grupo | Grupo com 2 ofertas | M | |
| CT-09 | RF-05, RN10 | Simular 180 CNY sem frete | 132,41 + 26,48 + 32,54 = **R$ 191,43**, rotulado estimativa | A | |
| CT-10 | RF-05, RN07 | Simular com cotação de 30 horas | Calcula e sinaliza "cotação desatualizada" | A | |
| CT-11 | RN10 | Simular US$ 50,00 e US$ 60,00 | 50,00 na faixa de 20%; 60,00 com 60% menos a dedução | A | |
| CT-12 | RF-06 | Comparar o grupo do fone | Loja A menor; diferença R$ 47,99; frete (+R$ 33,12) como maior parcela | M | |
| CT-13 | RF-07 | Converter a oferta em compra | Formulário preenchido; oferta ligada à compra criada | M | |

### Compras e lojas

| CT | Req. | Cenário | Esperado | Tipo | Resultado |
|:---:|:---:|---|---|:---:|---|
| CT-14 | RF-08 | Cadastrar compra válida | Aparece em T03 como "Aguardando postagem" | M | |
| CT-15 | RF-08 | Cadastrar outra compra com o mesmo código | Erro no código, com opção de abrir a existente | A | |
| CT-16 | RF-08 | Data futura, prazo antes da compra e valor 0 | Três erros, cada um no seu campo; nada gravado | A | |
| CT-17 | RF-09, RN01 | Abrir compra com eventos | Linha do tempo decrescente, etapa atual destacada | M | |
| CT-18 | RF-09, RN07 | Compra de 100 CNY em 02/10, consultada em 02/10 e 12/10 | Mesmo valor em reais nas duas consultas | A | |
| CT-19 | RF-10 | Alterar o valor de compra em trânsito | Valor atualizado e sincronizado | M | |
| CT-20 | RF-10, RN09 | Enviar à API alteração de valor de compra entregue | 422 `PURCHASE_CONCLUDED`; no app, campo travado com o motivo | A | |
| CT-21 | RF-11 | Arquivar compra entregue | Sai da lista principal; aparece em "Arquivadas" | M | |
| CT-22 | RF-11, RN09 | Excluir compra entregue | Excluída, mesmo concluída | M | |
| CT-23 | RF-12 | Criar, renomear e excluir loja sem uso | As três operações refletidas em T07 | M | |
| CT-24 | RF-12 | Excluir loja com 2 compras e 1 oferta | Recusado, informando as quantidades | A | |

### Rastreio e alertas

| CT | Req. | Cenário | Esperado | Tipo | Resultado |
|:---:|:---:|---|---|:---:|---|
| CT-25 | RF-13 | Rotina com fonte simulada de 4 eventos | 4 eventos gravados; execução "sucesso" | A | |
| CT-26 | RF-13 | Rodar a rotina mais 2 vezes, uma em paralelo | Continuam 4 eventos | A | |
| CT-27 | RN01 | Evento "Outro" depois de "Entregue" | Situação continua Entregue; nada gravado como situação | A | |
| CT-28 | RF-14 | Buscar "teclado" e filtrar "Com atenção" | Resultados corretos; filtro vazio mostra o vazio de filtro | M | |
| CT-29 | RF-14 | Ordenar por prazo | Ordem crescente de prazo prometido | M | |
| CT-30 | RF-15, RN02 | Prazo 04/10, sem entrega, hoje 12/10 | "Atrasada 8 dias" e um alerta | A | |
| CT-31 | RF-15, RN03 | Em trânsito, último evento há 16 dias | "Parada" e um alerta | A | |
| CT-32 | RF-15, RN05 | Prazo há 27 dias, sem entrega | Alerta com 3 dias restantes | A | |
| CT-33 | RF-16, RN04 | Evento "Aguardando pagamento" sem taxa | "Registrar taxa" e alerta com push | A | |
| CT-34 | RF-16, RN04 | Registrar taxa vencendo em 5 dias e não pagar | Lembretes em 5 dias, 2 dias e no dia; depois, "Taxa vencida" | M | |
| CT-35 | RF-17, RN06 | Avaliar a mesma compra atrasada 3 vezes; ler; nova ocorrência | Um só não lido; depois da leitura e nova ocorrência, outro | A | |
| CT-36 | RF-17, RN11 | 50 lidos e 3 não lidos; ler mais um | Sai o lido mais antigo; os não lidos ficam | A | |

### Painel e uso sem conexão

| CT | Req. | Cenário | Esperado | Tipo | Resultado |
|:---:|:---:|---|---|:---:|---|
| CT-37 | RF-18, RN07 | Compras ativas de R$ 132,41, 181,61 e 69,00 | Em trânsito: **R$ 383,02** | A | |
| CT-38 | RF-18 | Usuário sem compras abre o painel | Estado vazio, sem indicadores zerados | M | |
| CT-39 | RF-19, RN02 | Loja B com entregas 8 e 10 dias atrasadas | Loja B com "+9 dias" | A | |
| CT-40 | RF-20 | Em modo avião, abrir T03, T04 e simular em T11 | Tudo exibido com a hora da última sincronização | M | |
| CT-41 | RF-20 | Em modo avião, cadastrar compra; depois reconectar | Aparece na hora; após reconectar, existe na API | M | |
| CT-42 | RF-20, RNF-06 | API fora do ar; puxar a lista | Mensagem de falha; nenhum dado local apagado | M | |

### Administração

| CT | Req. | Cenário | Esperado | Tipo | Resultado |
|:---:|:---:|---|---|:---:|---|
| CT-43 | RF-21 | Bloquear uma conta; ela tenta entrar | Acesso negado; T13 mostra autor e data | M | |
| CT-44 | RF-21, RN08 | Usuário A pede compra de B; procurar rota de compras no admin | A recebe 404; não existe a rota | A | |
| CT-45 | RF-22 | Cotação manual de EUR fora de ±50% | Pede confirmação; grava como manual com autor | M | |
| CT-46 | RF-22, RN10 | Publicar versão 4 com vigência futura | Simulação de hoje igual; na nova data usa a versão 4 | A | |
| CT-47 | RF-23, RN03 | Fonte simulada falhando em 3 compras | Execução "parcial" com causa em T15 | M | |

### Sincronização, sessão e ocorrências

| CT | Req. | Cenário | Esperado | Tipo | Resultado |
|:---:|:---:|---|---|:---:|---|
| CT-48 | RF-20 | Enviar a mesma criação duas vezes (resposta perdida) | `accepted` nas duas; uma linha só | A | |
| CT-49 | RF-20 | Editar a mesma compra em dois aparelhos e sincronizar os dois | O segundo recebe `SYNC_CONFLICT` com a versão do primeiro | A | |
| CT-50 | RF-20 | Excluir loja no aparelho A; sincronizar B | A loja some de B | M | |
| CT-51 | RF-20 | Cursor com 40 dias e uma compra pendente | Retrato completo (`reset`); a compra pendente é enviada e mantida | A | |
| CT-52 | RF-20 | Editar compra em B que foi excluída em A | `NOT_FOUND`; edição descartada com aviso | A | |
| CT-53 | RF-10, RN01 | Confirmar recebimento de compra em trânsito e atrasada | Situação Entregue; sinalização de atraso some; nenhum alerta novo | M | |
| CT-54 | RF-03, RF-21 | Sair da conta; depois, bloquear outra conta pelo administrador | Renovação recusada com `SESSION_EXPIRED` nos dois casos | A | |
| CT-55 | RNF-02 | Reusar um token de renovação já trocado | Toda a família revogada; o token novo também deixa de valer | A | |
| CT-56 | RN06, RN11 | Ler o alerta de atraso, reavaliar; aplicar a retenção e reavaliar | Nenhum alerta novo em nenhum dos dois casos | A | |
| CT-57 | RF-20, RN01 | Compra passa a Entregue; o aparelho faz dois pulls seguidos | `purchaseStates` traz a compra como `DELIVERED` nos dois; no aparelho continua Entregue, com campos travados | A | |
| CT-58 | RF-23 | Execução de rastreio deixada `RUNNING` há 41 min; rodar a rotina | A órfã vira `FAILED` com a causa; a nova execução abre e roda | A | |
| CT-59 | RF-12, RF-20 | Loja excluída em A; B, sem rede, cria compra nela e depois sincroniza | Compra `DEPENDENCY_REJECTED` no campo da loja; o pull conclui e o cursor avança; a loja some da lista de B; escolhida outra loja, a compra é aceita | A | |
| CT-60 | RF-03, RF-21 | Sair com `pushToken`; bloquear outra conta; gerar alerta para as duas | Aparelhos removidos; os alertas ficam na aba, sem push enviado | A | |
| CT-61 | RF-03, RN04 | Com taxa registrada, sair da conta em modo avião e depois reconectar | Nenhum lembrete de taxa dispara; ao reconectar, a saída chega à API e o aparelho não recebe push da conta | M | |

**Total:** 61 casos · 33 automatizados · 28 manuais.
