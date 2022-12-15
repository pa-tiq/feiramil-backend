const db = require('../util/database');

module.exports = class User {
  constructor(id, email, password, name, om) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.om = om;
  }

  save() {
    return db.execute(
      'INSERT INTO users (email, password, name, imageUrl) om (?, ?, ?, ?)',
      [this.email, this.password, this.name, this.om]
    );
  }

  static deleteById(id) {
    return db.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  static fetchAll() {
    return db.execute('SELECT * FROM users');
  } 

  static findById(id) {
    return db.execute('SELECT * FROM users WHERE users.id = ?', [id]);
  }

  static findEmail(email) {
    return db.execute('SELECT * FROM users WHERE users.email = ?', [email]);
  }

  static findProducts(id) {
    return db.execute('SELECT * FROM products WHERE products.userId = ?', [id]);
  }

};
