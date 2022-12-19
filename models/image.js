const db = require('../util/database');

module.exports = class Image {
  constructor(id, image, productId) {
    this.id = id;
    this.image = image;
    this.productId = productId;
  }

  save() {
    return db.execute('INSERT INTO images (image, productId) VALUES (?, ?)', [
      this.image,
      this.productId,
    ]);
  }

  static deleteById(id) {
    return db.execute('DELETE FROM images WHERE id = ?', [id]);
  }

  static deleteByProductId(productId) {
    return db.execute('DELETE FROM images WHERE productId = ?', [productId]);
  }

  static fetchAll() {
    return db.execute('SELECT * FROM images');
  }

  static findById(id) {
    return db.execute('SELECT * FROM images WHERE images.id = ?', [id]);
  }

  static findByProductId(productId) {
    return db.execute('SELECT * FROM images WHERE images.productId = ?', [
      productId,
    ]);
  }
};
