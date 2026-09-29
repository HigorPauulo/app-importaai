#!/usr/bin/env bash
# PreToolUse(Bash): impede o assistente de commitar ou dar push direto em `main` ou `develop`.
# O §6.2 do Norteador exige integração por PR revisado; commit direto nessas branches
# some da revisão e distorce o histórico que alimenta o FPI.
# Exit 2 bloqueia a chamada e devolve o motivo ao assistente.

payload="$(cat)"
if command -v jq >/dev/null 2>&1; then
  cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"
else
  # Sem jq, procura no JSON bruto: basta para detectar as palavras-chave
  cmd="$payload"
fi

printf '%s' "$cmd" | grep -qE '\bgit\b' || exit 0

dir="${CLAUDE_PROJECT_DIR:-$PWD}"
branch="$(git -C "$dir" branch --show-current 2>/dev/null)"

block() { echo "Bloqueado: $1 Crie uma branch (feature/, fix/, docs/, test/, chore/) e abra PR." >&2; exit 2; }

if printf '%s' "$cmd" | grep -qE '\bgit\b[^|;&]*\bcommit\b'; then
  case "$branch" in
    main|develop) block "commit direto em '$branch'." ;;
  esac
fi

if printf '%s' "$cmd" | grep -qE '\bgit\b[^|;&]*\bpush\b[^|;&]*\b(main|develop)\b'; then
  block "push direto para main/develop."
fi

if printf '%s' "$cmd" | grep -qE '\bgit\b[^|;&]*\bpush\b' && [[ "$branch" == "main" || "$branch" == "develop" ]]; then
  block "push a partir de '$branch'."
fi

exit 0
