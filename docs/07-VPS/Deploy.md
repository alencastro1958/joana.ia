# Publicação em VPS com Docker

Esta configuração de referência publica a web e a API no mesmo domínio:

- `https://joana.ia.br/` serve a interface.
- `https://joana.ia.br/chat` encaminha para a API.
- `https://joana.ia.br/health` verifica a API.

O Caddy provisiona e renova o certificado TLS automaticamente. Esta configuração pressupõe uma VPS com Docker Compose, acesso às portas TCP 80/443 (e UDP 443 para HTTP/3) e DNS do domínio apontando para o IP público da VPS. Se a hospedagem atual for compartilhada ou gerenciada, adapte o deploy ao provedor em vez de executar este Compose.

## Preparação

1. Aponte os registros DNS `A` (e, se usado, `AAAA`) de `joana.ia.br` para a VPS.
2. Libere as portas 80 e 443 no firewall da VPS e do provedor.
3. Crie `backend/.env` a partir de `backend/.env.example` e preencha `OPENAI_API_KEY` com um segredo real. Não inclua esse arquivo no repositório.
4. Confirme que `OPENAI_MODEL` está disponível na conta do provedor de IA e ajuste `CORS_ORIGINS` se o frontend usar outro domínio.

## Subir os serviços

Na raiz do projeto:

```powershell
docker compose up -d --build
docker compose ps
docker compose logs -f proxy backend
```

Valide `https://joana.ia.br/` e `https://joana.ia.br/health` antes de divulgar o serviço. Não exponha a porta 3000 diretamente à internet. Configure alertas, monitore custo/limites do provedor de IA e faça backup das configurações e dos dados operacionais pertinentes.

## Pendências antes do tráfego público

- Definir e publicar uma política de privacidade que explique o envio de mensagens ao provedor de IA.
- Integrar fontes oficiais verificadas antes de apresentar respostas legais como atualizadas ou citáveis.
- Revisar limite de requisições para o volume esperado e usar um armazenamento compartilhado se houver múltiplas réplicas.
- Confirmar que o domínio, a VPS e as contas de terceiros estão sob controle da equipe responsável.
