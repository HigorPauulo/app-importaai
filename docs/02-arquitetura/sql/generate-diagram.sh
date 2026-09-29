#!/usr/bin/env bash
# Regenera schema.dbml e der.svg a partir de schema-postgres.sql e roda as
# verificações do esquema. Rodar sempre que o SQL mudar; o diagrama nunca é
# editado à mão, para não divergir do banco.
#
# Requisitos: Docker e Node 24 (npx). Não toca em nenhum banco existente:
# sobe um PostgreSQL descartável numa porta local e o remove no fim.
set -euo pipefail

SQL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCH_DIR="$(dirname "$SQL_DIR")"
CONTAINER="importa-ai-schema-$$"
PORT="${SCHEMA_PORT:-55432}"
WORK_DIR="$(mktemp -d)"

cleanup() {
  docker rm --force "$CONTAINER" >/dev/null 2>&1 || true
  rm -r "$WORK_DIR"
}
trap cleanup EXIT

docker run --detach --name "$CONTAINER" \
  --publish "127.0.0.1:${PORT}:5432" \
  --env POSTGRES_PASSWORD=schema --env POSTGRES_DB=importa_ai \
  postgres:18-alpine >/dev/null

until docker exec "$CONTAINER" pg_isready --username postgres --dbname importa_ai >/dev/null 2>&1; do
  sleep 1
done
sleep 1

psql_run() {
  docker exec --interactive "$CONTAINER" psql --quiet --username postgres --dbname "$1" -v ON_ERROR_STOP=1
}

echo "Aplicando schema-postgres.sql"
psql_run importa_ai < "$SQL_DIR/schema-postgres.sql"

echo "Extraindo DBML do banco"
npx --yes --package @dbml/cli db2dbml postgres \
  "postgresql://postgres:schema@127.0.0.1:${PORT}/importa_ai" \
  --out-file "$WORK_DIR/raw.dbml" >/dev/null 2>&1
node "$SQL_DIR/clean-dbml.mjs" "$WORK_DIR/raw.dbml" "$ARCH_DIR/schema.dbml"

echo "Renderizando der.svg"
npx --yes @softwaretechnik/dbml-renderer --input "$ARCH_DIR/schema.dbml" --output "$ARCH_DIR/der.svg"

echo "Rodando schema-checks.sql num banco limpo"
docker exec "$CONTAINER" createdb --username postgres importa_ai_checks
psql_run importa_ai_checks < "$SQL_DIR/schema-postgres.sql"
psql_run importa_ai_checks < "$SQL_DIR/schema-checks.sql" 2>&1 | sed 's/^psql:<stdin>:[0-9]*: //'
