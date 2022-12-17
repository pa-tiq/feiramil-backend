const db = require('../util/database');

module.exports = class User {
  constructor(id, email, password, name, om, phone) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name ? name : null;
    this.om = om ? om : null;
    this.phone = phone ? phone : null;
  }

  save() {
    return db.execute(
      'INSERT INTO users (email, password, name, om, phone) VALUES (?, ?, ?, ?, ?)',
      [this.email, this.password, this.name, this.om, this.phone]
    );
  }  
  update() {
    if(this.password === null){
      return db.execute(
        'UPDATE users SET email = ?, name = ?, om = ?, phone = ? WHERE id = ?',
        [this.email, this.name, this.om, this.phone, this.id]
      );
    } else {
      return db.execute(
        'UPDATE users SET email = ?, password = ?, name = ?, om = ?, phone = ? WHERE id = ?',
        [this.email, this.password, this.name, this.om, this.phone, this.id]
      );
    }
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

  static findByEmail(email) {
    return db.execute('SELECT * FROM users WHERE users.email = ?', [email]);
  }

  static findProductsByUserId(id) {
    return db.execute('SELECT * FROM products WHERE products.userId = ?', [id]);
  }

};
