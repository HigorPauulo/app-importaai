// Converte o DBML extraído do banco (db2dbml) no DBML do diagrama.
// O renderizador não aceita checks nem a notação de opcionalidade (<?), e os
// tipos internos do PostgreSQL (int8, bpchar) ficam ilegíveis no DER.
import { readFileSync, writeFileSync } from 'node:fs';

const [inputPath, outputPath] = process.argv.slice(2);

const TYPE_NAMES = {
  int8: 'bigint',
  int4: 'integer',
  int2: 'smallint',
  bool: 'boolean',
  bpchar: 'char',
};

const HEADER = `// Importa Aí · modelo relacional da API
// GERADO por generate-diagram.sh a partir de schema-postgres.sql. Não editar à mão.
// Checks, gatilhos e índices parciais estão no SQL; este arquivo serve ao diagrama.

Project importa_ai {
  database_type: 'PostgreSQL'
  Note: 'Situação da compra, valor em reais e custo simulado são derivados, nunca gravados (RN01, RN07, RN10).'
}
`;

function renameTypes(line) {
  return line.replace(/^(\s+"[^"]+" )(int8|int4|int2|bool|bpchar)\b/, (_, prefix, type) => prefix + TYPE_NAMES[type]);
}

function dropCheckSettings(line) {
  return line
    .replace(/, check: `[^`]*`/g, '')
    .replace(/check: `[^`]*`, /g, '')
    .replace(/ \[check: `[^`]*`\]/g, '');
}

function cleanDbml(source) {
  const output = [];
  let isInsideChecks = false;
  for (const rawLine of source.split('\n')) {
    if (/^\s+Checks \{/.test(rawLine)) {
      isInsideChecks = true;
      continue;
    }
    if (isInsideChecks) {
      if (/^\s+\}/.test(rawLine)) isInsideChecks = false;
      continue;
    }
    const line = dropCheckSettings(renameTypes(rawLine))
      .replace(/ \?<\? /g, ' < ')
      .replace(/ <\? /g, ' < ')
      .replace(/ \[type: btree, /g, ' [');
    output.push(line);
  }
  return HEADER + '\n' + output.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

writeFileSync(outputPath, cleanDbml(readFileSync(inputPath, 'utf8')));
