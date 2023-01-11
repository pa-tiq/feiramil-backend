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
  
  update() {
    return db.execute('UPDATE images SET image = ?, productId = ? WHERE id = ?', [
      this.image,
      this.productId,
      this.id
    ]);
  }

  static deleteById(id) {
    return db.execute('DELETE FROM images WHERE id = ?', [id]);
  }

  static deleteByProductIdAndPath(productId, path) {
    return db.execute(
    `
    DELETE FROM images 
    WHERE images.productId = ? and images.image = ?
    `, [productId, path]);
  }  
    
  static findByProductIdAndPath(productId, path) {
    return db.execute(
    `
    SELECT * FROM images 
    WHERE images.productId = ? and images.image = ?
    `, [productId, path]);
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
