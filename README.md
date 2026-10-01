# SuperSec
Loja de produtos de limpeza desenvolvida com React, Java Spring Boot, PostgreSQL e Docker.

## Funcionalidades
- Cadastro e login com senha protegida por BCrypt
- Autenticação por JWT
- Catálogo de produtos
- Carrinho de compras
- Finalização de pedido
- Controle de estoque no checkout
- Histórico de pedidos
- Perfil administrador com cadastro, edição, ativação e desativação de produtos

## Tecnologias
- Java 21 / Spring Boot 3.5
- React + Vite
- PostgreSQL 16
- Spring Data JPA
- Spring Security + JWT
- Docker Compose

## Executar
Requisito: Docker Desktop instalado.

```bash
docker compose up --build
```

Frontend: http://localhost:5173
API: http://localhost:8080
PostgreSQL: localhost:5432

## Fluxo de demonstração
1. Abrir o sistema.
2. Criar uma conta.
3. Adicionar dois ou mais produtos ao carrinho.
4. Alterar/remover itens.
5. Fazer login e finalizar pedido.
6. Abrir “Meus pedidos” e mostrar o pedido criado.
7. Mostrar o banco PostgreSQL e o decremento de estoque.

## Observação acadêmica
O projeto não processa pagamento real. A finalização registra o pedido no banco, que é suficiente para demonstrar o fluxo de compra do protótipo.

## Usuário administrador para demonstração
- E-mail: admin@supersec.com.br
- Senha: SuperSec123

Em ambiente real, essa senha deve ser alterada e não deve ficar documentada no repositório.

## Melhorias da versão final
- Catálogo com busca, ordenação, detalhes do produto e controle visual de estoque.
- Carrinho persistido no navegador, atualização de quantidades e remoção de itens.
- Checkout protegido por confirmação, validação de estoque no backend e cálculo de frete alinhado ao resumo da tela.
- Tela de confirmação após a compra com a mensagem de agradecimento e botão **Voltar a comprar**.
- Histórico de pedidos atualizado após a finalização.
- Área **Admin** disponível somente para usuários com papel `ADMIN`, permitindo cadastrar, editar, desativar e reativar produtos.
- Tratamento de erros de API com mensagens amigáveis para o usuário.
- Catálogo público continua acessível sem login; operações administrativas exigem JWT + papel `ADMIN`.

### Roteiro de teste funcional final
1. Abrir **Produtos** e verificar carregamento do catálogo, busca, ordenação e detalhes.
2. Adicionar produtos ao carrinho, alterar quantidades e remover itens.
3. Abrir **Carrinho** e conferir subtotal, entrega e total.
4. Criar uma conta ou entrar com uma conta existente.
5. Finalizar a compra e verificar a tela **Obrigado pela sua compra!**.
6. Clicar em **Voltar a comprar** e confirmar o retorno ao catálogo.
7. Abrir **Pedidos** e confirmar que o pedido aparece no histórico.
8. Entrar com o administrador e abrir **Admin** para cadastrar, editar, desativar e reativar um produto.
9. Confirmar que produto desativado deixa de aparecer no catálogo público.
10. Recarregar o sistema e confirmar que o estado persistido no PostgreSQL é mantido.


## Banco de dados
Os arquivos `docs/schema.sql` e `database/init.sql` formam a estrutura SQL e os dados demonstrativos do SuperSec. No Docker Compose, o PostgreSQL executa o schema e os dados na primeira criação do volume.
