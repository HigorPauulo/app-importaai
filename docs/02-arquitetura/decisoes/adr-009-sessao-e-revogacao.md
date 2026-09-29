# ADR-009 · Sessão e revogação

**Status:** aceita · 28/09/2026

## Contexto

A arquitetura define token de acesso de 1 h e de renovação de 7 dias. Tokens JWT são verificados sem consulta ao banco, o que é bom para o desempenho e ruim para três requisitos:

- **RF-03:** encerrar a sessão precisa ter efeito no servidor, não só apagar o token do aparelho.
- **RF-21:** conta bloqueada pelo administrador precisa perder o acesso agora, não em até 7 dias.
- **RNF-02:** um token de renovação vazado não pode valer uma semana inteira sem que ninguém perceba.

## Decisão

- **Token de acesso:** JWT assinado (HS256, segredo em variável de ambiente), 15 minutos, com `sub` (id), `role` e `exp`. Verificado sem ir ao banco.
- **Token de renovação:** valor aleatório de 256 bits, **opaco** (não é JWT), guardado no servidor só como SHA-256 em `refresh_tokens`. Validade de 7 dias.
- **Rotação:** cada `POST /auth/refresh` revoga o token usado e emite um novo da mesma família (`family_id`, `replaced_by`).
- **Detecção de reuso:** apresentar um token já trocado revoga a família inteira. Se um token vazou, quem usar primeiro derruba a sessão do outro, e o dono legítimo percebe ao ter de entrar de novo.
- **Revogação:** sair revoga a família do aparelho; bloquear pelo administrador ou excluir a conta revoga todas as famílias do usuário. A renovação também confere `is_blocked`.
- Token de acesso reduzido de 1 h para **15 min**: é o tempo máximo que uma conta bloqueada ainda consegue usar.

## Alternativas consideradas

| Alternativa | Problema |
|---|---|
| Só JWT, sem estado no servidor | Sair e bloquear não têm efeito até expirar |
| Lista de JWTs revogados | Consulta ao banco em toda requisição, o que anula a vantagem do JWT |
| Sessão no servidor com cookie | App móvel não usa cookie de forma natural; toda requisição consultaria a sessão |
| Renovação como JWT de longa duração | Não pode ser revogado sem consultar o banco, o que já é o que a decisão faz |

## Consequências

- **+** Bloqueio vale em até 15 minutos; sair vale na hora para a renovação.
- **+** O banco nunca guarda o token em si: um vazamento da tabela não entrega sessões.
- **−** A renovação consulta o banco (uma vez a cada 15 min por aparelho, custo irrelevante).
- **−** Duas renovações simultâneas do mesmo aparelho (por exemplo, duas requisições que expiram juntas) parecem reuso. O app serializa a renovação: uma só em andamento, as demais esperam por ela.

## Reavaliar se

A API passar a ter mais de uma instância e o segredo HS256 precisar ser distribuído; nesse caso, trocar por par de chaves (RS256 ou EdDSA).
