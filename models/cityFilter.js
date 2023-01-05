const db = require('../util/database');

module.exports = class CityFilter {
  constructor(id, userId, city, state) {
    this.id = id;
    this.userId = userId;
    this.city = city;
    this.state = state;
  }

  save() {
    return db.execute('INSERT INTO cityfilters (userId, city, state) VALUES (?, ?, ?)', [
      this.userId,
      this.city,
      this.state,
    ]);
  }

  static deleteById(id) {
    return db.execute('SELECT * FROM cityfilters WHERE cityfilters.id = ?', [
      id,
    ]);
  }    
  static findByUserId(userId) {
    return db.execute('SELECT * FROM cityfilters WHERE cityfilters.userId = ?', [
      userId,
    ]);
  }  
  static findByUserIdCityState(userId,city,state) {
    return db.execute('SELECT * FROM cityfilters WHERE cityfilters.userId = ? and cityfilters.city = ? and cityfilters.state = ?', [
      userId, city, state
    ]);
  }
};
