# SuperSec: desenvolvimento de um sistema web de pedidos com arquitetura cliente-servidor

## Resumo
Este trabalho apresenta o desenvolvimento do SuperSec, um sistema web destinado ao gerenciamento de pedidos em um cenário de comércio eletrônico simplificado. A solução permite cadastro e autenticação de usuários, consulta de produtos, montagem de carrinho, finalização de pedidos, atualização de estoque e consulta do histórico de compras. O backend foi implementado em Java com Spring Boot, o frontend em React e o armazenamento persistente em PostgreSQL. A autenticação utiliza Spring Security, senhas protegidas por BCrypt e tokens JWT. A aplicação foi organizada em containers Docker, facilitando a reprodução do ambiente. O projeto demonstra a aplicação integrada de conceitos de engenharia de software, desenvolvimento web, banco de dados, segurança e implantação.

**Palavras-chave:** sistemas web; pedidos; React; Spring Boot; PostgreSQL; Docker.

## 1 Introdução
Sistemas de pedidos precisam integrar apresentação, regras de negócio e persistência de dados de forma consistente. Em aplicações desse tipo, operações aparentemente simples, como adicionar um produto ao carrinho, envolvem validação de estoque, cálculo de valores, identificação do usuário e registro do pedido. O objetivo deste projeto é desenvolver um sistema acadêmico funcional que represente esse fluxo sem depender de serviços externos de pagamento.

O SuperSec foi definido com escopo reduzido para priorizar as funcionalidades essenciais. O usuário pode criar uma conta, autenticar-se, visualizar produtos, adicionar itens ao carrinho, finalizar um pedido e consultar pedidos anteriores. A arquitetura separa frontend, backend e banco de dados, permitindo demonstrar a integração entre diferentes camadas de uma aplicação moderna.

## 2 Metodologia e arquitetura
O desenvolvimento foi organizado em três camadas principais. O frontend utiliza React com Vite e é responsável pela interface e interação do usuário. O backend utiliza Java 21 e Spring Boot, expondo uma API REST para autenticação, produtos e pedidos. O PostgreSQL armazena usuários, produtos, pedidos e itens dos pedidos.

A comunicação ocorre por HTTP utilizando JSON. O usuário é autenticado pelo endpoint de login, que retorna um token JWT. As rotas protegidas exigem o token no cabeçalho Authorization. As senhas não são armazenadas em texto puro: são transformadas com BCrypt antes da persistência.

Para persistência, foram utilizados JPA e Hibernate. O modelo contém relacionamentos entre usuário e pedido, pedido e item de pedido e item de pedido e produto. Na finalização da compra, o backend verifica a disponibilidade de estoque, registra o preço do produto no momento da compra e reduz a quantidade disponível.

A containerização foi feita com Docker Compose, que coordena PostgreSQL, backend e frontend. Essa abordagem reduz diferenças entre ambientes e simplifica a execução do sistema durante a demonstração.

## 3 Desenvolvimento
O fluxo principal inicia na página de produtos. Cada produto possui nome, descrição, preço, estoque e imagem. Ao adicionar um produto, o frontend mantém os itens do carrinho localmente. Na finalização, o carrinho é convertido em uma requisição contendo os identificadores dos produtos e suas quantidades.

O backend recebe a requisição, identifica o usuário autenticado e consulta cada produto no banco. Caso algum item esteja inativo ou sem estoque suficiente, a operação é interrompida. Caso contrário, o sistema cria o pedido e seus itens, calcula o total e atualiza o estoque. Dessa forma, a regra de negócio não fica restrita ao frontend.

A autenticação e autorização fazem parte da camada de segurança. O cadastro exige nome, e-mail e senha. O login valida as credenciais e emite um JWT. As rotas de pedido exigem autenticação. A estrutura também prevê o perfil ADMIN para operações de gerenciamento de produtos.

## 4 Resultados
O protótipo permite executar o ciclo principal de uma compra: cadastro, login, seleção de produtos, carrinho, checkout e consulta do pedido. O uso de PostgreSQL garante persistência dos dados e possibilita demonstrar consultas e relacionamentos. A atualização do estoque durante a criação do pedido evidencia a aplicação de uma regra de negócio no servidor.

A separação entre frontend e backend também permite demonstrar uma arquitetura cliente-servidor. O uso de Docker torna a instalação mais previsível e facilita a apresentação em outro computador. Como limitação, o sistema não possui integração com gateway de pagamento, emissão fiscal ou logística real, pois esses recursos ampliariam o escopo do projeto acadêmico sem serem necessários para comprovar o fluxo principal.

## 5 Conclusão
O desenvolvimento do SuperSec possibilitou integrar conhecimentos de programação, banco de dados, desenvolvimento web, segurança e implantação. A arquitetura adotada mantém responsabilidades separadas e permite evolução futura. Entre as possíveis extensões estão pagamento eletrônico, notificações, filtros de produtos, painel administrativo completo e acompanhamento de entrega.

O projeto atende ao objetivo de construir um sistema funcional de pedidos com persistência, autenticação, segurança básica e execução containerizada, oferecendo uma base adequada para demonstração acadêmica e continuidade do desenvolvimento.

## Referências
SPRING. *Spring Boot Reference Documentation*. Disponível em: https://docs.spring.io/spring-boot/. Acesso em: 30 set. 2026.

SPRING. *Spring Security Reference*. Disponível em: https://docs.spring.io/spring-security/reference/. Acesso em: 30 set. 2026.

REACT. *React Documentation*. Disponível em: https://react.dev/. Acesso em: 30 set. 2026.

POSTGRESQL. *PostgreSQL Documentation*. Disponível em: https://www.postgresql.org/docs/. Acesso em: 30 set. 2026.

DOCKER. *Docker Documentation*. Disponível em: https://docs.docker.com/. Acesso em: 30 set. 2026.
