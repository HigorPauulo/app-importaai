---
description: Abre um Pull Request para develop com o template do Importa Aí
argument-hint: [título opcional]
---

Abra o PR da branch atual seguindo o [CONTRIBUTING.md](../../CONTRIBUTING.md#pull-requests).

1. `git branch --show-current`. Nunca abrir PR a partir de `main` ou `develop`.
2. Base: `develop`. A única exceção é o PR de entrega `develop` → `main`, aberto pelo responsável técnico.
3. `git fetch origin && git rebase origin/develop` se a branch estiver atrás. Em conflito, pare e explique.
4. Rode o gate do lado alterado (tabela "Qualidade" do [CLAUDE.md](../../CLAUDE.md)). Vermelho: pare.
5. `git push -u origin HEAD`.
6. Título: `$ARGUMENTS` ou o commit principal, no formato Conventional Commits.
7. Corpo: preencha **todas** as seções de `.github/pull_request_template.md` a partir de
   `git log origin/develop..HEAD` e do diff. Cite US/H, RN e CT. Seção sem conteúdo: escreva "não se aplica".
8. `gh pr create --base develop --title "..." --body "..."` com a label da parte (`api`, `app`, `docs`, `testes`).
9. Devolva a URL.

Nunca inclua atribuição de IA. **Nunca faça merge**: o merge é do revisor, depois da aprovação.
