const mysql = require('mysql2');
const keys = require('../keys.json');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'feiramil',
  password: keys.MySQL_password,
});

module.exports = pool.promise();