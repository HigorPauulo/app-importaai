---
description: Gera um Conventional Commit em PT-BR a partir do que está staged, no padrão do Importa Aí
---

Proponha a mensagem de commit do que está **staged**, seguindo o [CONTRIBUTING.md](../../CONTRIBUTING.md#commits).

1. `git branch --show-current`. Em `main` ou `develop`, **pare** e sugira criar a branch certa.
2. `git diff --cached`. Se nada estiver staged, diga isso e pare: **não** rode `git add` por conta própria.
3. Se o diff mistura mudanças independentes (ex.: código da API e ajuste de docs sem relação),
   proponha dividir em commits separados e diga quais arquivos vão em cada um.
4. Sinalize antes de commitar: `.env`, credencial, `console.log`, `System.out.println`,
   `printStackTrace`, código comentado sem uso (R12 do Norteador).
5. Monte a mensagem:
   - `<tipo>(<escopo>): <descrição no imperativo>`, até 72 caracteres, sem ponto final.
   - Tipo e escopo só da lista do CONTRIBUTING.
   - Corpo opcional explicando o **porquê**, e rodapé com `Refs: US-10` ou `Closes #12` quando houver.
   - **Nunca** `Co-Authored-By` nem qualquer atribuição de IA.
6. Mostre a mensagem e espere o integrante confirmar. Só então `git commit`.
