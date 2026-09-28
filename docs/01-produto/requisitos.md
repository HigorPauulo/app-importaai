# Requisitos

O que o sistema faz (23 requisitos funcionais) e com que qualidade (10 não funcionais).

**Prioridade (MoSCoW):** M obrigatório · S importante · C desejável · W fora desta versão. Todo requisito M tem caso de teste no [plano de testes](../05-qualidade/plano-de-testes.md).

---

## Funcionais

### Conta e acesso

| ID | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| RF-01 | Criar conta com nome, e-mail único e senha de 8+ caracteres com letras e números | M | RN08 | T02 |
| RF-02 | Autenticar com sessão por prazo; 5 falhas bloqueiam por 15 minutos | M | RN08 | T01 |
| RF-03 | Consultar e alterar os próprios dados, encerrar sessão e excluir a conta | M | RN08 | T09 |

### Planejamento da compra

| ID | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| RF-04 | Manter grupos de produto e suas ofertas (loja, preço, frete, moeda) | M | RN08 | T10, T11 |
| RF-05 | Simular o custo final em reais, discriminando valor aduaneiro, imposto de importação e ICMS | M | RN07, RN10 | T11 |
| RF-06 | Comparar as ofertas de um mesmo produto, indicando a menor e de onde vem a diferença | M | RN07, RN10 | T12 |
| RF-07 | Converter uma oferta em compra, aproveitando os dados já informados | M | · | T05, T11, T12 |

### Compras

| ID | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| RF-08 | Cadastrar compra com produto, código de rastreio, loja, datas, valor, frete e moeda; código único por usuário | M | RN09 | T05 |
| RF-09 | Ver o detalhe da compra com valor na origem e em reais e a linha do tempo do rastreio | M | RN01, RN07 | T04 |
| RF-10 | Alterar compra, exceto os campos protegidos de compra concluída, e confirmar o recebimento | M | RN01, RN09 | T04, T05 |
| RF-11 | Excluir ou arquivar compra | M | RN09 | T03, T04 |
| RF-12 | Manter lojas; loja usada por oferta ou compra não pode ser excluída | M | · | T07 |

### Rastreio e alertas

| ID | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| RF-13 | Importar eventos da fonte de rastreio sem duplicar, registrando cada execução | M | RN01 | T03, T04 |
| RF-14 | Listar compras com busca, filtro por situação e sinalização, e ordenação | M | RN01 | T03 |
| RF-15 | Detectar atraso, pacote parado e fim próximo da janela de reclamação, e avisar | M | RN02, RN03, RN05, RN06 | T03, T08 |
| RF-16 | Detectar taxa cobrada, registrar valor e vencimento, e lembrar antes de vencer | M | RN04, RN06 | T04, T08 |
| RF-17 | Consultar o histórico de alertas e marcar como lidos | M | RN06, RN11 | T08 |

### Consolidação e uso sem conexão

| ID | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| RF-18 | Mostrar compras por situação, valor em trânsito, gasto no período e impostos pagos | M | RN01, RN07 | T06 |
| RF-19 | Mostrar o atraso médio de cada loja em relação ao prazo prometido | S | RN02 | T06 |
| RF-20 | Consultar, simular e cadastrar sem conexão; sincronizar ao reconectar | M | · | T03, T04, T10 |

### Administração

| ID | Requisito | Prio | Regras | Telas |
|:---:|---|:---:|:---:|:---:|
| RF-21 | Listar contas, bloquear e reativar, sem acesso a ofertas ou compras | M | RN08 | T13 |
| RF-22 | Definir cotação manual e publicar nova versão dos parâmetros fiscais | M | RN07, RN10 | T14 |
| RF-23 | Acompanhar a integração: última sincronização, falhas e compras sem atualização | M | RN03 | T15 |

### Fora desta versão

| ID | Requisito | Prio | Motivo |
|:---:|---|:---:|---|
| RF-24 | Várias encomendas numa mesma compra | W | Dobra a complexidade do modelo sem mudar o fluxo principal |
| RF-25 | Compartilhar o acompanhamento | W | Exige convite e permissão por item |
| RF-26 | Ler o código de rastreio pela câmera | C | Conveniência; reavaliar no Ciclo 4 |
| RF-27 | Exportar histórico | W | Não apoia nenhuma decisão do fluxo principal |
| RF-28 | Buscar ofertas automaticamente nas lojas | W | As plataformas não oferecem interface pública |

---

## Não funcionais

| ID | Categoria | Requisito | Como verificar |
|:---:|---|---|---|
| RNF-01 | Desempenho | A lista de compras abre em até 2 s a partir da base local, em aparelho intermediário | Medição no aparelho |
| RNF-02 | Segurança | Senha com hash e sal; sessão curta, revogável e em armazenamento seguro; chaves só em variáveis de ambiente; tráfego só em HTTPS | Revisão de código e do histórico; CT-54, CT-55 |
| RNF-03 | Usabilidade | Ação destrutiva pede confirmação; erro aparece junto ao campo, com a razão | Sessões de usabilidade |
| RNF-04 | Acessibilidade | Contraste WCAG AA; alvo de toque de 48 dp; rótulos para leitor de tela | TalkBack e medição |
| RNF-05 | Disponibilidade | Abre, consulta e simula sem conexão, informando a hora da última sincronização | Teste em modo avião |
| RNF-06 | Confiabilidade | Chamada externa com tempo limite; falha não impede o uso local nem apaga dado | Simulação de queda |
| RNF-07 | Portabilidade | Android 10 (API 29) ou superior, em aparelho físico | Instalação do APK |
| RNF-08 | Manutenibilidade | Camadas com dependência só para dentro; regras testáveis sem tela nem rede | Revisão de código |
| RNF-09 | Privacidade | Coleta mínima; ninguém acessa dado de outro usuário; exclusão da própria conta | Testes de acesso |
| RNF-10 | Localização | Português do Brasil; moeda e data no formato local | Inspeção |

---

## Requisitos mínimos do Norteador (§5)

| | Requisito | Como atendemos |
|:---:|---|---|
| R1 | 6+ telas | 15 telas ([telas](../03-design/telas.md)) |
| R2 | 2 perfis | Comprador e administrador (RF-02, RF-21 a RF-23, RN08) |
| R3 | CRUD em 2 entidades | Compras, lojas e ofertas (RF-04, RF-08 a RF-12) |
| R4 | 3+ regras não triviais | 11 regras ([regras de negócio](regras-de-negocio.md)) |
| R5 | Persistência local | SQLite no aparelho (RF-20, ADR-003) |
| R6 | Persistência remota | API com PostgreSQL e sincronização (ADR-002, ADR-003) |
| R7 | API externa | Rastreio e cotação (ADR-005, ADR-006) |
| R8 | Recurso nativo | Notificações no aparelho (ADR-007) |
| R9 | Filtro e visão consolidada | RF-14 e RF-18 |
| R10 | Erros e estados | Quatro estados em toda tela; contrato de erro da API |
| R11 | Usabilidade e acessibilidade | RNF-03, RNF-04 ([usabilidade](../03-design/usabilidade-e-acessibilidade.md)) |
| R12 | Camadas e segredos | RNF-02, RNF-08 ([arquitetura](../02-arquitetura/visao-geral.md)) |
| R13 | Versionamento | [CONTRIBUTING](../../CONTRIBUTING.md) |
| R14 | APK em aparelho físico | RNF-07, US-38 |
