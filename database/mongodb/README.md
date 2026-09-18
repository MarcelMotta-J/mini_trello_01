# MongoDB Demo Backup & Restore

Este diretório contém um dump demonstrativo do MongoDB utilizado pelo
MiniTrello.

O objetivo é fornecer um pequeno conjunto de dados restaurável para estudo
e demonstração do processo de backup e restore com `mongodump` e
`mongorestore`.

## Importante

Este dump NÃO é um backup do banco de desenvolvimento original.

O banco original `mini_trello_01` contém usuários e dados utilizados durante
o desenvolvimento e, por isso, seu dump não é publicado neste repositório.

Para o GitHub foi criado um banco separado:

`mini_trello_github_demo`

Ele contém somente dados demonstrativos criados especificamente para esta
finalidade.

## Dataset demonstrativo

O dump contém:

- 1 usuário Demo
- 1 board
- 3 colunas
- 4 cards

Estrutura:

MiniTrello Demo

- A Fazer
  - Estudar Spring Boot
  - Estudar Angular
- Em Andamento
  - Aprender MongoDB
- Concluído
  - Configurar JWT

O card `Aprender MongoDB` também possui uma `dueDate`, permitindo testar a
persistência de datas BSON durante o backup e o restore.

## Criando o dump

Exemplo:

```bash
mongodump \
  --uri="mongodb://127.0.0.1:27017" \
  --db=mini_trello_github_demo \
  --out="./database/mongodb/dump"

```

## Restaurando em outro database

A partir da raiz do projeto:

```bash
mongorestore \
  --uri="mongodb://127.0.0.1:27017" \
  --nsFrom="mini_trello_github_demo.*" \
  --nsTo="mini_trello_github_demo_restore_test.*" \
  "./database/mongodb/dump"
```

Ao utilizar `--nsFrom` e `--nsTo`, o caminho informado ao `mongorestore`
deve ser a raiz do dump.

## Validação

O dump deste repositório foi restaurado em:

`mini_trello_github_demo_restore_test`

Resultado esperado:

```text
users    = 1
boards   = 1
columns  = 3
cards    = 4
```

Durante a validação foram preservados:

- ObjectIds
- relacionamentos entre User, Board, Column e Card
- posições dos cards
- BSON Date
- dueDate
- hash BCrypt do usuário Demo

O banco restaurado também foi testado através do Spring Boot e do frontend
Angular.

## Segurança

O arquivo `users.bson` contém somente um usuário criado especificamente para
o dataset demonstrativo.

Nenhum usuário do banco de desenvolvimento original foi incluído no dump.

Não devem ser adicionados a este diretório:

- dumps do banco `mini_trello_01`
- JWT secrets
- senhas pessoais
- credenciais reais
- dados privados de desenvolvimento

Antes de publicar um novo dump, seu conteúdo deve ser revisado com
`bsondump`.

Exemplo:

```bash
bsondump database/mongodb/dump/mini_trello_github_demo/users.bson
```

## Observação

Um arquivo de backup não deve ser considerado validado apenas porque foi
gerado com sucesso.

O procedimento utilizado neste projeto é:

```text
MongoDB
   ↓
mongodump
   ↓
inspeção com bsondump
   ↓
mongorestore em outro database
   ↓
validação dos documentos
   ↓
teste através da aplicação
```

Assim, o mesmo dump disponibilizado no repositório é também o dump que foi
utilizado no teste de restore.
