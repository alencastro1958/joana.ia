# Banco de dados da JOANA IA

## Estado atual

O histórico de conversas não é gravado pelo backend. A única tabela operacional criada pela aplicação é `ai_response_reports`, usada quando uma pessoa sinaliza uma resposta:

| Coluna | Uso |
| --- | --- |
| `id` | Identificador do relato |
| `category` | `incorrect`, `offensive` ou `other` |
| `response` | Texto da resposta sinalizada |
| `details` | Comentário opcional enviado pela interface web |
| `created_at` | Data e hora do relato em UTC |

O relato não inclui o histórico do chat nem o endereço IP. A aplicação remove registros com mais de 90 dias ao iniciar e a cada 24 horas.

## Arquivo e acesso

- Caminho configurável em `FEEDBACK_DATABASE_PATH`; padrão: `data/joana-feedback.sqlite`, relativo ao diretório de execução do backend.
- No Compose de produção, o diretório `/app/data` usa o volume `backend_data`.
- Restrinja o acesso ao arquivo e aos backups: respostas e comentários podem conter informações pessoais.
- Não exponha o arquivo SQLite por HTTP.

Para revisar relatos recentes diretamente no SQLite:

```sql
SELECT id, category, response, details, created_at
FROM ai_response_reports
ORDER BY created_at DESC
LIMIT 50;
```

Ainda não existem tabelas de usuários, sessões, conversas ou acervo jurídico. SQLite é usado somente para os relatos de respostas; não há uma camada ORM nem ingestão documental ou armazenamento de fontes.