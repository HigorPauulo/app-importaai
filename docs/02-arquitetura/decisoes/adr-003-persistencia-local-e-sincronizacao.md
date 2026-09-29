# ADR-003 · Persistência local e sincronização

**Status:** aceita · 28/09/2026 · cursor, regra de conflito e retenção detalhados e substituídos pelo [ADR-008](adr-008-protocolo-de-sincronizacao.md)

## Contexto

O público consulta e cadastra em deslocamento, com sinal instável. O app precisa consultar, simular e cadastrar sem conexão e aplicar as alterações ao reconectar (RF-20), sem nunca apagar dado por falha de rede (RNF-06).

## Decisão

- **SQLite no aparelho**, com SQL próprio e parametrizado, espelhando o acervo do usuário e os dados de referência.
- **Local primeiro:** toda leitura e escrita acontecem no SQLite; alterações ficam marcadas como pendentes.
- **UUID v7 gerado no aparelho** para lojas, ofertas e compras.
- **Exclusão por marca** (`deleted_at`), sincronizada nos dois sentidos.
- **Sincronização em dois passos**, enviando antes de receber: `POST /sync/push` (idempotente) e `GET /sync/pull?since=`.
- **Conflito:** última escrita vence, porque usuário e fonte de rastreio nunca escrevem nos mesmos campos.

## Alternativas consideradas

| Questão | Descartado | Motivo |
|---|---|---|
| Armazenamento | AsyncStorage | Chave e valor; não filtra nem ordena |
| Armazenamento | WatermelonDB | Traz sincronização própria e esconde o modelo relacional |
| Identidade offline | Id temporário trocado na sincronização | Obriga a reescrever toda referência ao registro |
| Estratégia | Online com cache | Cadastrar sem rede viraria exceção, e aqui é o caso normal |
| Conflito | Mesclagem com vetor de versão | Complexidade sem ganho, já que os campos não se sobrepõem |
| Exclusão | Apagar a linha | A exclusão não chegaria a outros aparelhos |

## Consequências

- **+** A tela nunca espera a rede; reenviar o mesmo item não duplica registro.
- **−** O app mantém migrations locais alinhadas às do servidor.
- **−** É o item mais difícil do backlog (US-20 e US-21). **Plano de redução:** se atrasar, entregar leitura sem conexão e cadastro em fila, sem edição offline.
