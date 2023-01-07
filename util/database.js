const mysql = require('mysql2');
const keys = require('../keys.json');

const pool = mysql.createPool({
  host: 'localhost',
  user: keys.MySQL_user,
  database: keys.MySQL_db,
  password: keys.MySQL_password,
});

//const pool = mysql.createPool({
//  host: keys.MySQL_docker_container,
//  user: keys.MySQL_docker_user,
//  database: keys.MySQL_db,
//  password: keys.MySQL_password,
//});

pool.promise().execute(
  `
  CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` int unsigned NOT NULL AUTO_INCREMENT,
    \`email\` varchar(255) NOT NULL,
    \`password\` varchar(255) NOT NULL,
    \`name\` varchar(255) DEFAULT NULL,
    \`om\` varchar(20) DEFAULT NULL,
    \`phone\` varchar(45) DEFAULT NULL,
    \`photo\` varchar(255) DEFAULT NULL,
    \`city\` varchar(255) DEFAULT NULL,
    \`state\` varchar(45) DEFAULT NULL,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`id_UNIQUE\` (\`id\`),
    UNIQUE KEY \`email_UNIQUE\` (\`email\`)
  );
  `
);

pool.promise().execute(
  `
  CREATE TABLE IF NOT EXISTS \`products\` (
    \`id\` int unsigned NOT NULL AUTO_INCREMENT,
    \`title\` varchar(45) NOT NULL,
    \`price\` double DEFAULT NULL,
    \`description\` varchar(255) NOT NULL,
    \`city\` varchar(255) NOT NULL,
    \`state\` varchar(45) NOT NULL,
    \`userId\` int unsigned NOT NULL,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`id_UNIQUE\` (\`id\`),
    KEY \`userId_idx\` (\`userId\`),
    CONSTRAINT \`userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
  );
  `
);

pool.promise().execute(
  `  
  CREATE TABLE IF NOT EXISTS \`images\` (
    \`id\` int unsigned NOT NULL AUTO_INCREMENT,
    \`image\` varchar(255) NOT NULL,
    \`productId\` int unsigned NOT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`id_UNIQUE\` (\`id\`),
    KEY \`postId_idx\` (\`productId\`),
    CONSTRAINT \`productId\` FOREIGN KEY (\`productId\`) REFERENCES \`products\` (\`id\`)
  );
  `
);

pool.promise().execute(
  `  
  CREATE TABLE IF NOT EXISTS \`favourites\` (
    \`id\` int unsigned NOT NULL AUTO_INCREMENT,
    \`userId\` int unsigned NOT NULL,
    \`productId\` int unsigned NOT NULL,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`id_UNIQUE\` (\`id\`),
    KEY \`userId_idx\` (\`userId\`),
    KEY \`productId_idx\` (\`productId\`),
    CONSTRAINT \`productFavouriteId\` FOREIGN KEY (\`productId\`) REFERENCES \`products\` (\`id\`),
    CONSTRAINT \`userFavouriteId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
  );  
  `
);

pool.promise().execute(
  `  
  CREATE TABLE IF NOT EXISTS \`cityfilters\` (
    \`id\` int unsigned NOT NULL AUTO_INCREMENT,
    \`userId\` int unsigned NOT NULL,
    \`city\` varchar(255) NOT NULL,
    \`state\` varchar(45) NOT NULL,
    \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`id_UNIQUE\` (\`id\`),
    KEY \`userId_idx\` (\`userId\`),
    CONSTRAINT \`userCityFiltersId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
  );  
  `
);

module.exports = pool.promise();
