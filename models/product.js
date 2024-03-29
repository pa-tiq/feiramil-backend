const db = require('../util/database');

module.exports = class Product {
  constructor(id, title, price, description, city, state, userId) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.description = description;
    this.city = city;
    this.state = state;
    this.userId = userId;
  }

  save() {
    return db.execute(
      `INSERT INTO products (title, price, description, city, state, userId) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [this.title, this.price, this.description, this.city, this.state, this.userId]
    );
  }
  update() {
    return db.execute(
      'UPDATE products SET title = ?, price = ?, description = ?, city = ?, state = ? WHERE id = ?',
      [this.title, this.price, this.description, this.city, this.state, this.id]
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
  
  static fetchAllExeptUserId(userId) {
    return db.execute(
      `SELECT P.*, U.name as 'userName', U.email as 'userEmail', 
      U.om as 'userOm', U.phone as 'userPhone', GROUP_CONCAT(I.image) as 'imagePaths' 
      FROM feiramil.products P 
      INNER JOIN feiramil.users U ON P.userId = U.id
      LEFT JOIN feiramil.images I on I.productId = P.id  
      WHERE P.userId != ?
      GROUP BY P.id;
      `,
      [userId]);
  }

  static findById(id) {
    return db.execute(
      `SELECT P.*, U.name as 'userName', U.email as 'userEmail', 
      U.om as 'userOm', U.phone as 'userPhone', U.photo as 'userPhoto', 
      GROUP_CONCAT(I.image) as 'imagePaths' 
      FROM feiramil.products P 
      INNER JOIN feiramil.users U ON P.userId = U.id
      LEFT JOIN feiramil.images I on I.productId = P.id  
      WHERE P.id = ?
      GROUP BY P.id;
      `,
      [id]
    );
  }

  static findByUserId(userId) {
    return db.execute(
      `SELECT P.*, U.name as 'userName', U.email as 'userEmail', 
      U.om as 'userOm', U.phone as 'userPhone', GROUP_CONCAT(I.image) as 'imagePaths' 
      FROM feiramil.products P 
      INNER JOIN feiramil.users U ON P.userId = U.id
      LEFT JOIN feiramil.images I on I.productId = P.id  
      WHERE P.userId = ?
      GROUP BY P.id;
      `,
      [userId]
    );
  }  
  
  static findFavouriteIdsByUserId(userId) {
    //return db.execute(
    //  `SELECT P.*, U.name as 'userName', U.email as 'userEmail', 
    //  U.om as 'userOm', U.phone as 'userPhone', I.image as 'imagePath' 
    //  FROM feiramil.products P
    //  INNER JOIN feiramil.users U ON P.userId = U.id
    //  INNER JOIN feiramil.favourites F ON F.productId = P.id
    //  LEFT JOIN feiramil.images I ON I.productId = P.id
    //  WHERE F.userId = ?;
    //  `,
    //  [userId]
    //);    
    return db.execute(
      `SELECT F.productId as 'productId'
      FROM feiramil.favourites F
      WHERE F.userId = ?;
      `,
      [userId]
    );
  }
};
