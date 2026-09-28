# Como contribuir

Convenções de trabalho da equipe. Valem para código e documentação.

---

## Branches

| Branch | Uso |
|---|---|
| `main` | Versão estável; recebe apenas merge de `develop` nas entregas |
| `develop` | Integração contínua do ciclo |
| `feature/<us-id>-<resumo>` | Uma história por branch, por exemplo `feature/us-10-lojas` |
| `fix/<resumo>` | Correção de defeito |
| `docs/<resumo>` | Só documentação |

Nunca commitar direto em `main` ou `develop`.

## Commits

Formato: `<tipo>(<escopo>): <descrição no imperativo>`, em português, com até 72 caracteres e sem ponto final.

| Tipo | Quando |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção |
| `docs` | Documentação |
| `test` | Testes |
| `refactor` | Mudança de estrutura sem mudar comportamento |
| `style` | Formatação |
| `chore` | Configuração, dependências, build |

Exemplos: `feat(lojas): adiciona cadastro de loja no banco local` · `fix(sync): evita reenvio de compra já aceita`.

Um commit, uma mudança. Mensagens genéricas ("ajustes", "update") não são aceitas (§6.2 do Norteador).

## Pull requests

1. Abrir PR de `feature/*` para `develop`, citando a história (`US-10`) e os casos de teste cobertos.
2. **Revisão obrigatória por outro integrante:**
   - PR da API (Higor) é revisado por Diogo; PR do app (Diogo) é revisado por Higor. É assim que cada um conhece a outra ponta do contrato.
   - Alex confere em todo PR de código se os critérios de aceite e os casos de teste da história foram cobertos.
   - PR de testes ou documentação (Alex) é revisado por Higor ou Diogo, conforme a parte afetada.
3. Merge só com build, testes e revisão aprovados.
4. Atualizar a coluna de PR na [rastreabilidade](docs/05-qualidade/rastreabilidade.md).

## Definição de pronto

Uma história está pronta quando:

1. Os critérios de aceite foram verificados **no aparelho físico**.
2. A tela tem os quatro estados: carregando, vazio, erro e conteúdo.
3. Dado inválido é recusado com a mensagem junto ao campo.
4. O código está na camada certa ([arquitetura](docs/02-arquitetura/visao-geral.md)).
5. Os casos de teste correspondentes passaram.
6. O PR foi revisado por outro integrante.
7. Nenhuma credencial, chave ou endereço foi versionado.

## Código e documentação

| Item | Idioma |
|---|---|
| Código, nomes de arquivo, tabelas e colunas | inglês |
| Documentação, comentários, mensagens de commit, textos da interface | português do Brasil |

- Comentário explica o **porquê**, nunca o quê.
- Termos do domínio seguem o [glossário](docs/01-produto/glossario.md).
- SQL sempre parametrizado; segredos só em variáveis de ambiente, a partir de `.env.example`.

## Entregas

PDF nomeado como `PI2026-2_NomeDaEquipe_Etapa.pdf`, enviado pelo ambiente virtual até 23h59 da data limite. Atraso aceito com justificativa custa 20% por dia, por até 3 dias. O endereço do repositório não muda depois da primeira entrega.
