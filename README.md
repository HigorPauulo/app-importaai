# Importa Aí

![Disciplina](https://img.shields.io/badge/ADS1253-PUC%20Goi%C3%A1s-1F3864) ![Semestre](https://img.shields.io/badge/semestre-2026%2F2-4B5563) ![App](https://img.shields.io/badge/app-React%20Native%20%2B%20Expo-0D6EFD) ![API](https://img.shields.io/badge/API-Spring%20Boot%20%2B%20PostgreSQL-2EA145)

Aplicativo Android para quem compra no exterior: **estima o custo final antes da compra** e **acompanha a encomenda depois dela**, avisando a tempo de pagar a taxa, reclamar de um atraso ou investigar um pacote parado, inclusive sem internet.

---

## O que faz

| Antes da compra | Depois da compra |
|---|---|
| Registra ofertas de lojas diferentes | Importa o rastreio automaticamente |
| Calcula o custo final: preço, frete, câmbio e imposto | Mostra onde cada pacote está e o que exige atenção |
| Compara ofertas do mesmo produto e aponta a mais barata | Avisa de taxa, atraso, pacote parado e prazo de reclamação |
| Transforma a oferta escolhida em compra | Consolida gastos, impostos e pontualidade das lojas |

Tudo funciona sem conexão e sincroniza quando a rede volta. Um perfil de administrador cuida de contas, câmbio, parâmetros fiscais e da integração, sem acesso às compras dos usuários.

## Como funciona

| Parte | Tecnologia |
|---|---|
| App | React Native, Expo e TypeScript, com SQLite no aparelho |
| API | Java 21 e Spring Boot 4, com JDBC, DAOs e PostgreSQL 18 |
| Integrações | Fonte de rastreio, fonte de cotação e notificações push |

O app lê e grava primeiro no aparelho e sincroniza com a API em segundo plano. A API importa o rastreio, calcula a situação das compras e dispara os alertas. Detalhes na [arquitetura](docs/02-arquitetura/visao-geral.md).

## Estrutura

```
app/          aplicativo (Expo)
api/          serviço (Spring Boot)
docs/         documentação
compose.yml   PostgreSQL para desenvolvimento
```

## Como rodar

> A estrutura de código é criada no Ciclo 1. Esta seção será completada com a primeira versão executável.

Requisitos: Node 24, Java 21, Docker.

```bash
cp .env.example .env            # preencher as variáveis
docker compose up -d            # PostgreSQL
cd api && ./mvnw spring-boot:run
cd app && npm install && npx expo start
```

O APK de demonstração e as credenciais de teste de cada perfil serão publicados aqui na entrega da N2.

## Documentação

| Para | Leia |
|---|---|
| Entender o produto | [Visão](docs/01-produto/visao.md) · [Requisitos](docs/01-produto/requisitos.md) · [Regras de negócio](docs/01-produto/regras-de-negocio.md) |
| Desenvolver | [Arquitetura](docs/02-arquitetura/visao-geral.md) · [API](docs/02-arquitetura/api.md) · [Modelo de dados](docs/02-arquitetura/modelo-de-dados.md) · [Decisões](docs/02-arquitetura/decisoes/) |
| Desenhar | [Telas](docs/03-design/telas.md) · [Protótipo](docs/03-design/prototipo.md) |
| Acompanhar | [Roadmap](ROADMAP.md) · [Backlog](docs/04-projeto/backlog.md) |
| Contribuir | [CONTRIBUTING](CONTRIBUTING.md) |

Índice completo em [docs](docs/README.md).

---

Projeto Integrador · ADS1253 Programação Orientada a Objeto com Banco de Dados · PUC Goiás · 2026/2 · Prof. Welington Júlio.
