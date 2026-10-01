# Requisitos e atendimento

## Requisitos funcionais
RF01 — Cadastrar usuário.
RF02 — Autenticar usuário.
RF03 — Listar produtos ativos.
RF04 — Adicionar produto ao carrinho.
RF05 — Remover produto do carrinho.
RF06 — Finalizar pedido.
RF07 — Atualizar estoque após pedido.
RF08 — Consultar histórico de pedidos.
RF09 — Cadastrar/alterar/desativar produtos para ADMIN.

## Requisitos não funcionais
RNF01 — API REST em Spring Boot.
RNF02 — Persistência em PostgreSQL.
RNF03 — Senhas protegidas por BCrypt.
RNF04 — Autenticação por JWT.
RNF05 — Execução por Docker Compose.
RNF06 — Código versionável em Git.
RNF07 — Interface web responsiva básica.

## Matriz de entrega
- Sistema completo e funcional: RF01–RF09.
- Frontend integrado ao backend: React consumindo API REST.
- Banco SQL definitivo: PostgreSQL com schema.sql, dados demonstrativos e persistência JPA/Hibernate.
- Autenticação e segurança básica: Spring Security, JWT e BCrypt.
- Containerização Docker: docker-compose.yml + Dockerfiles.
- Código organizado em Git: estrutura separada por frontend/backend/database/docs.
- Artigo científico: docs/ARTIGO.md.
- Demonstração funcional: roteiro no README.
