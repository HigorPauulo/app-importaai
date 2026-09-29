# Roadmap

Onde o projeto está, o que vem a seguir e o que pode dar errado. Atualizado ao fim de cada ciclo.

---

## Agora

**Semana 9 (28/09 a 02/10): entrega da N1.** Especificação, arquitetura e protótipo prontos; implementação começando.

| Próximo passo | Quem | Até |
|---|:---:|:---:|
| Pedir à coordenação autorização formal para equipe de 3 (§3.2) e registrar a equipe | equipe | 29/09 |
| Definir o coordenador e o nome da equipe na [ficha](docs/04-projeto/equipe.md) | equipe | 29/09 |
| Criar o quadro no GitHub Projects com o [backlog](docs/04-projeto/backlog.md) | Alex | 29/09 |
| Estrutura da API (H-02) e autenticação | Higor | 02/10 |
| Estrutura do app (H-01), telas de acesso e lojas no banco local (US-10) | Diogo | 02/10 |
| Ligar as telas do [protótipo](docs/03-design/prototipo.md) | Diogo | 01/10 |
| Testes do acesso e das lojas; montar o PDF da [N1](docs/06-entregas/n1.md) | Alex | 02/10 |
| Ensaiar a apresentação | todos | 01/10 |

---

## Marcos

| Data | Marco | Situação |
|:---:|---|:---:|
| 14/08 | Registro das equipes | pendente |
| 21/08 | Proposta de tema | resolvido |
| 11/09 | Checkpoint 1: escopo, protótipo, backlog e modelo de dados | a confirmar |
| **28/09 a 02/10** | **Entrega N1** | **em curso** |
| 06/11 | Checkpoint 2: versão beta com persistência e API externa | |
| 09 a 13/11 | Testes com 5 ou mais usuários externos | |
| 27/11 | Congelamento de escopo | |
| 04/12 | Documentação final | |
| 07 a 11/12 | Entrega N2 e mostra final | |

## Ciclos

| Semanas | Ciclo | Entrega | Pts |
|---|:---:|---|:---:|
| 7 a 9 (14/09 a 02/10) | 1 | Especificação, protótipo; estrutura do app e da API, acesso, lojas | 28 |
| 10 (05 a 09/10) | · | Devolutiva da N1 e replanejamento | |
| 11 e 12 (13 a 23/10) | 2 | Compras, ofertas, simulação, comparação, busca; base local da sincronização | 50 |
| 13 e 14 (26/10 a 06/11) | 3 | Rastreio, sincronização, alertas, push | 65 |
| 15 (09 a 13/11) | · | Testes funcionais e de usabilidade | |
| 16 e 17 (16 a 27/11) | 4 | Painel, administração, acessibilidade, APK em aparelho | 41 |
| 18 (30/11 a 04/12) | · | Relatório final e README | |

---

## Riscos

| Risco | Probabilidade | Mitigação |
|---|:---:|---|
| Equipe de 3 sem autorização formal (§3.2 exige 4) | alta | Pedir autorização por escrito à coordenação até 29/09 |
| Aplicação parcial da N1 começando na semana da entrega | alta | Ciclo 1 reduzido a 28 pontos, com backend e frontend em paralelo |
| Carga de 184 pontos para 3 pessoas | alta | Medir a velocidade no Ciclo 1 e cortar na ordem do backlog |
| Commits concentrados derrubam o FPI | média | Cada um com área própria no repositório (`api/`, `app/`, testes e `docs/`); revisão cruzada em todo PR |
| Atribuição de testes e documentação pesar pouco no histórico | média | Alex escreve os testes automatizados, que são código com commits próprios, além da documentação |
| Fonte de rastreio real inviável (cota, contrato) | média | Adaptador simulado; validar a fonte real até o Ciclo 3 (ADR-005) |
| Sincronização atrasar o Ciclo 3 | média | Base local antecipada para o Ciclo 2; plano de redução no ADR-003 |
| Parâmetros fiscais desatualizados | média | Versionados e conferidos na legislação antes do Ciclo 2; total sempre como estimativa |
| Testar só no emulador | baixa | Build instalado no aparelho desde o Ciclo 1 |
| Integrante não saber defender o código | baixa | Revisão cruzada entre backend e frontend; Alex conhece os dois lados pelos testes |

---

## Decisões

Todas registradas como ADR em [docs/02-arquitetura/decisoes](docs/02-arquitetura/decisoes/). Pendentes de validação: fonte de rastreio real (Ciclo 3) e limites das fontes de cotação (Ciclo 2).

## Avaliação

| N1 | Pts | N2 | Pts |
|---|:---:|---|:---:|
| Documento de projeto | 2,5 | Aplicação concluída (R1 a R14) | 3,5 |
| Modelagem e arquitetura | 1,5 | Qualidade técnica | 2,0 |
| Protótipo navegável | 2,0 | Testes e usabilidade | 1,5 |
| Aplicação parcial | 2,0 | Relatório e README | 1,5 |
| Gestão e versionamento | 1,0 | Mostra final e arguição | 1,5 |
| Apresentação | 1,0 | | |

Cada etapa vale até 4,0 pontos na nota da disciplina (PP1 na N1, PP2 na N2). A nota individual é a da equipe multiplicada pelo Fator de Participação Individual (0 a 1), baseado no histórico de commits, nas responsabilidades e na arguição.
