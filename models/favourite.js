const db = require('../util/database');

module.exports = class Favourite {
  constructor(id, userId, productId) {
    this.id = id;
    this.userId = userId;
    this.productId = productId;
  }

  save() {
    return db.execute(
      'INSERT INTO favourites (userId, productId) VALUES (?, ?)',
      [this.userId, this.productId]
    );
  }

  static deleteById(id) {
    return db.execute('DELETE FROM favourites WHERE id = ?', [id]);
  }

  static deleteByProductId(productId) {
    return db.execute('DELETE FROM favourites WHERE productId = ?', [
      productId,
    ]);
  }

  static fetchAll() {
    return db.execute('SELECT * FROM favourites');
  }

  static findByProductId(productId) {
    return db.execute(
      'SELECT * FROM favourites WHERE favourites.productId = ?',
      [productId]
    );
  }

  static findByUserId(userId) {
    return db.execute('SELECT * FROM favourites WHERE favourites.userId = ?', [
      userId,
    ]);
  }

  static findByUserIdAndProductId(userId, productId) {
    return db.execute(
      'SELECT * FROM favourites WHERE favourites.userId = ? and favourites.productId = ?',
      [userId, productId]
    );
  }
};
