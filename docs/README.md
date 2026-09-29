# Documentação

Índice de toda a documentação do Importa Aí. Comece pela [visão do produto](01-produto/visao.md).

---

## Produto

| Documento | Responde |
|---|---|
| [Visão](01-produto/visao.md) | Qual problema, para quem, com que objetivos e o que fica de fora |
| [Glossário](01-produto/glossario.md) | O que significa cada termo do domínio |
| [Requisitos](01-produto/requisitos.md) | O que o sistema faz e com que qualidade |
| [Regras de negócio](01-produto/regras-de-negocio.md) | Que regras o sistema impõe e como verificá-las |

## Arquitetura

| Documento | Responde |
|---|---|
| [Visão geral](02-arquitetura/visao-geral.md) | Como o sistema se divide, onde cada regra roda, como sincroniza |
| [API](02-arquitetura/api.md) | Rotas, formatos e erros |
| [Modelo de domínio](02-arquitetura/modelo-de-dominio.md) | Classes, objetos de valor, regras de alerta e estados |
| [Modelo de dados](02-arquitetura/modelo-de-dados.md) | Tabelas, garantias no banco, índices e base local · [SQL](02-arquitetura/sql/) |
| [Sincronização](02-arquitetura/sincronizacao.md) | Como aparelho e servidor trocam alterações sem perder nem duplicar |
| [Decisões](02-arquitetura/decisoes/) | Por que cada tecnologia e abordagem, e o que foi descartado |

## Design

| Documento | Responde |
|---|---|
| [Telas](03-design/telas.md) | Que telas existem, como se ligam e o que mostram em cada estado |
| [Protótipo](03-design/prototipo.md) | Onde está no Figma e como percorrê-lo |
| [Usabilidade e acessibilidade](03-design/usabilidade-e-acessibilidade.md) | Que decisões de interface foram tomadas e por quê |

## Projeto

| Documento | Responde |
|---|---|
| [Backlog](04-projeto/backlog.md) | O que será construído, por quem e quando |
| [Equipe](04-projeto/equipe.md) | Quem é responsável por quê, e o registro de cada ciclo |
| [Roadmap](../ROADMAP.md) | Onde estamos, próximos passos e riscos |
| [Como contribuir](../CONTRIBUTING.md) | Branches, commits, PR, revisão, versões e definição de pronto |
| [Regras do assistente](../CLAUDE.md) | Como o Claude Code trabalha neste repositório |

## Qualidade

| Documento | Responde |
|---|---|
| [Plano de testes](05-qualidade/plano-de-testes.md) | Como cada requisito e regra é verificado |
| [Rastreabilidade](05-qualidade/rastreabilidade.md) | Onde cada requisito aparece: regra, dados, tela, teste e código |

## Entregas

| Documento | Responde |
|---|---|
| [N1](06-entregas/n1.md) | O que a N1 exige, como montar o PDF e a apresentação |
| [Declaração de uso de IA](06-entregas/declaracao-ia.md) | Como a IA foi usada no projeto |

## Referência

[Documento Norteador e material da disciplina](00-referencia/) · [Referências bibliográficas](00-referencia/referencias.md). Em caso de divergência, **o Norteador prevalece**.

---

## Convenções

| Prefixo | Significado |
|:---:|---|
| RF · RNF | Requisito funcional · não funcional |
| RN | Regra de negócio |
| US · H | História de usuário · item técnico |
| T | Tela |
| CT | Caso de teste |
| ADR | Registro de decisão de arquitetura |
