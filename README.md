# Micro-Do

Sistema de Gestão de Tarefas Colaborativo desenvolvido desenvolvido com arquitetura de microserviços

## 📋 Sobre o Projeto

O **Micro-Do** é uma plataforma de gerenciamento de tarefas que permite aos usuários criar, atribuir e acompanhar tarefas em tempo real. O sistema foi arquitetado utilizando microsserviços para garantir escalabilidade e separação de responsabilidades.

### Stack Tecnológica

- **Front-end**: React.js, TanStack Router, Tailwind CSS, shadcn/ui.
- **Back-end**: NestJS, TypeORM, PostgreSQL.
- **Mensageria**: RabbitMQ.
- **Infraestrutura**: Docker, Docker Compose, Turborepo (Monorepo).

---

## 🏗️ Arquitetura

O sistema segue uma arquitetura baseada em microsserviços, onde um API Gateway atua como ponto de entrada único, roteando requisições REST para os serviços competentes e orquestrando a comunicação assíncrona via RabbitMQ.

```plaintext
+---------+       +-------------------+       +-----------------+
| Usuário | ----> |   Web App (UI)    | <---> |   API Gateway   |
+---------+       +-------------------+       +--------+--------+
                                                       |
         +---------------------------------------------+---------------------------------------------+
         |                                             |                                             |
         v                                             v                                             v
+--------+--------+                           +--------+--------+                           +--------+--------+
|  Auth Service   |                           |  Tasks Service  | --(Event: Task Change)--> |    RabbitMQ     |
+--------+--------+                           +--------+--------+                           +--------+--------+
         |                                             |                                             |
         |                                             |                                     (Consume: Event)
         |                                             |                                             |
         |                                             |                                             v
         |                                             |                                    +--------+--------+
         |                                             |                                    |  Notifications  |
         |                                             |                                    |     Service     |
         |                                             |                                    +--------+--------+
         |                                             |                                             |
         +---------------------------------------------+---------------------------------------------+
                                                       |
                                                       v
                                              +--------+--------+
                                              |   PostgreSQL    |
                                              +-----------------+
```

### Serviços

- **API Gateway**: Gerencia autenticação (JWT), rate limiting, documentação Swagger e roteamento para os microsserviços. Exibe endpoints HTTP e gerencia conexões WebSocket.
- **Auth Service**: Responsável pelo cadastro de usuários, login e validação de tokens JWT.
- **Tasks Service**: Core do domínio. Gerencia criação, atualização e listagem de tarefas e comentários. Publica eventos de mudança no RabbitMQ.
- **Notifications Service**: Consome eventos do RabbitMQ e notifica usuários em tempo real via WebSocket. Persiste notificações no banco.

---

## 🚀 Como Executar

### Pré-requisitos

- Docker Engine & Docker Compose
- Node.js (opcional, para desenvolvimento local fora do Docker)
- PNPM (opcional)

### Passo a Passo

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/JoaoG250/micro-do.git
    cd micro-do
    ```

2.  **Inicie a aplicação com Docker Compose:**
    O comando abaixo irá construir as imagens e iniciar todos os serviços, incluindo o banco de dados e o broker.

    ```bash
    docker compose up --build
    ```

3.  **Acesse a aplicação:**
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Swagger API Docs**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
    - **RabbitMQ Dashboard**: [http://localhost:15672](http://localhost:15672) (user: admin, pass: admin)

---

## 🧠 Decisões Técnicas e Trade-offs

1.  **Monorepo com Turborepo**:
    - _Decisão_: Manter todos os serviços e o frontend no mesmo repositório com compartilhamento de pacotes (como DTOs, configurações de ESLint/TS e entidades de banco de dados no pacote `@repo/db`).
    - _Trade-off_: Aumenta a complexidade inicial de configuração do build e do Dockerfile, mas facilita drasticamente o compartilhamento de código e a manutenção da consistência entre front e back.

2.  **Microsserviços vs Monólito Modular**:
    - _Decisão_: Utilizar microsserviços comunicando-se via RabbitMQ e NestJS Microservices (TCP).
    - _Trade-off_: Adiciona complexidade operacional e latência de rede. Para um projeto deste porte, um monólito modular seria mais simples, mas a arquitetura escolhida demonstra conhecimento em padrões de sistemas distribuídos.

3.  **Banco de Dados Compartilhado (Shared Database)**:
    - _Decisão_: Todos os microsserviços conectam no mesmo banco PostgreSQL, embora usem conexões e (potencialmente) schemas diferentes.
    - _Trade-off_: Em microsserviços "puros", cada serviço deveria ter seu banco (Database per Service) para desacoplamento total. Optei pelo banco compartilhado para simplificar a infraestrutura do desafio e facilitar joins/relacionamentos complexos se necessário no futuro sem duplicar dados excessivamente.

4.  **Migrations na Inicialização**:
    - _Decisão_: Configurar `migrationsRun: true` nos serviços.
    - _Trade-off_: Pode causar race conditions em deploys horizontais massivos, mas garante que o ambiente de teste esteja sempre atualizado sem intervenção manual.

---

## ⚠️ Problemas Conhecidos e Melhorias Futuras

- **Testes**: A cobertura de testes unitários e de integração (E2E) pode ser expandida. Atualmente o foco foi na infraestrutura e funcionalidade core.
- **Resiliência**: Adicionar Circuit Breakers nas chamadas entre microsserviços.
- **Logging Centralizado**: Implementar uma solução como ELK Stack ou Loki para agregar logs dos containers, facilitando o debug distribuído.
- **Frontend Refinements**: Melhorar a UX de carregamento inicial e tratamento de erros de rede (reconexão WebSocket).
