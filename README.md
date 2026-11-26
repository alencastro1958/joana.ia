# JOANA IA

Projeto de assistente conversacional em desenvolvimento. A JOANA é voltada a dúvidas sobre a Lei da Aprendizagem e a aprendizagem profissional de adolescentes e jovens no Brasil. O repositório contém uma API Fastify integrada à OpenAI, uma interface web responsiva e um cliente Android inicial em Expo. Ainda faltam a conexão com um acervo jurídico verificável, a implantação em produção e as etapas de publicação.

## Especialidade e escopo de conhecimento da JOANA

A JOANA deverá responder a questionamentos sobre a aprendizagem profissional no Brasil com precisão, considerando a evolução histórica da legislação desde sua primeira edição e as normas vigentes na data da consulta. Para este projeto, “aprendizagem” refere-se à Lei da Aprendizagem e aos assuntos relacionados à formação de jovens aprendizes.

O escopo esperado inclui:

- Lei da Aprendizagem e demais leis, decretos, decretos-leis, portarias e atos normativos relacionados, incluindo alterações, revogações e regras de transição.
- Manuais, orientações e materiais oficiais sobre aprendizagem profissional.
- Obrigações e atuação de empregadores, aprendizes, órgãos públicos e entidades formadoras.
- Formação teórica e prática, cursos de aprendizagem, programas, requisitos e processos relacionados.
- Atuação das organizações do Sistema S — Senac, Senai, Sescoop, Senat e Senar — e das demais organizações da sociedade civil habilitadas pelo Ministério do Trabalho para formar jovens aprendizes.

### Requisitos para respostas confiáveis

- Distinguir regras vigentes de normas históricas, revogadas ou alteradas, indicando a data de referência quando isso for relevante.
- Usar exclusivamente informações apoiadas em fontes verificáveis e citar as fontes utilizadas para fundamentar cada resposta ou argumento, com norma, dispositivo, título e link de consulta sempre que disponíveis.
- Nunca inventar, alterar ou atribuir conteúdo inexistente a leis, decretos, portarias, manuais, instituições ou outras fontes para justificar uma resposta.
- Não apresentar como vigente uma regra sem verificar sua situação normativa. Quando não houver fonte suficiente, a informação não puder ser confirmada ou a questão exigir interpretação jurídica individual, dizer isso claramente e, quando apropriado, recomendar consulta a profissional ou órgão competente.
- Manter o acervo de referência atualizado e com histórico de versões, para que respostas sobre períodos diferentes possam ser contextualizadas.

O backend orienta a IA a não inventar referências e a declarar incertezas. Ainda não há busca em documentos oficiais, recuperação de trechos ou atualização automática do acervo; por isso, as respostas não devem ser tratadas como orientação jurídica validada.

## Comportamento de conversa

- Iniciar cada nova conversa perguntando o nome da pessoa interlocutora e, após recebê-lo, tratá-la pelo nome ao longo do diálogo.
- Manter sempre um tom educado e gentil, com respostas firmes e seguras quando houver evidência suficiente.
- Reconhecer com clareza quando não souber responder ou não puder confirmar uma informação; não preencher lacunas com suposições apresentadas como fatos.

## Atualização do conhecimento

A equipe deverá poder adicionar e atualizar materiais de referência por meio de arquivos de texto, vídeos e outros formatos que permitam verificar a origem e o conteúdo. O processo de ingestão deverá preservar a identificação da fonte e, quando aplicável, sua autoria, data, órgão emissor, endereço de origem e período de vigência. Materiais que não possam ser verificados não deverão ser usados para fundamentar respostas.

Essa capacidade de ingestão, validação e atualização do acervo ainda não está implementada.

## Situação atual

- API backend Fastify com rotas `GET /health` e `POST /chat`.
- Integração real com a API de chat da OpenAI; modelo configurável por `OPENAI_MODEL`.
- Validação de entrada, limite de requisições por IP e CORS configurável.
- Web responsiva em React/Vite, com conversa mantida apenas em memória no navegador.
- Aplicativo Android inicial em Expo/React Native, consumindo a mesma API.
- O chat ainda não consulta um acervo de legislação e não persiste conversas no servidor.
- Ainda não há implantação em produção, política de privacidade final, assets definitivos da marca nem publicação na Play Store.

## Tecnologias

- Node.js 22 ou superior
- TypeScript
- Fastify 5
- Zod
- SQLite via `better-sqlite3` para armazenar sinalizações de respostas
- OpenAI SDK (integração inicial implementada)
- React e Vite (interface web)
- Expo e React Native (aplicativo Android)

## Requisitos

- Node.js 22+
- npm
- Uma chave de API para preencher `OPENAI_API_KEY`, exigida pela configuração atual do backend

## Executar o backend

No PowerShell, a partir da pasta do projeto:

```powershell
cd backend
npm install --legacy-peer-deps
Copy-Item .env.example .env
```

Crie `backend/.env` copiando `backend/.env.example` e preencha sua chave de API:

```dotenv
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
OPENAI_API_KEY=sua-chave-aqui
OPENAI_MODEL=gpt-4.1-mini
CORS_ORIGINS=http://localhost:5173
TRUST_PROXY=false
```

Mantenha `TRUST_PROXY=false` em desenvolvimento ou quando a API receber conexões diretamente. O Compose habilita essa opção somente atrás do proxy Caddy.

Inicie o servidor em modo de desenvolvimento:

```powershell
npm run dev
```

O backend ficará disponível em `http://localhost:3000`.

### Executar a interface web

Em outro terminal, na pasta do projeto:

```powershell
cd frontend
npm install
npm run dev
```

Durante o desenvolvimento, o Vite encaminha `/chat` para `http://localhost:3000`. Para um host de API separado, defina `VITE_API_URL` em `frontend/.env`.

### Executar o aplicativo Android

Configure `EXPO_PUBLIC_API_URL` em `mobile/.env` com uma URL que o dispositivo consiga acessar. No emulador Android, use `http://10.0.2.2:3000`; em um telefone físico, use o endereço da rede local do computador. Para produção, use somente a URL pública HTTPS da API.

```powershell
cd mobile
npm install
npx expo start
```

Copie `mobile/.env.example` para `mobile/.env` e ajuste `EXPO_PUBLIC_API_URL`. O perfil de produção do EAS gera um Android App Bundle (`.aab`), aponta para `https://joana.ia.br` e está configurado para Android API 36. Compilar e enviar à Play Store exigirá vincular o projeto a uma conta Expo/EAS e à conta Play Console.

### Comandos disponíveis

Execute estes comandos dentro da pasta `backend`:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor com recarga durante o desenvolvimento |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm test` | Executa os testes unitários do backend |
| `npm start` | Inicia a versão compilada |
| `npm run lint` | Executa o ESLint |

## Endpoints disponíveis

### `GET /health`

Retorna o estado do serviço, o ambiente e o horário da consulta.

### `POST /chat`

Recebe uma pergunta e, opcionalmente, até 12 mensagens anteriores:

```json
{
  "prompt": "Quais são os direitos de quem é aprendiz?",
  "history": [
    { "role": "assistant", "content": "Olá! Como você gostaria de ser chamada?" },
    { "role": "user", "content": "Pode me chamar de Ana." }
  ]
}
```

Resposta produzida pelo modelo configurado:

```json
{
  "response": "..."
}
```

O endpoint limita cada IP a 12 solicitações por minuto. As mensagens são enviadas ao provedor de IA para processamento, mas o backend não persiste o histórico; informe esse tratamento na política de privacidade antes de abrir o serviço ao público.

### `POST /feedback`

Recebe sinalizações de respostas da JOANA. Armazena a resposta, o motivo e, quando enviado pela web, um comentário opcional em `FEEDBACK_DATABASE_PATH`. Não armazena o histórico da conversa nem o IP do usuário. Os registros são removidos após 90 dias; mantenha o volume de dados do backend persistente e restrinja o acesso operacional a ele.

## Estrutura do repositório

```text
backend/   API, configuração e serviços
database/  Espaço para migrações, seeds e recursos de banco de dados
docs/      Documentação organizada por área
docker/    Arquivos de apoio para serviços em contêineres
frontend/  Interface web responsiva em React/Vite
mobile/    Aplicativo Android inicial em Expo/React Native
scripts/   Scripts auxiliares
```

## Documentação

A documentação do projeto está em [`docs/`](docs/). Entre os tópicos organizados estão arquitetura, backend, frontend, banco de dados, IA, Docker, testes, segurança e roadmap.

## Segurança

- Mantenha chaves de API e outros segredos em arquivos locais de ambiente ou em um gerenciador de segredos.
- Não inclua credenciais em commits, documentação ou exemplos públicos.
- Se alguma credencial real tiver sido compartilhada, revogue-a e gere uma nova antes de continuar usando o serviço.
- Não publique o serviço antes de definir política de privacidade, controles de abuso/custos e acervo oficial para respostas normativas.

## Pendências para lançamento

- Incorporar e verificar os materiais oficiais fornecidos para criar respostas fundamentadas e citáveis.
- Configurar DNS, HTTPS, proxy reverso e variáveis de produção no provedor de hospedagem.
- Revisar a política de privacidade e preencher a seção Data safety conforme o tratamento real das mensagens.
- Definir como a equipe acessará e revisará os relatos recebidos, mantendo o acesso ao banco restrito.
- Substituir os ícones provisórios do Expo pelos assets aprovados da JOANA e confirmar o identificador Android antes do primeiro envio.
- Gerar e testar o `.aab`, preencher a ficha da loja e cumprir eventuais requisitos de teste da conta Play Console.

## Licença

Este projeto está sob a licença MIT. Consulte [`LICENSE`](LICENSE).# joana.ia
