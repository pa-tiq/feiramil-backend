In the project directory, you can run:

### `npm install`
### `npm start`

Runs the app in the development mode.\
Listening on port 8080.

Docker environment:
### `docker run --name docker-mysql-container-name -d -v /var/lib/mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=feiramil -e MYSQL_USER=user -e MYSQL_PASSWORD=password mysql:8`
Create tables with `feiramil-tables-create-statements.sql`
### `docker build -t feiramil-backend-image .`
### `docker run -p 8080:8080 --link mysql-feiramil -v "$(pwd):/usr/app" --name feiramil-backend-container feiramil-backend-image`

