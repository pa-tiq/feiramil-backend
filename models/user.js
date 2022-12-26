const db = require('../util/database');

module.exports = class User {
  constructor(id, email, password, name, om, phone, photo, city, state) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name ? name : null;
    this.om = om ? om : null;
    this.phone = phone ? phone : null;
    this.photo = photo ? photo : null;
    this.city = city ? city : null;
    this.state = state ? state : null;
  }

  save() {
    return db.execute(
      'INSERT INTO users (email, password, name, om, phone, photo) VALUES (?, ?, ?, ?, ?, ?)',
      [this.email, this.password, this.name, this.om, this.phone, this.photo]
    );
  }  
  update() {
    if(this.password === null){
      return db.execute(
        'UPDATE users SET email = ?, name = ?, om = ?, phone = ?, city = ?, state = ? WHERE id = ?',
        [this.email, this.name, this.om, this.phone, this.city, this.state, this.id]
      );
    } else {
      return db.execute(
        `UPDATE users SET email = ?, password = ?, name = ?, om = ?, phone = ?, city = ?, state = ? 
        WHERE id = ?`,
        [this.email, this.password, this.name, this.om, this.phone,this.city, this.state, this.id]
      );
    }
  }
  updatePhoto() {
    return db.execute(
      'UPDATE users SET photo = ? WHERE id = ?',
      [this.photo, this.id]
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

  static findByEmail(email) {
    return db.execute('SELECT * FROM users WHERE users.email = ?', [email]);
  }

  static findProductsByUserId(id) {
    return db.execute('SELECT * FROM products WHERE products.userId = ?', [id]);
  }

};
