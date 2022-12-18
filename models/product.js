const db = require('../util/database');

module.exports = class Product {
  constructor(id, title, price, description, userId) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.description = description;
    this.userId = userId
  }

  save() {
    return db.execute(
      'INSERT INTO products (title, price, description, userId) VALUES (?, ?, ?, ?)',
      [this.title, this.price, this.description, this.userId]
    );
  }

  static deleteById(id) {
    return db.execute('DELETE FROM products WHERE id = ?', [id]);
  }

  static fetchAll() {
    return db.execute('SELECT * FROM products');
    //.then(([rows]) => {})
    //.catch((err) => console.log(err));
  } 

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    //.then(([products]) => { //the product is in products[0]  })
    //.catch((err) => console.log(err));
  }

  static findByUserId(userId) {
    return db.execute('SELECT * FROM products WHERE products.userId = ?', [userId]);
  }
};
