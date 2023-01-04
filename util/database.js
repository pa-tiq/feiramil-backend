const mysql = require('mysql2');
const keys = require('../keys.json');

//const pool = mysql.createPool({
//  host: 'localhost',
//  user: 'root',
//  database: 'feiramil',
//  password: keys.MySQL_password,
//});

const pool = mysql.createPool({
  host: keys.MySQL_docker_container,
  user: keys.MySQL_user,
  database: keys.MySQL_db,
  password: keys.MySQL_password,
});

module.exports = pool.promise();