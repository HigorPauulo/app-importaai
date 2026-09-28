# Glossário

Termos do domínio com significado fixo. Documentos, telas e código usam estas palavras e nenhuma outra para o mesmo conceito.

| Termo | Significado | No código |
|---|---|---|
| **Alerta** | Aviso gerado por uma regra (taxa, atraso, pacote parado, janela). Aparece na aba Alertas e, com o app fechado, como notificação | `notification` |
| **Compra** | Registro de algo que o usuário já comprou, com código de rastreio. Sinônimo de encomenda; usamos sempre "compra" | `purchase` |
| **Cotação** | Valor de uma moeda em reais numa data. Pode vir da fonte automática ou ser definida pelo administrador | `exchange_rate` |
| **Custo final estimado** | Preço + frete + imposto de importação + ICMS, em reais. Sempre rotulado como estimativa | calculado |
| **Etapa** | Classificação de um evento de rastreio (postado, chegada ao Brasil, aguardando pagamento, entregue...) | `stage` |
| **Evento de rastreio** | Registro informado pela transportadora: data, local e descrição | `tracking_event` |
| **Grupo de produto** | O produto que está sendo comparado, com nome, e as ofertas dele em lojas diferentes. É o que permite comparar | `product_group` |
| **Janela de reclamação** | Período para reclamar na plataforma de origem: 30 dias após o prazo prometido | calculado |
| **Loja** | Onde a compra ou oferta foi feita. Cadastrada pelo usuário | `store` |
| **Ocorrência** | O fato que gerou um alerta: um prazo, um vencimento, um evento. A mesma ocorrência nunca gera dois alertas; os lembretes de taxa em 5 dias, 2 dias e no dia são ocorrências distintas | `occurrence_key` |
| **Oferta** | Opção de compra ainda não feita, com loja, preço, frete e moeda. Pode virar compra | `offer` |
| **Parâmetros fiscais** | Limite, alíquotas, dedução e ICMS usados na estimativa de imposto. Versionados por data de vigência | `tax_parameters` |
| **Recebimento confirmado** | Data em que o próprio usuário declara ter recebido a compra. Torna a compra entregue mesmo sem evento da transportadora | `received_at` |
| **Prazo prometido** | Data de entrega informada pela loja no momento da compra | `promised_date` |
| **Sinalização** | O que exige atenção numa compra: taxa a registrar, taxa pendente, taxa vencida, atrasada, parada, janela fechando, janela encerrada. Várias podem coexistir | calculado |
| **Situação** | Onde a compra está: aguardando postagem, trânsito internacional, no Brasil, entregue, devolvida. Uma só por vez, calculada pelo último evento | calculado |
| **Sincronização** | Troca de alterações entre o aparelho e o servidor: primeiro envia, depois recebe. Não confundir com a consulta à fonte de rastreio, que é **integração** | `sync` |
| **Conflito** | Mesmo registro alterado em dois aparelhos antes de sincronizar. O segundo envio é recusado e o usuário escolhe qual versão manter | `SYNC_CONFLICT` |
| **Integração** | Execução de uma rotina que consulta um serviço externo (rastreio ou cotação) | `integration_run` |
| **Taxa** | Imposto cobrado na importação, com valor e vencimento informados pelo usuário | `tax_amount`, `tax_due_date` |

---

## Decisões de vocabulário

| Decisão | Motivo |
|---|---|
| Oferta e compra são entidades diferentes | Oferta não tem código, data nem prazo; misturá-las obrigaria toda regra de alerta a ignorar metade dos registros |
| Loja é entidade, não texto livre | Permite agrupar por loja e comparar pontualidade sem erro de digitação |
| Taxa é atributo da compra | Uma compra tem no máximo uma cobrança, sem ciclo de vida próprio |
| Situação e sinalização são coisas diferentes | A situação diz onde o pacote está; a sinalização diz o que fazer. Juntá-las esconderia uma das duas |
