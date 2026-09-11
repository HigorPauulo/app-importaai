# Projeto Integrador · ADS1253 · 2026/2

![Disciplina](https://img.shields.io/badge/ADS1253-PUC%20Goi%C3%A1s-1F3864) ![Semestre](https://img.shields.io/badge/semestre-2026%2F2-4B5563) ![Fase](https://img.shields.io/badge/fase-escopo-D9A441) ![Estado](https://img.shields.io/badge/artefatos-rascunho-9CA3AF)

Aplicação móvel para acompanhamento de compras internacionais, com rastreio integrado.

> **Estado:** especificação concluída · implementação não iniciada · pilha em definição. Ver [`ROADMAP.md`](ROADMAP.md).

---

## O problema

Ferramentas de rastreio sabem **onde o pacote está**. Não sabem o que há dentro, quanto custou, qual prazo foi prometido nem se houve imposto. Sem esse cruzamento, três falhas se repetem:

| Falha | Consequência |
|---|---|
| Aviso de taxa não percebido | Devolução e perda integral do valor |
| Atraso não percebido | Perda da janela de reclamação |
| Pacote parado sem aviso | Extravio descoberto fora do prazo |

O aplicativo cruza o que só o comprador sabe (produto, valor, loja, prazo prometido, imposto) com o que a fonte de rastreio informa, e alerta antes que o prazo passe.

## Perfis

| | Acesso |
|---|---|
| **Comprador** | Mantém as próprias compras e lojas, acompanha o rastreio, recebe alertas |
| **Administrador** | Gerencia contas e a saúde da integração. **Não vê conteúdo de compra** |

## Modelo de dados

Seis entidades: `users` · `stores` · `purchases` · `tracking_events` · `exchange_rates` · `notifications`.

Duas decisões governam o esquema:

> **O estado da compra não é armazenado.** É derivado do último evento de rastreio (RN01). Estado ao lado dos eventos que o determinam cria duas fontes de verdade, que divergem na primeira falha de sincronização.

> **O valor em reais não é armazenado.** Vem da cotação da data da compra (RN07). Pela cotação corrente, o consolidado oscilaria todo dia sem nenhuma compra ter mudado.

## Documentação

| | Documento | Conteúdo |
|---|---|---|
| | [`ROADMAP.md`](ROADMAP.md) | Estado, artefatos, cronograma, decisões |
| A1 | [Domínio](docs/01-escopo/dominio.md) | Escopo, vocabulário, cortes |
| A2 | [Personas](docs/01-escopo/personas.md) | Público-alvo e cenário de demonstração |
| A3 | [Requisitos](docs/01-escopo/requisitos.md) | 19 funcionais, 10 não funcionais |
| A4 | [Regras de negócio](docs/01-escopo/regras-de-negocio.md) | 9 regras verificáveis |
| A12 | [Backlog](docs/04-gestao/backlog.md) | 33 histórias, 7 épicos, 96 pontos |
| A6 | [Modelagem](docs/02-modelagem/der.md) | DER, dicionário, normalização, índices |
| A9 | [Navegação](docs/03-interfaces/navegacao.md) | Mapa e 11 telas com estados |
| A14 | [Rastreabilidade](docs/04-gestao/rastreabilidade.md) | Requisito → regra → tela → teste → commit |
| | `docs/00-referencia/` | Documento Norteador e material da disciplina |

## Instalação e execução

Pendente da definição da pilha (decisões **D3** e **D4** do roadmap). Esta seção receberá requisitos de ambiente, passos de execução, variáveis necessárias e credenciais de teste por perfil, conforme a Seção 9 do Documento Norteador.

## Convenções

Documentação em português, código em inglês · commits em português, no imperativo · `main` estável, `develop` integração, `feature/*` por funcionalidade · integração por PR revisado por outro integrante · credenciais em variável de ambiente, nunca versionadas.

---

Atividade Externa da Disciplina (AED) · ADS1253 Programação Orientada a Objeto com Banco de Dados · PUC Goiás · 2026/2 · Prof. Welington Júlio.
