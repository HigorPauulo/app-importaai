# Backlog

O que será construído e em qual ciclo: 38 histórias e 2 itens técnicos, **184 pontos**. O acompanhamento diário fica no GitHub Projects do repositório.

**Pontos** em Fibonacci (esforço relativo, não horas). Uma história só entra em ciclo com critério de aceite.

---

## Responsabilidades

A divisão é por camada. A coluna **Parte** de cada história diz onde ela é implementada.

| Parte | Responsável | Inclui |
|---|---|---|
| **API** | Higor | Serviços, DAOs, banco, migrations, rotinas agendadas, integrações externas, push |
| **App** | Diogo | Telas, domínio do app, banco local, sincronização no aparelho, notificações locais, APK |
| **Testes e documentação** | Alex | Testes automatizados (Jest e JUnit com Testcontainers) e manuais de cada história, registro de defeitos, sessões de usabilidade, documentação e entregas |

Uma história que envolve App e API só está pronta quando as duas partes e os testes estão integrados.

---

## Por ciclo

| Ciclo | Semanas | Entrega | Pts | Marco |
|:---:|---|---|:---:|---|
| 1 | 7 a 9 | Estrutura do app e da API, acesso, lojas | 28 | Entrega N1 |
| 2 | 11 e 12 | Compras, ofertas, simulação, busca | 50 | |
| 3 | 13 e 14 | Rastreio, sincronização, alertas | 65 | Checkpoint 2 |
| 4 | 16 e 17 | Painel, administração, acessibilidade, APK | 41 | Congelamento |

| Ciclo | Higor (API) | Diogo (App) | Alex (testes e documentação) |
|:---:|---|---|---|
| 1 | Estrutura da API, autenticação | Estrutura do app, telas de acesso, lojas no banco local | Quadro de tarefas, testes do acesso e das lojas, PDF da N1 |
| 2 | Cotações, parâmetros fiscais, validações de compra, rotas de sincronização | Compras, ofertas, simulação, comparação, busca | Testes de RN07, RN09 e RN10; roteiro manual do ciclo |
| 3 | Rastreio, deduplicação, situação, alertas, push | Base local e sincronização no aparelho, taxa, central de alertas | Testes de integração de RN01 a RN06; preparação das sessões de usabilidade |
| 4 | Administração, correções | Painel, telas de administração, acessibilidade, APK | Sessões de usabilidade, registro de defeitos, relatório final |

O Ciclo 3 é o mais arriscado: 65 pontos, com sincronização e alertas, sustentando o Checkpoint 2. Para aliviá-lo, o rastreio simulado (US-17) e a base local (US-20) começam no fim do Ciclo 2.

**Se faltar capacidade**, corta-se nesta ordem: US-31, US-33, US-34. A velocidade medida no Ciclo 1 decide.

---

## Itens técnicos

| ID | Entrega | Pts | Ciclo | Parte |
|:---:|---|:---:|:---:|:---:|
| H-01 | Projeto Expo com camadas, rotas dos dois perfis, componentes do design system e banco local | 5 | 1 | App |
| H-02 | Projeto Spring com camadas, PostgreSQL no Docker, migrations do modelo de dados e erro padrão | 5 | 1 | API |

## Acesso

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-01 | Como visitante, quero criar conta para ter meu acervo | M | 3 | 1 | App + API | RF-01 |
| US-02 | Como usuário, quero entrar para acessar só o que é meu | M | 5 | 1 | App + API | RF-02 |
| US-03 | Como usuário, quero alterar meus dados e sair | M | 2 | 1 | App + API | RF-03 |
| US-04 | Como sistema, quero bloquear após 5 falhas para dificultar tentativas | M | 3 | 1 | API | RF-02 |

**Aceite de US-02:** credencial válida inicia sessão com prazo, guardada em armazenamento seguro; inválida não diz se o erro foi no e-mail ou na senha; conta bloqueada mostra o tempo restante; sessão expirada volta para T01 lembrando o destino.

## Compras

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-05 | Como comprador, quero cadastrar uma compra com o código de rastreio | M | 5 | 2 | App + API | RF-08 |
| US-06 | Como comprador, quero ver o valor em reais pela cotação do dia da compra | M | 5 | 2 | App + API | RF-09 |
| US-07 | Como comprador, quero ver o detalhe com a linha do tempo | M | 3 | 2 | App | RF-09 |
| US-08 | Como comprador, quero corrigir um dado errado | M | 3 | 2 | App | RF-10 |
| US-09 | Como comprador, quero excluir ou arquivar uma compra | M | 3 | 2 | App | RF-11 |
| US-10 | Como comprador, quero manter minhas lojas | M | 5 | 1 | App | RF-12 |
| US-11 | Como sistema, quero impedir código repetido por usuário | M | 2 | 2 | App + API | RF-08 |
| US-12 | Como sistema, quero impedir alteração de compra concluída | M | 3 | 2 | App + API | RN09 |

**Aceite de US-05:** validação antes de enviar, com a razão junto ao campo (data não futura, prazo depois da compra, valor maior que zero); código repetido oferece abrir a compra existente; funciona sem conexão e sincroniza depois.

## Ofertas e simulação

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-13 | Como comprador, quero registrar ofertas agrupadas por produto | M | 5 | 2 | App | RF-04 |
| US-14 | Como comprador, quero ver o custo final estimado, parcela por parcela | M | 8 | 2 | App + API | RF-05 |
| US-15 | Como comprador, quero comparar as ofertas de um produto | M | 5 | 2 | App | RF-06 |
| US-16 | Como comprador, quero transformar a oferta escolhida em compra sem redigitar | M | 3 | 2 | App | RF-07 |

**Aceite de US-14:** com os parâmetros de teste, o total confere com o cálculo manual abaixo do limite, no limite e acima dele; rotulado como estimativa; funciona sem conexão.

## Rastreio e sincronização

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-17 | Como comprador, quero receber os eventos de rastreio automaticamente | M | 8 | 3 | API | RF-13 |
| US-18 | Como sistema, quero descartar evento já importado | M | 5 | 3 | API | RF-13 |
| US-19 | Como sistema, quero calcular a situação pelo último evento | M | 5 | 3 | API | RN01 |
| US-20 | Como comprador, quero consultar e simular sem conexão | M | 8 | 3 | App | RF-20 |
| US-21 | Como comprador, quero que minhas alterações sejam aplicadas ao reconectar | M | 8 | 3 | App + API | RF-20 |
| US-22 | Como sistema, quero não apagar nada do que já obtive quando algo falha | M | 3 | 3 | App + API | RNF-06 |

**Aceite de US-18:** três importações seguidas, inclusive simultâneas, produzem o mesmo conjunto de eventos.

## Alertas

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-23 | Como comprador, quero saber quando passar do prazo | M | 5 | 3 | API | RF-15 |
| US-24 | Como comprador, quero saber quando o pacote parar | M | 5 | 3 | API | RF-15 |
| US-25 | Como comprador, quero ser avisado da taxa e lembrado do vencimento | M | 5 | 3 | App + API | RF-16 |
| US-26 | Como comprador, quero saber quando a janela de reclamação vai fechar | M | 5 | 3 | API | RF-15 |
| US-27 | Como sistema, quero emitir um único alerta por ocorrência | M | 5 | 3 | API | RN06 |
| US-28 | Como comprador, quero ver o histórico de alertas e marcar como lidos | M | 3 | 3 | App + API | RF-17 |

**Aceite de US-27:** três avaliações da mesma condição, inclusive simultâneas, geram uma só notificação; ler e reavaliar não gera outra; um fato novo (outro prazo, outro vencimento) gera.

## Consolidação

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-29 | Como comprador, quero buscar, filtrar e ordenar minhas compras | M | 5 | 2 | App | RF-14 |
| US-30 | Como comprador, quero ver quanto tenho em trânsito, quanto gastei e quanto paguei de imposto | M | 5 | 4 | App | RF-18 |
| US-31 | Como comprador, quero ver a pontualidade de cada loja | S | 5 | 4 | App | RF-19 |

## Administração

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-32 | Como administrador, quero listar contas e bloquear ou reativar | M | 5 | 4 | App + API | RF-21 |
| US-33 | Como administrador, quero corrigir a cotação e publicar parâmetros fiscais | M | 5 | 4 | App + API | RF-22 |
| US-34 | Como administrador, quero ver falhas da integração antes do usuário reclamar | M | 5 | 4 | App + API | RF-23 |
| US-35 | Como sistema, quero impedir o administrador de ver ofertas e compras | M | 3 | 4 | API | RN08 |

## Qualidade e distribuição

| ID | História | Prio | Pts | Ciclo | Parte | Req. |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| US-36 | Como usuário com baixa visão, quero contraste e toque confortáveis | M | 5 | 4 | App | RNF-04 |
| US-37 | Como usuário de leitor de tela, quero rótulos descritivos | M | 5 | 4 | App | RNF-04 |
| US-38 | Como equipe, queremos gerar o APK e comprovar em aparelho físico | M | 3 | 4 | App | R14 |

---

A definição de pronto está no [CONTRIBUTING](../../CONTRIBUTING.md#definição-de-pronto).
