# ADR-001 · Plataforma móvel

**Status:** aceita · 28/09/2026

## Contexto

O app precisa rodar em Android 10+ em aparelho físico, funcionar sem conexão com banco local e receber notificações com o app fechado. A equipe tem três pessoas, com uma só dedicada ao app, e oito semanas de implementação; já trabalha com React e TypeScript. O Norteador (§4) admite Kotlin, Flutter e React Native, exigindo justificativa por custo, curva de aprendizado, adequação e implicação arquitetural.

## Decisão

**React Native com Expo e TypeScript**, usando Expo Router (navegação), React Hook Form e Zod (formulários), `expo-sqlite` (banco local), `expo-secure-store` (sessão), `expo-notifications` (avisos) e EAS Build (APK).

## Alternativas consideradas

| | Custo | Curva de aprendizado | Adequação | Implicação |
|---|---|---|---|---|
| Kotlin + Compose | zero | **alta**: linguagem e ecossistema novos | excelente acesso nativo | camadas naturais |
| Flutter | zero | **alta**: Dart e widgets novos | boa | exige escolher gerência de estado |
| **React Native + Expo** | zero | **baixa**: stack da equipe | boa: SQLite, sessão segura e notificações são módulos oficiais | domínio em TypeScript puro, testável com Jest |

## Consequências

- **+** O tempo vai para o domínio, não para aprender linguagem.
- **+** O mesmo esquema Zod valida formulário e domínio, sem regra duplicada.
- **+** APK gerado sem configurar o SDK Android localmente.
- **−** Desempenho de listas abaixo do nativo em grandes volumes; irrelevante para dezenas de compras.
- **−** Notificações push só funcionam em build instalado, não no Expo Go; testar em aparelho desde o Ciclo 1.
