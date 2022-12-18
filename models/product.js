const db = require('../util/database');

module.exports = class Product {
  constructor(id, title, price, description, userId) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.description = description;
    this.userId = userId;
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
    return db.execute(
      `SELECT P.*, U.name as 'userName', U.email as 'userEmail', U.om as 'userOm', U.phone as 'userPhone', U.photo as 'userPhoto' 
      FROM feiramil.products P 
      INNER JOIN feiramil.users U ON P.userId = U.id  
      WHERE P.id = ?;
      `,
      [id]
    );
  }

  static findByUserId(userId) {
    return db.execute(
      `SELECT P.*, U.name as 'userName', U.email as 'userEmail', U.om as 'userOm', U.phone as 'userPhone' 
      FROM feiramil.products P 
      INNER JOIN feiramil.users U ON P.userId = U.id  
      WHERE P.userId = ?;
      `,
      [userId]
    );
  }
};
