# Help Flow | Microserviço de Usuários

Microserviço responsável pelo gerenciamento de usuários e pela autenticação do sistema Help Flow.

Desenvolvido em Node.js com Express, utiliza Azure SQL para persistência dos dados, bcrypt para proteção de senhas e JWT para autenticação.

O projeto faz parte de uma arquitetura distribuída baseada em microserviços, Backend for Frontend (BFF), API Gateway e Database per Service.

## 1. Tecnologias utilizadas

- Node.js 22
- Express 5
- Azure SQL Database
- mssql
- bcryptjs
- JSON Web Token (JWT)
- Helmet e CORS
- Jest e Supertest
- Swagger UI
- Docker

## 2. Arquitetura

O microserviço utiliza os princípios de Clean Architecture e Vertical Slice Architecture.

A aplicação está organizada em quatro camadas:

- **API:** controllers, rotas HTTP, autenticação e autorização.
- **Application:** casos de uso responsáveis pelas operações do sistema.
- **Domain:** regras de negócio e validações da entidade Usuario.
- **Infrastructure:** conexão com Azure SQL e implementação do repositório.

### Estrutura de diretórios

```text
src/
├── api/
│   ├── controllers/
│   │   ├── AuthController.js
│   │   └── UsuarioController.js
│   ├── middlewares/
│   │   ├── AuthMiddleware.js
│   │   └── AutorizarPerfis.js
│   ├── routes/
│   │   ├── AuthRoutes.js
│   │   └── UsuarioRoutes.js
│   └── swagger/
│       └── swagger.js
├── application/
│   └── features/
│       ├── createUsuario/
│       ├── deleteUsuario/
│       ├── getUsuario/
│       ├── listUsuarios/
│       ├── loginUsuario/
│       └── updateUsuario/
├── domain/
│   └── entities/
│       └── Usuario.js
├── infrastructure/
│   ├── database/
│   │   └── azureSql.js
│   └── repositories/
│       └── UsuarioRepository.js
├── app.js
└── server.js
```

### Clean Architecture

A entidade Usuario centraliza as regras de validação de nome, e-mail, perfil e status.

Os casos de uso executam as operações de negócio e utilizam o repositório para acessar os dados.

A camada de domínio não depende diretamente do Express, JWT ou Azure SQL.

### Vertical Slice Architecture

Os casos de uso são organizados por funcionalidade:

- CreateUsuario
- DeleteUsuario
- GetUsuario
- ListUsuarios
- LoginUsuario
- UpdateUsuario

Essa organização facilita a separação das responsabilidades e a manutenção do código.

## 3. Banco de dados

O microserviço utiliza Azure SQL Database para armazenar os usuários.

A conexão é implementada utilizando a biblioteca `mssql`.

Os principais atributos utilizados são:

| Campo     | Descrição                 |
| --------- | ------------------------- |
| id        | Identificador do usuário  |
| nome      | Nome do usuário           |
| email     | E-mail utilizado no login |
| senhaHash | Hash da senha             |
| perfil    | Perfil de acesso          |
| ativo     | Situação do usuário       |

### Database per Service

O Help Flow utiliza bancos independentes para seus microserviços:

- **Microserviço de Usuários:** Azure SQL Database.
- **Microserviço de Chamados:** MongoDB Atlas.

Essa separação evita o compartilhamento direto de tabelas ou coleções entre serviços.

## 4. Autenticação JWT

A autenticação é realizada pelo endpoint:

`POST /api/auth/login`

O sistema consulta o usuário no Azure SQL, verifica se está ativo e compara a senha informada com o hash armazenado utilizando bcrypt.

Quando as credenciais são válidas, é emitido um token JWT.

O token contém o identificador do usuário e seu perfil de acesso, com assinatura HS256.

As rotas protegidas exigem o cabeçalho:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

O segredo JWT deve ser configurado por variável de ambiente e compartilhado de forma segura entre os serviços que validam os tokens.

## 5. Perfis e permissões

O sistema utiliza três perfis:

- ADMIN
- ATENDENTE
- CLIENTE

### Regras de acesso

| Operação                        | ADMIN | ATENDENTE | CLIENTE          |
| ------------------------------- | ----- | --------- | ---------------- |
| Criar usuário via /api/usuarios | Sim   | Não       | Não              |
| Listar usuários                 | Sim   | Sim       | Não              |
| Consultar usuário por ID        | Sim   | Sim       | Apenas o próprio |
| Atualizar usuário               | Sim   | Não       | Não              |
| Excluir usuário                 | Sim   | Não       | Não              |

O cadastro público é disponibilizado separadamente pelo endpoint `/api/auth/register`.

## 6. Endpoints REST

### Autenticação

| Método | Endpoint           | Descrição          |
| ------ | ------------------ | ------------------ |
| POST   | /api/auth/login    | Autenticar usuário |
| POST   | /api/auth/register | Registrar usuário  |

### Usuários

| Método | Endpoint          | Descrição         |
| ------ | ----------------- | ----------------- |
| GET    | /api/usuarios     | Listar usuários   |
| GET    | /api/usuarios/:id | Consultar usuário |
| POST   | /api/usuarios     | Criar usuário     |
| PUT    | /api/usuarios/:id | Atualizar usuário |
| DELETE | /api/usuarios/:id | Excluir usuário   |

As rotas de usuários exigem autenticação JWT e respeitam as permissões de cada perfil.

### Exemplo de login

Requisição:

```json
{
  "email": "usuario@exemplo.com",
  "senha": "SENHA_DO_USUARIO"
}
```

Resposta bem-sucedida, em formato simplificado:

```json
{
  "token": "TOKEN_JWT",
  "tokenType": "Bearer",
  "usuario": {
    "id": 1,
    "nome": "Usuario Exemplo",
    "email": "usuario@exemplo.com",
    "perfil": "CLIENTE",
    "ativo": true
  }
}
```

## 7. Configuração do ambiente

### Pré-requisitos

- Node.js 22
- npm
- Banco Azure SQL configurado
- Credenciais de conexão com o banco
- Segredo JWT

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env` com as variáveis utilizadas pela aplicação para conexão com Azure SQL e autenticação JWT.

O arquivo `.env` não deve ser publicado no GitHub.

Também não devem ser publicados senhas, tokens ou segredos de autenticação.

## 8. Execução local

Iniciar o servidor:

```bash
npm start
```

Executar em modo de desenvolvimento:

```bash
npm run dev
```

Porta utilizada no ambiente local:

`3002`

### Endereços locais

| Recurso      | Endereço                     |
| ------------ | ---------------------------- |
| API          | http://localhost:3002        |
| Health Check | http://localhost:3002/health |

No Windows PowerShell, caso a execução de scripts esteja bloqueada, utilize `npm.cmd` em vez de `npm`.

## 9. Testes automatizados

O projeto utiliza Jest e Supertest para validar:

- Casos de uso.
- Regras da entidade Usuario.
- Repositório.
- Autenticação.
- Endpoints REST.
- Health check.
- Organização arquitetural.

Executar todos os testes:

```bash
npm test
```

Executar testes com relatório de cobertura:

```bash
npm run test:coverage
```

### Resultado validado em 06/11/2026

- 11 suítes aprovadas.
- 86 testes aprovados.
- Nenhuma falha.

Os testes de arquitetura verificam a existência das camadas, a organização por funcionalidades e algumas regras de dependência.

## 10. Docker

O projeto possui um Dockerfile para criação de uma imagem de contêiner.

### Construir a imagem

```bash
docker build -t help-flow-usuarios .
```

A execução do contêiner exige a configuração das variáveis de ambiente necessárias para acessar o Azure SQL e validar tokens JWT.

Credenciais e segredos não devem ser incluídos diretamente na imagem Docker.

## 11. Documentação Swagger

O projeto possui configuração Swagger UI para documentação e consulta dos endpoints REST.

A documentação permite visualizar as operações disponíveis e consultar os parâmetros das requisições.

## 12. Integração com o Help Flow

O microserviço de Usuários faz parte da arquitetura distribuída do Help Flow.

Fluxo principal:

```text
Microfrontend (React)
        |
        v
API Gateway
        |
        v
BFF (Node.js)
        |
        v
Microserviço de Usuários
        |
        v
Azure SQL Database
```

O BFF intermedeia as requisições do frontend e também pode consultar diferentes microserviços para agregar informações.

O microserviço de Usuários é responsável pelo gerenciamento das contas e pela emissão dos tokens JWT utilizados na autenticação.

## 13. Contexto acadêmico

Projeto desenvolvido para a disciplina de Arquitetura e Soluções Cloud.

A solução Help Flow contempla os seguintes conceitos arquiteturais:

- Clean Architecture
- Vertical Slice Architecture
- Microservices
- Backend for Frontend (BFF)
- API Gateway
- Database per Service
- Serverless
- Event-Driven Architecture

O microserviço de Usuários implementa o gerenciamento de contas, autenticação e autorização, utilizando Azure SQL como banco de dados independente.
