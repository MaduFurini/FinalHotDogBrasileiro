# Página Web - Hot Dog Brasileiro 

## **Clonar o projeto**

1. Abra o terminal e execute os seguintes comandos:

   ```bash
   # Clone o repositório
   git clone https://github.com/seuusuario/seudepositorio.git

   # Acesse o diretório do projeto
   cd seudepositorio

## **Preparar ambiente**

1. Instalar as dependências
   ```bash
   npm install

2. Criar um arquivo .env na raíz do projeto e configurá-lo
    ```bash
   # Coloque essas confdigurações no arquivo e mude-as conforme seu ambiente
    DB_USER=USER
    DB_PWD=PASSWORD
    DB_NAME=NOME DO BANCO
    DB_HOST=HOST
    DB_PORT=PORTA
    DB_DIALECT=mysql

3. Abra o arquivo de configuração db.js
   Troque as de DBName, User, Password para as requeridas
   ![image](https://github.com/user-attachments/assets/dfa2b613-8686-4b40-a5c4-dd637450a45f)

* É importante lembrar que sua conexão com o banco deve conter uma senha
* No final da configuração, você deverá estar com a seguinte estrutura

![image](https://github.com/user-attachments/assets/8f80f11c-ed1c-42ef-b9ba-9d525eec5b11)

## **Construção e população do banco**
1. Rodar as migrations - construção das tabelas do banco
   ```bash
   npx sequelize-cli db:migrate

* Observação: Caso necessário desconstruir as tabelas do banco (tal processo apagará todos os registros), rodar:
   ```bash
   npx sequelize-cli db:migrate:undo:all

2. Rodar os seeders - população de registros
   ```bash
   npx sequelize-cli db:seed:all

## **Iniciar e acessar o servidor**
1. Comando
   ```bash
      npm start

2. Acessar localhost:3000/home (caso necessário, mude para seu host)

3. Acesso a página de admin
   * O banco já possui um usuário admin por padrão, para configurações gerais do sistema, para acessá-lo use:
      * Email: madufurini@gmail.com
      * Senha: password
      









   
